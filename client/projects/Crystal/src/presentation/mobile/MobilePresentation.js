import { Application, settings, MIPMAP_MODES, Ticker, BitmapFont } from "pixi.js"
import { AdaptiveContainer } from "./views/adaptiveDesign/AdaptiveContainer"
import { Timeline } from "./timeline/Timeline"
import { BackgroundView } from "./views/BackgroundView"
import { getPreloadingAssets, getAssets } from "./Assets"
import { ReelsView } from "./views/reels/ReelsView"
import { mountVueUI } from "./views/vueUI/VueUI.vue"
import { VueUIContainer } from "./views/vueUI/VueUIContainer"
import { formatMoney, getRandomLoseReels } from "./Utils"
import { TURBO_MODE_TIME_SCALE } from "./Constants"
import { LoadingScreen } from "./views/loadingScreen/LoadingScreen"
import { getVFXLevel } from "./Benchmark"
import { InteractiveLayerView } from "./views/InteractiveLayerView"
import { CoinRainView } from "./views/reels/coinRain/CoinRainView"
import { getDictionary } from "../Dictionary"
import { TextField } from "./views/text/TextField"

settings.MIPMAP_MODES = MIPMAP_MODES.ON

export class MobilePresentation {
	assets
	pixiApplication
	loadingScreen
	backgroundView
	reelsView
	interactiveLayerView
	vueContext
	remainingAutoSpinsCount = 0
	isTurboMode
	vfxLevel
	isMobileDevice
	languageCode
	dictionary
	isLTRTextDirection

	setup({
		wrapperHTMLElementId,
		customVFXLevel,
		customUIOption,
		languageCode,
		backgroundColor = 0x1f1f5c,
		dictionary
	}) {
		this.dictionary = dictionary
		this.languageCode = languageCode
		this.vueContext = mountVueUI(wrapperHTMLElementId)
		this.pixiApplication = new Application({background: backgroundColor})
		this.vfxLevel = customVFXLevel

		// UI OPTION DETECT...
		this.isMobileDevice =
			'ontouchstart' in window
			|| navigator.maxTouchPoints > 0 
			|| navigator.msMaxTouchPoints > 0
		
		if (customUIOption === 'mobile')
			this.isMobileDevice = true
		else if (customUIOption === 'desktop')
			this.isMobileDevice = false
		// ...UI OPTION DETECT

		// CANVAS APPENDING...
		Object.assign(this.pixiApplication.view.style, {
			width: '100%',
			height: '100%',
			position: 'absolute',
			'z-index': 1,
		})
		document.getElementById(wrapperHTMLElementId)
				.appendChild(this.pixiApplication.view)
		// ...CANVAS APPENDING

		AdaptiveContainer.install(this.pixiApplication, true)
		
		let timeStampFPS = 0
		Ticker.shared.add(() => {
			Timeline.update()

			const currentTime = Date.now()
			if(currentTime - timeStampFPS < 1000) return

			timeStampFPS = currentTime
			this.vueContext.refresh({FPS: Math.trunc(Ticker.shared.FPS)})
		})


		return this
	}

	async init({
		initialReels = getRandomLoseReels(),
		currencyCode,
		betsOptions,
		betIndex,
		balance,
		coefficients
	}) {
		// FETCHING DICTIONARY...
		if (!this.dictionary) {
			this.dictionary =  await getDictionary(this.languageCode)
			this.isLTRTextDirection = this.dictionary.isLTRTextDirection
			TextField.isLTRTextDirection = this.isLTRTextDirection
		}
		// ...FETCHING DICTIONARY

		// ADJUSTING RESOLUTION...
		const highestResolution = window.devicePixelRatio
		const lowestResolution = this.isMobileDevice ? Math.min(2, highestResolution) : 1
		const resolutionDelta = highestResolution - lowestResolution

		if (this.vfxLevel) {
			this.pixiApplication.renderer.resolution = this.vfxLevel
		} else {
			const vfxLevel = await getVFXLevel(this.pixiApplication)

			this.pixiApplication.renderer.resolution = lowestResolution + resolutionDelta * vfxLevel
			this.vfxLevel = vfxLevel
		}
		// ...ADJUSTING RESOLUTION


		const {stage} = this.pixiApplication


		this.assets = await getPreloadingAssets()
		this.initBitmapFonts()
		this.initLoadingScreen()
		AdaptiveContainer.onResize()

		this.assets = await getAssets((progress) => {
			this.loadingScreen.setProgress(progress)
		})


		this.initBackground()
		this.initReels({initialReels, coefficients})
		this.initCoinRain(this.assets)
		this.initVueUIContainer()
		stage.addChild(this.loadingScreen)
		this.initInteractiveLayer()
		AdaptiveContainer.onResize()
		await this.reelsView.preRenderSymbols()

		this.vueContext.refresh({
			dictionary: this.dictionary,
			currencyCode,
			betsOptions: betsOptions.map(value => formatMoney(value)),
			autoplayOptions: [5, 10, 25, 50, 100, Infinity],
			balance: formatMoney(balance),
			payout: formatMoney(0),
			betIndex,
		})
		await this.loadingScreen.hide((progress) => {
			this.vueContext.refresh({uiAlpha: progress})
		})

		this.loadingScreen.destroy()

		this.vueContext.onAutoplaySpinsCountChange = (spinsCount) => {
			this.remainingAutoSpinsCount = spinsCount
		}

		this.vueContext.onTurboToggle = (isTurboMode) => {
			this.gamePlayTimeScale = isTurboMode ? TURBO_MODE_TIME_SCALE : 1
			this.isTurboMode = isTurboMode
			this.setGamePlayTimeScale()
		}

		this.vueContext.onSkipRequested = () => { this.skip() }
	}

	initLoadingScreen() {
		const {
			pixiApplication: {stage},
			assets,
			dictionary,
		} = this

		this.loadingScreen = stage
		.addChild(new LoadingScreen(
			assets,
			dictionary
		))
	}

	initBackground() {
		const {
			pixiApplication: {stage},
			assets,
			isMobileDevice
		} = this

		this.backgroundView = stage.addChild(
			new BackgroundView(assets))
	}

	initReels({
		initialReels,
		coefficients
	}) {
		const {
			pixiApplication: {stage},
			assets,
			dictionary,
			isMobileDevice,
		} = this

		this.reelsView = stage.addChild(
			new ReelsView({
				initialSymbolsIds: initialReels,
				assets,
				dictionary,
				coefficients,
				isMobileDevice
			}))
	}

	initCoinRain(assets) {
		const {
			pixiApplication: {stage}
		} = this

		this.coinRainView = new CoinRainView(assets)
		stage.addChild(this.coinRainView)
	}

	initInteractiveLayer() {
		const {
			pixiApplication: { stage },
		} = this

		this.interactiveLayerView = stage.addChild(new InteractiveLayerView)
		this.interactiveLayerView.onClick = () => { this.skip() }
	}

	initVueUIContainer() {
		const {
			vueContext,
			isMobileDevice,
			pixiApplication: {stage}
		} = this
		stage.addChild(new VueUIContainer({vueContext, isMobileDevice}))
	}

	initBitmapFonts(accounts = []) {
		const bitmapPhrases = []
		Object.values(this.dictionary).forEach(text => bitmapPhrases.push(text))

		TextField.fontStyles.default =  {
			fontFamily: "default",
			dropShadow: true,
			dropShadowDistance: 7,
			dropShadowAngle: Math.PI / 2,
			dropShadowColor: 0x190445,
			fontWeight: 'bold',
			fontSize: 256,
			fill: ['#FFFFFF', '#CCCCCC'],
		}

		if(this.isLTRTextDirection) {
			BitmapFont.from(
				"default",
				TextField.fontStyles.default,
				{
					chars: [...new Set([
						...(accounts.map(({name}) => name).join('').split('')),
						...(bitmapPhrases.join('').split('')),
						...'0123456789x:,./ABCDEFGHIJKLMNOPQRSTUVWXYZ∞-|½×='
					])]
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

	skip() {
		this.vueContext.refresh({isSkipExpected: false})
		this.interactiveLayerView.setInteractive(false)
		this.reelsView.setInteractive(false)
		this.setGamePlayTimeScale(5)
	}

	setGamePlayTimeScale(scale = 1) {
		const turboMultiplier = this.isTurboMode ? TURBO_MODE_TIME_SCALE : 1
		const finalTimeSale = scale * turboMultiplier
		this.reelsView.setTimeScale(finalTimeSale)
	}

	async getUserInput({
		betIndex,
		balance,
		currencyCode,
		bet,
		betsOptions,
		payout = 0,
	}) {
		this.setGamePlayTimeScale()
		this.vueContext.refresh({
			betIndex,
			balance: formatMoney(balance),
			betsOptions: betsOptions.map(value => formatMoney(value)),
			currencyCode,
			isSpinExpected: true,
			isSkipExpected: false,
			payout: formatMoney(payout)
		})

		this.interactiveLayerView.setInteractive(false)
		this.reelsView.refreshPayoutsInfo(bet)
		this.reelsView.setInteractive()

		if (this.remainingAutoSpinsCount) {
			this.remainingAutoSpinsCount--
			return { key: 'make_bet' }
		}

		return this.vueContext.getUserInput()
	}

	
	async presentSpinStart({
		balance,
		commonPayout,
	}) {
		const { reelsView, dictionary } = this
		const isSkipExpected = false
		const formattedPayout = formatMoney(commonPayout ?? 0)
		
		this.vueContext.refresh({
			activePopupName: '',
			remainingAutoSpinsCount: this.remainingAutoSpinsCount,
			isSpinExpected: false,
			isSkipExpected,
			balance: formatMoney(balance),
			payout: formattedPayout,
		})

		this.setGamePlayTimeScale()
		this.interactiveLayerView.setInteractive(isSkipExpected)
		reelsView.setInteractive(false)


		// INFO BAR MESSAGE...
		if (commonPayout >= 0) {
			/*
			this.presentMessage({
				text: dictionary.you_have_won_bmp + ' ' + formattedPayout + ' ' + currencyCode
			})
			*/
		} else {
			// this.presentMessage({text: dictionary.good_luck_bmp})
		}
		// ...INFO BAR MESSAGE

		return reelsView.presentSpinStart()
	}

	presentSpinStop(targetSymbols = getRandomLoseReels()) {
		this.setGamePlayTimeScale()
		this.vueContext.refresh({ isSkipExpected: true })
		this.interactiveLayerView.setInteractive()
		this.reelsView.setInteractive(false)

		return this.reelsView.presentSpinStop(targetSymbols)
	}

	presentCascade({
		collapses,
		patchMap
	}) {
		this.vueContext.refresh({ isSkipExpected: true })
		this.setGamePlayTimeScale()

		return this.reelsView.presentCascade({
			collapses,
			patchMap
		})
	}

	async presentWin({
		payout,
		coefficient,
		commonPayout,
		currencyCode
	}) {
		this.setGamePlayTimeScale()
		const { reelsView } = this
		const formattedPayout = formatMoney(commonPayout)

		//this.presentMessage({
		//	text: this.dictionary.you_have_won_bmp + ' ' + formattedPayout + ' ' + currencyCode
		//})

		this.vueContext.refresh({
			isSkipExpected: true,
			payout: formattedPayout
		})
		this.interactiveLayerView.setInteractive()
		this.reelsView.setInteractive(false)

	}

	presentLose() {
		// this.presentMessage({text: this.dictionary.no_luck_bmp})
	}

	presentTotalWin({
		totalCoefficient,
		totalPayout,
		currencyCode
	}) {
		this.setGamePlayTimeScale()
		if(totalCoefficient < 5) return
		this.vueContext.refresh({
			isSkipExpected: true,
			isSpinExpected: false,
		})

		this.interactiveLayerView.setInteractive()

		this.coinRainView.present()
		return this.reelsView.presentBigWin(totalPayout, currencyCode)
	}

	presentError(errorCode) {
		this.setGamePlayTimeScale()
		this.remainingAutoSpinsCount = 0
		this.vueContext.refresh({
			isSkipExpected: false,
			remainingAutoSpinsCount: 0,
			errorText: this.dictionary['error_' + errorCode] ?? errorCode
		})
		this.interactiveLayerView.setInteractive(false)
	}
	// ...API
}