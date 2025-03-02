import { ERROR_CODES } from "../presentation/Constants"
import { getBrowserCookie, setBrowserCookie } from "../presentation/Utils"

const protocol = window.location.protocol
const hostname = window.location.hostname
const port = 10000

export class BusynessLogic {
	webAPI
	presentation
	sessionId

	constructor({
		webAPI,
		presentation
	}) {
		this.webAPI = webAPI
		this.presentation = presentation
	}

	async init() {
		await this.presentation?.init?.()
		this.lobby(true)
	}

	async lobby(isErrorExpected) {
		this.presentation.presentPendingResponse()

		const {webAPI} = this

		const projectsResponse = await webAPI.getProjectsList()

		if (projectsResponse.errorCode) {
			return this.logIn(isErrorExpected ? undefined : projectsResponse.errorCode)
		}

		const userResponse = await webAPI.userInfo()

		if (userResponse.errorCode) {
			return this.logIn(isErrorExpected ? undefined : userResponse.errorCode)
		}

		const {projects} = projectsResponse
		const {accounts, name} = userResponse
		const {selectedOption, data} = await this
			.presentation
			.presentLobby({projects, accounts, username: name})


		switch (selectedOption) {
			case 'project': return this.project(data)
			case 'logout': return this.logOut(data)
			default: return this.lobby()
		}
	}

	async logIn(errorCode) {
		const {username, password} = await this.presentation.presentLogIn(errorCode)
		this.presentation.presentPendingResponse()
		const loginResult = await this.webAPI.logIn({name: username, password})
		if(loginResult.errorCode) {
			return this.logIn(loginResult.errorCode)
		}

		this.sessionId = loginResult.sessionId
		window.sessionId = loginResult.sessionId

		this.lobby()
	}


	async logOut() {
		this.presentation.presentPendingResponse()
		await this.webAPI.logOut()
		this.lobby()
	}

	async project(project) {
		await this.presentation.presentProject(
			protocol + '//' + hostname + ':' + port + '/' + project.name.toLowerCase().replace(/ /g, '-'),
			project.name,
			this.sessionId
		)
	
		this.lobby()
	}
}
