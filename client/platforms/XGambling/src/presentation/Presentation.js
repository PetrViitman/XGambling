import { Application, settings, MIPMAP_MODES, Ticker, BitmapFont, SCALE_MODES } from "pixi.js"
import { AdaptiveContainer } from "./views/adaptiveDesign/AdaptiveContainer"
import { Timeline } from "./timeline/Timeline"
import { mountVueUI } from "./views/vueUI/VueUI.vue"
import { VueUIContainer } from "./views/vueUI/VueUIContainer"
import { TextField } from "./views/text/TextField"
import { HTMLContainer } from "./views/adaptiveDesign/HTMLContainer"
import { IframeView } from "./views/iframe/IframeView"
import { getAssets, getPreloadingAssets } from "./Assets"
import { LogoView } from "./views/logo/LogoView"
import { BackgroundView } from "./views/background/BackgroundView"
import { BackgroundBCPView } from "./views/BackgroundBCPView"
import { FoldersPoolView } from "./views/FoldersPoolView"


settings.MIPMAP_MODES = MIPMAP_MODES.ON

export class Presentation {
	pixiApplication
	fadeTimeline = new Timeline

	constructor({
		isLTRTextDirection = true,
		dictionary = {},
	}) {
		this.isLTRTextDirection = isLTRTextDirection
	
		TextField.isLTRTextDirection = isLTRTextDirection
		this.dictionary = dictionary

		this.pixiApplication = new Application({
			background: 0x000,
		})
		this.pixiApplication.view.setAttribute('touch-action', 'none')
		this.pixiApplication.renderer.plugins.accessibility.destroy();
		this.pixiApplication.renderer.resolution = window.devicePixelRatio
		delete this.pixiApplication.renderer.plugins.accessibility;

		this.pixiApplication.stage.visible = false

		// CANVAS APPENDING...
		Object.assign(this.pixiApplication.view.style, {
			width: '100%',
			height: '100%',
			position: 'absolute',
		})

		const wrapperHTMLElement = document.getElementById('projectWrapper')
		wrapperHTMLElement.appendChild(this.pixiApplication.view)
		wrapperHTMLElement.focus()
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

		this.vueContext = mountVueUI('projectWrapper')

		
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

		let assets = await getPreloadingAssets()
		assets = await getAssets()

		this.initBitmapFonts()
		this.initIframe()

		const backgroundView = new BackgroundView(assets)
		stage.addChild(backgroundView)

		const background2View = new BackgroundBCPView(assets)
		stage.addChild(background2View)

		const logoView = new LogoView(assets)
		stage.addChild(logoView)

		const foldersPoolView = new FoldersPoolView(assets)
		this.foldersPoolView = stage.addChild(foldersPoolView)

		this.initVueUIContainer()

		this.presentIntro()
		

		this.vueContext.refresh({activePopupName: ''})

		AdaptiveContainer.onResize()
	}

	initVueUIContainer() {
		const {
			vueContext,
			isMobileDevice,
			pixiApplication: {stage}
		} = this
		stage.addChild(new VueUIContainer({vueContext, isMobileDevice}))
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
			fontFamily: "Tahoma",
			fontWeight: 'bold',
			fontSize: 256,
			fill: ['#FFFFFF'],
		}
		BitmapFont.from(
			"default",
			TextField.fontStyles.default,
			{
				chars: '> 0123456789x:,./abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ∞-|½×='
			}
		)
		
	}

	// API...
	destroy() {
		AdaptiveContainer.uninstall()
		Ticker.shared.stop()
		this.pixiApplication.stage.destroy(true)
		Timeline.destroy()
	}

	presentIntro() {
		
	}

	async presentLogIn(errorCode) {
		await this.presentFade(false)
		
		this.vueContext.refresh({
			activePopupName: 'login',
			errorCode,
			isUIVisible: true,
		})

		return this.vueContext.getUserInput()
	}

	async presentLobby({username, accounts, projects}) {
		this.vueContext.refresh({
			username,
			accounts,
			activePopupName: '',
			projectURL: undefined,
			isUIVisible: true,
		})

		await this.presentFade(true)

		return Promise.any([
			this.vueContext.getUserInput(),
			new Promise(resolve => {
				this.foldersPoolView.resetFolders(projects, resolve)
				AdaptiveContainer.onResize()
			})
		])
	}

	async presentPendingResponse() {
		
	}


	async presentProject(url, name) {
		await this.presentFade(false)
		
		this.vueContext
			.refresh({
				projectName: name,
				projectURL: url + window.location.search,
				activePopupName: 'iframe'
			})
	
		await this.vueContext.getUserInput()
	}

	presentFade(isVisible = true) {
		const {stage} = this.pixiApplication

		return this
			.fadeTimeline
			.deleteAllAnimations()
			.addAnimation({
				duration: 300,
				onStart: () => {
					stage.visible = !isVisible
				},
				onProgress: progress => {
					const finalProgress = isVisible ? progress : 1 - progress
					stage.alpha = finalProgress
					this.vueContext.refresh({uiAlpha: 1 - finalProgress})
				},
				onFinish: () => {
					stage.visible = isVisible
				}
			})
			.windToTime(1)
			.play()
	}
	// ...API
}