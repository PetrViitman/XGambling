import { Application, settings, MIPMAP_MODES, Ticker, BitmapFont } from "pixi.js"
import { AdaptiveContainer } from "./views/adaptiveDesign/AdaptiveContainer"
import { Timeline } from "./timeline/Timeline"
import { formatMoney } from "./Utils"

import { TextField } from "./views/text/TextField"
import { TerminalView } from "./views/TerminalView"
import { HTMLContainer } from "./views/adaptiveDesign/HTMLContainer"
import { DEFAULT_FONT_COLOR } from "./Constants"
import { IframeView } from "./views/iframe/IframeView"


settings.MIPMAP_MODES = MIPMAP_MODES.ON


export class Presentation {
	pixiApplication
	isLTRTextDirection
	iframeView
	terminalView

	constructor({
		isLTRTextDirection = true,
		dictionary = {},
	}) {
		this.isLTRTextDirection = isLTRTextDirection
	
		TextField.isLTRTextDirection = isLTRTextDirection
		this.dictionary = dictionary

		this.pixiApplication = new Application({
			background: 0x000000,
		})
		this.pixiApplication.view.setAttribute('touch-action', 'none')
		this.pixiApplication.renderer.plugins.accessibility.destroy();
		this.pixiApplication.renderer.resolution = window.devicePixelRatio
		delete this.pixiApplication.renderer.plugins.accessibility;


		// CANVAS APPENDING...
		Object.assign(this.pixiApplication.view.style, {
			width: '100%',
			height: '100%',
			position: 'absolute',
		})


		const wrapperHTMLElement = document.body
		wrapperHTMLElement.appendChild(this.pixiApplication.view)
		wrapperHTMLElement.focus()


		//editor.focus();		
		// ...CANVAS APPENDING

		
		let timeStampFPS = 0
		Ticker.shared.add(() => {
			Timeline.update()

			const currentTime = Date.now()
			if(currentTime - timeStampFPS < 1000) return

			timeStampFPS = currentTime
		})
		
		
		AdaptiveContainer.install([this.pixiApplication], true)
		HTMLContainer.install(this.pixiApplication)
		
		return this
	}

	async init() {
		const {stage} = this.pixiApplication

		// FETCHING DICTIONARY...
		//const prefix = '../../public/translations/'
		//if (!locales[prefix + this.languageCode + '.json'])
		//	this.languageCode = 'en'

		//this.dictionary = await locales[prefix + this.languageCode + '.json']()
		// ...FETCHING DICTIONARY

		this.initBitmapFonts()
		this.initTerminal()
		this.initIframe()

		AdaptiveContainer.onResize()

		this.presentIntro()
	}

	initTerminal() {
		const {pixiApplication: {stage}} = this
		const terminalView = new TerminalView()
		stage.addChild(terminalView)

		this.terminalView = terminalView
	}

	initIframe() {
		const {pixiApplication: {stage}} = this
		this.iframeView = new IframeView()
		stage.addChild(this.iframeView)
	}

	async initBitmapFonts() {
		const bitmapPhrases = []
		Object.values(this.dictionary).map(text => bitmapPhrases.push(text))

		TextField.fontStyles.default =  {
			fontFamily: "Lucida Console",
			fontWeight: 'bold',
			fontSize: 256,
			fill: ['#FFFFFF'],
		}

		if(this.isLTRTextDirection) {
			BitmapFont.from(
				"default",
				TextField.fontStyles.default,
				{
					chars: '> 0123456789x:,./abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ∞-|½×='
				}
			)
		}
	}

	// API...
	destroy() {
		AdaptiveContainer.uninstall()
		Ticker.shared.stop()
		this.pixiApplication.stage.destroy(true)
		Timeline.destroy()
	}

	presentIntro() {
		this.terminalView.presentMessages([
			'Welcome to lobby-terminal'
		])
		this.terminalView.presentPendingResponse()
	}

	async presentLogIn(errorCode) {
		const messages = [
			{qrCode: {url: window.location.href}},
			'please log in'
		]

		if(errorCode) {
			messages.unshift({text: errorCode, color: 0xFF0000})
		}
		
		this.terminalView.presentMessages(messages)

		const credentialsPreset = await import("../../credentials.json")

		const name = await this.terminalView.getUserInput({
			prefix: 'username:',
			preset: credentialsPreset.name
		})
		
		const password = await this.terminalView.getUserInput({
			prefix: 'password:',
			isHidden: true,
			preset: credentialsPreset.password
		})

		return {name, password}
	}

	async presentMainMenu(name) {
		return new Promise(resolve => {
			const messages = [
				'logged in as: ' + name,
				{qrCode: {url: window.location.href}},
				{
					text: 'accounts',
					color: 0x000,
					highlight: DEFAULT_FONT_COLOR,
					onClick: () => {
						resolve(resolve({selectedOption: 'accounts'}))
					}
				},
				{
					text: 'lobby',
					color: 0x000,
					highlight: DEFAULT_FONT_COLOR,
					onClick: () => {
						resolve(resolve({selectedOption: 'lobby'}))
					}
				},
			]
	
			messages.push(' ')
			messages.push({
				text: 'log out',
				color: 0x000,
				highlight: DEFAULT_FONT_COLOR,
				onClick: () => {
					resolve(resolve({selectedOption: 'log out'}))
				}
			})
			this.terminalView.setInputVisible(false)
			this.terminalView.presentMessages(messages)
		})
	}

	async presentAccounts({accounts, role}) {
		return new Promise(resolve => {
			const messages = ['your accounts:']
	
			accounts.forEach(account => {
				const {name, balance, currencyCode} = account
				
				messages.push({
					text: name + '║' + formatMoney({value: balance, currencyCode}),
					color: role ? 0x000 : DEFAULT_FONT_COLOR,
					highlight: role ? DEFAULT_FONT_COLOR : 0x000,
					onClick: role
							? () => {
								resolve(resolve({selectedOption: 'deposit', data: account}))
							}
							: undefined
				})
			})

			role && messages.push('click any to deposit')

			messages.push(' ')
			messages.push({
				text: ' ← ',
				color: 0x000,
				highlight: DEFAULT_FONT_COLOR,
				onClick: () => {
					resolve(resolve({selectedOption: 'back'}))
				}
			})
			this.terminalView.setInputVisible(false)
			this.terminalView.presentMessages(messages)
		})
	}

	presentDeposit(account ,errorCode) {
		return new Promise(async (resolve) => {
			const messages = [
				account.name + '║' + formatMoney({value: account.balance, currencyCode: account.currencyCode}),
			]

			if(errorCode) {
				messages.unshift({text: errorCode, color: 0xFF0000})
			}

			messages.push({
				text: ' ← ',
				color: 0x000,
				highlight: DEFAULT_FONT_COLOR,
				onClick: () => {
					resolve(resolve({selectedOption: 'back'}))
				}
			})
			messages.push(' ')
			
			this.terminalView.presentMessages(messages)

			const deposit = await this.terminalView.getUserInput({prefix: 'deposit:'})

			resolve({
				selectedOption: 'deposit',
				data: {
					accountName: account.name,
					deposit: Number(deposit)}
				})
			
		})
	}

	async presentLobby(projects) {
		return new Promise(resolve => {
			const messages = [
				'projects:',
			]
	
			projects.forEach((project, i) => messages.push({
				text: project.name,
				color: 0x000,
				highlight: DEFAULT_FONT_COLOR,
				onClick: () => {
					resolve({selectedOption: 'project', data: project})
				}
			}))
	
			messages.push(' ')
			messages.push({
				text: ' ← ',
				color: 0x000,
				highlight: DEFAULT_FONT_COLOR,
				onClick: () => {
					resolve(resolve({selectedOption: 'back'}))
				}
			})
			this.terminalView.setInputVisible(false)
			this.terminalView.presentMessages(messages)
		})
	}

	async presentPendingResponse() {
		this.terminalView.presentMessages(['please wait'])
		this.terminalView.presentPendingResponse()
	}

	presentProject(url, name, sessionId) {
		this.presentPendingResponse()
		
		return this.iframeView.presentProject(
			url + window.location.search,
			name,
			sessionId)
	}

	refreshIframe() {
		this.iframeView.refresh()
	}
	// ...API
}