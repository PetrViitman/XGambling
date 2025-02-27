import { ERROR_CODES } from "../presentation/Constants"
import { getBrowserCookie, setBrowserCookie } from "../presentation/Utils"

const protocol = window.location.protocol
const hostname = window.location.hostname
const PORT = 50000

export class RouterLogic {
	webAPI
	presentation
	presentedProjectName
	webSocket
	sessionId

	constructor({
		webAPI,
		presentation
	}) {
		this.webAPI = webAPI
		this.presentation = presentation
		this.initWebSocket()
	}

	initWebSocket() {
		const webSocket = new WebSocket('ws://' + hostname + ':' + PORT)

		webSocket.onopen = () => this.pingRouterServer()

		webSocket.onmessage = (message) => {
			const data = JSON.parse(message.data)
			switch (data.command) {
				case 'refresh':
					this.presentation.refreshIframe(this.presentedProjectName)
				break
			}
		}

		setInterval(() => {this.pingRouterServer()}, 10_000)

		this.webSocket = webSocket
	}

	async init() {
		await this.presentation?.init?.()

		this.entry()
	}

	async entry() {
		this.presentation.presentPendingResponse()


		const {webAPI, sessionId} = this
		const {name, errorCode} = await webAPI.userInfo({sessionId})
		
		if (errorCode) {
			return this.logIn(errorCode)
		}

		if(getBrowserCookie('router.project')) {
			return this.lobby(getBrowserCookie('router.project'))
		}

		const {selectedOption, data} = await this
			.presentation
			.presentMainMenu(name)

		switch (selectedOption) {
			case 'log out':
				this.presentation.presentPendingResponse()
				await webAPI.logOut({sessionId})
				return this.logIn()
			case 'lobby': return this.lobby(data)
			case 'accounts': return this.accounts(data)
			default: return this.lobby()
		}
	}

	async accounts() {
		this.presentation.presentPendingResponse()

		const {webAPI, sessionId} = this
		const {accounts, role, errorCode} = await webAPI.userInfo({sessionId})
		
		if (errorCode) {
			return this.logIn(errorCode)
		}

		const {selectedOption, data} = await this
			.presentation
			.presentAccounts({role, accounts})

		switch (selectedOption) {
			case 'deposit': return this.deposit(data)
			default: return this.entry()
		}
	}

	async deposit(account) {
		const {selectedOption, data} = await this.presentation.presentDeposit(account)

		if(selectedOption === 'back') {
			return this.accounts()
		}

		const {errorCode} = await this.webAPI.deposit({
			accountName: data.accountName,
			deposit: data.deposit,
			sessionId: this.sessionId
		})

		if(errorCode === ERROR_CODES.USER.ACCESS_DENIED) {
			return this.entry()
		}

		if(errorCode === ERROR_CODES.USER.INVALID_ACCOUNT) {
			return this.accounts()
		}

		if (errorCode) {
			return this.deposit(account)
		}

		this.accounts()
	}

	async lobby(presetProjectName) {
		getBrowserCookie('router.project')
		this.presentation.presentPendingResponse()

		const {webAPI, sessionId} = this
		const {errorCode, projects}  = await webAPI.getProjectsList({sessionId})

		if (errorCode) {
			return this.logIn(errorCode)
		}

		if (presetProjectName) {
			const lastHandProject = projects.find(({name}) => name === presetProjectName)
			if(lastHandProject) {
				return this.project(lastHandProject) 
			} else {
				setBrowserCookie('router.project', null)
				return this.entry()
			}
		}

		const {selectedOption, data} = await this
			.presentation
			.presentLobby(projects)

		switch (selectedOption) {
			case 'project': return this.project(data)
			default: return this.entry()
		}
	}

	async logIn(errorCode) {
		const {name, password} = await this.presentation.presentLogIn(errorCode)
	
		this.presentation.presentPendingResponse()
		const loginResult = await this.webAPI.logIn({name, password})
		if (loginResult.errorCode) {
			return this.logIn(loginResult.errorCode)
		}

		this.sessionId = loginResult.sessionId

		this.entry()
	}

	async project(project) {
		this.presentedProjectName = project.name
		setBrowserCookie('router.project', project.name)

		this.presentation.presentPendingResponse()
		const {port} = await fetch('http://' + hostname + ':' + PORT + '/project', {
				method: 'GET',
				headers: {
					'Content-Type': 'application/json',
					'projectName': project.name,
				},
		  	})
			.then(response => response.json())
			.then(data => data)

		this.projectPort = port

		this.pingRouterServer()

		await this.presentation.presentProject(
			protocol + '//' + hostname + ':' + port + '/index-production.html',
			project.name,
			this.sessionId
		)

		setBrowserCookie('router.project', null)
		this.presentedProjectName = undefined

		await fetch('http://' + hostname + ':' + PORT + '/home', {
			method: 'GET',
			headers: {
			  'Content-Type': 'application/json',
			},
		  })
		  .then(response => response.json())
		  .then(data => data)
		
		this.lobby()
	}

	pingRouterServer() {
		this.webSocket
			.send(
				JSON.stringify({
					command: 'ping',
					projectName: this.presentedProjectName
				})
			)
	}
}
