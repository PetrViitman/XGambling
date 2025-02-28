function dropAllClients() {
	Object.entries(projectsServerMap).forEach(([name, serversGroup]) => {
		serversGroup.viteServer.close()
		serversGroup.tunnelServer.close()
		delete projectsServerMap[name]
	})

	webSocketServer.clients.forEach(webSocket => {
		webSocket.send(JSON.stringify({ command: 'drop' }))
	})
}

process.on('uncaughtException', async (err) => {
	console.error(err)
	webSocketServer.close()

	const promises = []
	Object.entries(projectsServerMap).forEach(([name, serversGroup]) => {
		promises.push(serversGroup.viteServer.close())
		promises.push(serversGroup.tunnelServer.close())
		delete projectsServerMap[name]
	})
})

process.on('SIGINT', () => {
	dropAllClients()
	process.exit(0)
})

process.on('SIGTERM', () => {
	dropAllClients()
	process.exit(0)
})


const ROUTER_PUBLIC_PORT = 5000

const ROUTER_PATH = './router/'
const ROUTER_PORT = 5001

const LOCAL_NETWORK_DEV_PROJECTS_SERVICES_PORT = 5004

const BACKEND_HOSTNAME = 'localhost'
const BACKEND_PORT = 10000


const path = require('path')
const dns = require('node:dns')
const os = require('node:os')
const http = require('http')
const fs = require('fs')
const WebSocket = require("./router/node_modules/ws")
const request = require(ROUTER_PATH + '/node_modules/request')

let localNetworkIPAddress
let webSocketServer
const projectsServerMap = {}

let projectIndex = 0

const getProjectServersGroup = async ({
	name,
	pathToProject,
	pathToProjectConfigFileName = 'local-dev-server-config.js',
	port,
	isPingRequired = true
}) => {
	const serverId = name ?? pathToProject

	if (projectsServerMap[serverId]) {
		return projectsServerMap[serverId]
	}

	const {createServer} = await import(ROUTER_PATH + 'node_modules/vite/dist/node/index.js')

	const viteServer = await createServer({
		configFile: path.resolve(pathToProject ?? __dirname, pathToProjectConfigFileName),
		root: path.resolve(pathToProject ?? __dirname),
		server: { port }
	})
	
	await viteServer.listen()

	// ТОННЕЛЬ ДЛЯ ЗАПРОСОВ СТАТИКИ ПРОЕКТА...
	const tunnelPort = port + 100
	const tunnelServer = http.createServer(async function (req, res) {
		req.pipe(request('http://localhost:' + port + req.url)).pipe(res)
	}).listen(tunnelPort, localNetworkIPAddress)
	// ...ТОННЕЛЬ ДЛЯ ЗАПРОСОВ СТАТИКИ ПРОЕКТА

	const serversGroup = {
		name,
		viteServer,
		tunnelServer,
		tunnelPort,
		pingTimestamp: isPingRequired ? Date.now() : undefined,
	}

	projectsServerMap[serverId] = serversGroup

	return serversGroup
}


const getLocalNetworkIPAdress = () => {
	return new Promise(resolve => {
		dns.lookup(os.hostname(), { family: 4 }, (error, address) => {
			if (error) {
				resolve('no local network ip address found')
			} else {
				resolve(address)
			}
		})
	})
}

const getCookies = () => {
	try {
		const data = fs.readFileSync(ROUTER_PATH + 'cookies.json') ?? {}
		const cookies = JSON.parse(data)

		return cookies
	} catch (_) {
		fs.writeFileSync(ROUTER_PATH + 'cookies.json', '')
	}
	
	return {}
}

const getCookie = (username) => {
	return getCookies()[username] ?? ''
}

const saveCookie = (username, cookie) => {
	const cookies = getCookies()
	cookies[username] = cookie

	fs.writeFileSync(ROUTER_PATH + 'cookies.json', JSON.stringify(cookies))
}

const startRouterPublicDevServer = (ipAddress) => {
	// ЗАПРОСЫ ОТ router...
	const server = http.createServer(async function (req, res) {
		const url = req.url
		if (url === '/home') {
			res.writeHead(200, { 'Content-Type': 'application/json' })
			res.write(JSON.stringify({ message: 'Success' }))
			res.end()

		} else if (url === '/project') {
			projectIndex = (projectIndex + 1) % 100
			const {name, viteServer, tunnelPort} = await getProjectServersGroup({
				name: req.headers.projectname,
				pathToProject: './projects/' + req.headers.projectname + '/',
				pathToProjectConfigFileName: './.builds/configs/config-production-build.js',
				port: 5100 + projectIndex
			})

			if(!viteServer.isPatched) {
				// перехват сигнала на перезагрузку страницы
				const originalSend = viteServer.ws.send
				viteServer.ws.send = function (payload) {
					if (payload.type === 'full-reload') {
						webSocketServer.clients.forEach(webSocket => {
							if (webSocket.projectName === name) {
								webSocket.send(
									JSON.stringify({
										command: 'refresh',
									})
								)
							}
						})
					}
					originalSend.call(this, payload)
				}
				viteServer.isPatched = true

				await new Promise(resolve => {
					const interval = setInterval(() => {
						if (viteServer?.config?.server?.port) {
							clearInterval(interval)
							resolve(viteServer.config.server.port)
						}
					}, 1)
				})
			}

			res.writeHead(200, { 'Content-Type': 'application/json' })
			res.write(JSON.stringify({ port: tunnelPort }))
			res.end()

		} else {
			req.pipe(request('http://localhost:' + ROUTER_PORT + req.url)).pipe(res)
		}
	})

	server.listen(ROUTER_PUBLIC_PORT, ipAddress)

	webSocketServer = new WebSocket.Server({ server })
	webSocketServer.on('connection', (webSocket, request) => {
		const recoveredSessionId = getCookie(request.socket.remoteAddress)

		recoveredSessionId && webSocket.send(
			JSON.stringify({
				command: 'sessionId',
				sessionId: recoveredSessionId
			})
		)
		
		webSocket.on('message', (message) => {
			const data = JSON.parse(message)

			switch(data.command) {
				case 'ping':
					const serversGroup = projectsServerMap[data.projectName]
					webSocket.projectName = data.projectName

					if(serversGroup) {
						serversGroup.pingTimestamp = Date.now()
					}
				break
				case 'sessionId':
					saveCookie(request.socket.remoteAddress, data.sessionId)
				break
			}

			webSocket.send(JSON.stringify({command: 'pong'}))
		})
	})
	// ...ЗАПРОСЫ ОТ router

	// ПРОКСИРОВАНИЕ ЗАПРОСОВ К СЕРВЕРУ БЕКЕНДА...
	http.createServer(function (req, res) {
		res.setHeader('Access-Control-Allow-Origin', req.headers.origin)
		res.setHeader('Access-Control-Allow-Methods', 'OPTIONS, GET, POST')
		res.setHeader('Access-Control-Max-Age', 2592000)
		res.setHeader('Access-Control-Allow-Credentials', 'true')

		const requestIp = req.socket.remoteAddress
		const proxy = request(
			'https://' + BACKEND_HOSTNAME + ':' + BACKEND_PORT + req.url,
			{
				port: BACKEND_PORT,
				host: BACKEND_HOSTNAME,
				path: req.url.pathName,
				headers: {
					...req.headers,
					sessionid: getCookie(requestIp) ?? '' // добавляем сохранённую ранее куку
				},
			}
		)

		proxy.on('response', (proxyResponse) => {
			proxyResponse.pipe(res)
		})
	
		req.pipe(proxy).pipe(res)

	}).listen(LOCAL_NETWORK_DEV_PROJECTS_SERVICES_PORT, ipAddress)
	// ...ПРОКСИРОВАНИЕ ЗАПРОСОВ К СЕРВЕРУ БЕКЕНДА
}

function start() {
	getLocalNetworkIPAdress().then((ipAddress) => {
		localNetworkIPAddress = ipAddress
		
		getProjectServersGroup({
			pathToProject: ROUTER_PATH,
			port: ROUTER_PORT,
			isPingRequired: false
		})

		startRouterPublicDevServer(ipAddress)
		const finalURL = 'http://' + ipAddress + ':' + ROUTER_PUBLIC_PORT

		console.log(
			'\n 💻📱🖥️🪢🛜\n',
			'\n\x1b[38;2;183;251;82m 🖧  \x1b[48;2;183;251;82m\x1b[38;2;0;0;0m' + finalURL + '\x1b[0m\n',
			'\n'
		)
	})
}


setInterval(() => {
	const timestamp = Date.now()
	Object.entries(projectsServerMap).forEach(([name, serversGroup]) => {
		if (timestamp - serversGroup.pingTimestamp > 30_000) {
			serversGroup.viteServer.close()
			serversGroup.tunnelServer.close()
			delete projectsServerMap[name]
		}
	})
}, 15_000)

process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = 0
const originalEmit = process.emit

process.emit = function (name, ...args) {
	if (name === `warning`) return false
	
	return originalEmit.apply(process, arguments)
}


start()
