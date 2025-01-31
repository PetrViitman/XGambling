import { ERROR_CODES } from "../presentation/Constants"
import { getBrowserCookie, setBrowserCookie } from "../presentation/Utils"

const protocol = window.location.protocol
const hostname = window.location.hostname
const port = 50004
const PORT = 50000

export class RouterLogic {
	webAPI
	presentation
	presentedProjectName

	constructor({
		webAPI,
		presentation
	}) {
		this.webAPI = webAPI
		this.presentation = presentation
		this.longpollRouterServer()
		this.pingRouterServer()
		setInterval(() => {this.pingRouterServer()}, 60_000)

		document.addEventListener('keyup', () => {
		//	this.longpollRouterServer()
		})
	}

	async init() {
		await this.presentation?.init?.()

		this.entry()
	}

	async entry() {
		this.presentation.presentPendingResponse()


		const {webAPI} = this
		const {name, errorCode} = await webAPI.userInfo()
		
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
				await webAPI.logOut()
				return this.logIn()
			case 'lobby': return this.lobby(data)
			case 'accounts': return this.accounts(data)
			default: return this.lobby()
		}
	}

	async accounts() {
		this.presentation.presentPendingResponse()

		const {webAPI} = this
		const {accounts, role, errorCode} = await webAPI.userInfo()
		
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
			deposit: data.deposit
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

		const {webAPI} = this
		const {errorCode, projects}  = await webAPI.getProjectsList()

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
		if(loginResult.errorCode) {
			return this.logIn(loginResult.errorCode)
		}

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

		await this.presentation.presentProject(
			protocol + '//' + hostname + ':' + port + '/index-production.html',
			project.name
		)

		setBrowserCookie('router.project', null)

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

	async longpollRouterServer() {
		const longpollRequest =  fetch('http://' + hostname + ':' + PORT + '/longpollReload', {
				method: 'GET',
				headers: {
				'Content-Type': 'application/json',
				},
			})
			.then(response => response.json())
			.then(data => data)


		const {projectName} = await longpollRequest

		if(projectName === this.presentedProjectName) {
			this.presentation.refreshIframe(projectName)
		}

		return this.longpollRouterServer()
	}

	pingRouterServer() {
		fetch('http://' + hostname + ':' + PORT + '/ping', {
			method: 'GET',
			headers: {
				'Content-Type': 'application/json',
				'projectName': getBrowserCookie('router.project'),
			},
		  })
	}
}
