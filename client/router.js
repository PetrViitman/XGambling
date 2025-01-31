const ROUTER_PUBLIC_PORT = 50000

const ROUTER_WEB_INTERFACE_PATH = './Router Web Interface/'
const ROUTER_WEB_INTERFACE_PORT = 50001

const LOCAL_NETWORK_DEV_PROJECT_PORT = 50002
const LOCAL_NETWORK_DEV_PROJECTS_SERVICES_PORT = 50004

const BACKEND_HOSTNAME = 'localhost'
const BACKEND_PORT = 40000


const path = require('path')
const dns = require('node:dns')
const os = require('node:os')
const http = require('http')
const fs = require('fs')
const WebSocket = require("./Router Web Interface/node_modules/ws");
const request = require(ROUTER_WEB_INTERFACE_PATH + '/node_modules/request')

let localNetworkIPAddress
const projectsServerMap = {}
let longpollResponses = []

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

	const {createServer} = await import(ROUTER_WEB_INTERFACE_PATH + 'node_modules/vite/dist/node/index.js')

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
		const data = fs.readFileSync(ROUTER_WEB_INTERFACE_PATH + 'cookies.json') ?? {}
		const cookies = JSON.parse(data)

		return cookies
	} catch (_) {
		fs.writeFileSync(ROUTER_WEB_INTERFACE_PATH + 'cookies.json', '')
	}
	
	return {}
}

const getCookie = (username) => {
	return getCookies()[username] ?? ''
}

const saveCookie = (username, cookie) => {
	const cookies = getCookies()
	cookies[username] = cookie

	fs.writeFileSync(ROUTER_WEB_INTERFACE_PATH + 'cookies.json', JSON.stringify(cookies))
}

const startRouterPublicDevServer = (ipAddress) => {
	// ЗАПРОСЫ ОТ ROUTER WEB INTERFACE...
	http.createServer(async function (req, res) {
		const url = req.url
		if (url === '/home') {
			res.writeHead(200, { 'Content-Type': 'application/json' })
			res.write(JSON.stringify({ message: 'Success' }))
			res.end()

		} else if (url === '/ping') {
			const serversGroup = projectsServerMap[req.headers.projectname]

			if(serversGroup) {
				serversGroup.pingTimestamp = Date.now()
			}

			res.writeHead(200, { 'Content-Type': 'application/json' })
			res.write(JSON.stringify({ message: 'pong' }))
			res.end()

		} else if (url === '/longpollReload') {
			res.writeHead(200, {
				'Content-Type': 'application/json',
				'Connection': 'keep-alive'
			})

			longpollResponses.push(res)
		} else if (url === '/project') {
			projectIndex = (projectIndex + 1) % 100
			const {name, viteServer, tunnelPort} = await getProjectServersGroup({
				name: req.headers.projectname,
				pathToProject: './projects/' + req.headers.projectname + '/',
				pathToProjectConfigFileName: './.builds/configs/config-production-build.js',
				port: 50100 + projectIndex
			})

			if(!viteServer.isPatched) {
				// перехват сигнала на перезагрузку страницы
				const originalSend = viteServer.ws.send
				viteServer.ws.send = function (payload) {
					if (payload.type === 'full-reload') {
						longpollResponses.forEach((response, i) => {
							response.write(JSON.stringify({ projectName: name }))
							response.end()
						})

						longpollResponses = []
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
			req.pipe(request('http://localhost:' + ROUTER_WEB_INTERFACE_PORT + req.url)).pipe(res)
		}
	})
	.listen(ROUTER_PUBLIC_PORT, ipAddress)
	// ...ЗАПРОСЫ ОТ ROUTER WEB INTERFACE

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
					Cookie: getCookie(requestIp) ?? '' // добавляем сохранённую ранее куку
				},
			}
		)

		proxy.on('response', (proxyRes) => {
			if (proxyRes.headers['set-cookie']) {
				saveCookie(requestIp, proxyRes.headers['set-cookie'])
				res.setHeader('Set-Cookie', proxyRes.headers['set-cookie'])
			}

			proxyRes.pipe(res)
		})
	
		req.pipe(proxy).pipe(res)

	}).listen(LOCAL_NETWORK_DEV_PROJECTS_SERVICES_PORT, ipAddress)
	// ...ПРОКСИРОВАНИЕ ЗАПРОСОВ К СЕРВЕРУ БЕКЕНДА
}

getLocalNetworkIPAdress().then((ipAddress) => {
	localNetworkIPAddress = ipAddress
	getProjectServersGroup({
		pathToProject: ROUTER_WEB_INTERFACE_PATH,
		port: ROUTER_WEB_INTERFACE_PORT,
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


setInterval(() => {
	const timestamp = Date.now()
	Object.entries(projectsServerMap).forEach(([name, serversGroup]) => {
		if (timestamp - serversGroup.pingTimestamp > 120_000) {
			serversGroup.viteServer.close()
			serversGroup.tunnelServer.close()
			delete projectsServerMap[name]
		}
	})

	longpollResponses.forEach(response => {
		response.write(' ')
	})

	longpollResponses = []
}, 60_000)

process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = 0
const originalEmit = process.emit

process.emit = function (name, ...args) {
	if (name === `warning`) return false
	
	return originalEmit.apply(process, arguments)
}