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
import { ForegroundView } from "./views/foreground/ForegroundView"
import { CoinRainView } from "./views/reels/coinRain/CoinRainView"

settings.MIPMAP_MODES = MIPMAP_MODES.ON

const locales = import.meta.glob('../../public/translations/*.json')

export class Presentation {
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

	setup({
		wrapperHTMLElementId,
		customVFXLevel,
		customUIOption,
		languageCode,
		dictionary = {
			"bet": "Bet",
			"win": "Win",
			"balance": "Balance",
			"select_bet": "Select bet",
			"select_autoplay": "Select autoplay length",
			"start": "Start",
			"select": "Select",
			"ok": "Ok",
			"expected_reels": "Expected reels:",
			"make_bet": "Make bet",
			"error_100": "Server error",
			"error_200": "Not enough money",
			"error_300": "Bet is invalid",
			"error_400": "Cheat bets are not expected",
			"error_401": "Desired result is invalid",
			
			"spins_left_bmp": "FREE SPINS",
			"total_win_bmp": "TOTAL WIN",
			"congratulations_bmp": "CONGRATULATIONS!",
			"free_spins_bmp": "FREE SPINS",
			"you_have_won_bmp": "YOU WON",
			"loading_bmp": "LOADING",
			"click_anywhere_to_continue_bmp": "CLICK ANYWHERE TO CONTINUE!",
			"tap_anywhere_to_continue_bmp": "TAP ANYWHERE TO CONTINUE!",
			"big_win_bmp": "That's a BIG WIN!",
			"huge_win_bmp": "That's a HUGE WIN!",
			"mega_win_bmp": "That's a MEGA WIN!",
			"or_bmp": "OR",
			"red_bmp": "RED",
			"green_bmp": "GREEN",
			"collect_bmp": "QUIT",
			"choose_bmp": "CHOOSE",
			"additionally_bmp": "ADDITIONALLY!",
			"special_symbol_bmp": "AND THE SPECIAL SYMBOL!",
			"and_mysterious_keys_bmp": "...",
			"free_spins_over_bmp": "BONUS GAME IS FINISHED!",
			
			"welcome_bmp": "WELCOME!",
			"click_play_bmp": "CLICK PLAY TO START!",
			"good_luck_bmp": "GOOD LUCK!",
			"no_luck_bmp": "BETTER LUCK NEXT TIME!",
			"free_spins_total_win_bmp": "COMMON WIN",
			"wild_bmp": "WILD",
			"scatter_bmp": "SCATTER"
		}
	}) {
		this.dictionary = dictionary
		this.languageCode = languageCode
		this.vueContext = mountVueUI(wrapperHTMLElementId)
		this.pixiApplication = new Application({background: 0x1f1f5c})
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
		coefficients,
		winLinesTopologies,
	}) {

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
		this.initReels({initialReels, coefficients, winLinesTopologies})
		this.initCoinRain(this.assets)
		this.initForeground()
		this.initVueUIContainer()
		stage.addChild(this.loadingScreen)
		this.initInteractiveLayer()
		AdaptiveContainer.onResize()
		await this.reelsView.preRenderSymbols()
		
		this.presentMessage({text: this.dictionary.welcome_bmp})

		this.vueContext.refresh({
			dictionary: this.dictionary,
			currencyCode,
			betsOptions: betsOptions.map(value => formatMoney(value)),
			autoplayOptions: [5, 10, 25, 50, 100, Infinity],
			balance: formatMoney(balance),
			payout: formatMoney(0),
			betIndex,
		})
		await Promise.all([
			this.loadingScreen.hide((progress) => {
				this.vueContext.refresh({uiAlpha: progress})
			}),
			this.reelsView.presentIntro()
		])

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
			vfxLevel,
			isMobileDevice
		} = this

		this.backgroundView = stage.addChild(
			new BackgroundView(assets))
	}

	initForeground() {

		return
		const {
			pixiApplication: {stage},
			assets,
			vfxLevel,
			isMobileDevice
		} = this

		this.foregroundView = stage.addChild(
			new ForegroundView(assets))
	}

	initReels({
		initialReels,
		coefficients,
		winLinesTopologies
	}) {
		const {
			pixiApplication: {stage, renderer},
			assets,
			dictionary,
			vfxLevel,
			isMobileDevice,
		} = this

		this.reelsView = stage.addChild(
			new ReelsView({
				initialSymbolsIds: initialReels,
				assets,
				renderer,
				dictionary,
				coefficients,
				winLinesTopologies,
				vfxLevel,
				isMobileDevice,
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

	async initBitmapFonts() {
		const bitmapPhrases = []
		for (const [key, value] of Object.entries(this.dictionary))
			if (key.includes('_bmp'))
				bitmapPhrases.push(value)

		BitmapFont.from(
			"egypt",
			{
				fontFamily: "egypt",
				dropShadow: true,
				dropShadowDistance: 7,
				dropShadowAngle: Math.PI / 2,
				dropShadowColor: 0x333333,
				fontWeight: 'bold',
				fontSize: 256,
				fill: ['#FFFFFF', '#CCCCCC'],
			},
			{
				chars: [
					...new Set(bitmapPhrases.join('').split('')),
					...'0123456789x+:,./ABCDEFGHIJKLMNOPQRSTUVWXYZ'
				]
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
		freeSpinsCount,
		currencyCode,
		multiplier = 1,
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
			this.presentMessage({
				text: dictionary.you_have_won_bmp + ' ' + formattedPayout + ' ' + currencyCode
			})
		} else {
			this.presentMessage({text: dictionary.good_luck_bmp})
		}
		// ...INFO BAR MESSAGE

		return reelsView.presentSpinStart({
			freeSpinsCount,
			multiplier
		})
	}

	presentSpinStop({
		targetSymbols = getRandomLoseReels(),
		wildSubstitutionSymbolId
	}) {
		this.setGamePlayTimeScale()
		this.vueContext.refresh({ isSkipExpected: true })
		this.interactiveLayerView.setInteractive()
		this.reelsView.setInteractive(false)

		return this.reelsView.presentSpinStop({
			targetSymbols,
			wildSubstitutionSymbolId
		})
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

		this.presentMessage({
			text: this.dictionary.you_have_won_bmp + ' ' + formattedPayout + ' ' + currencyCode
		})

		this.vueContext.refresh({
			isSkipExpected: true,
			payout: formattedPayout
		})
		this.interactiveLayerView.setInteractive()
		this.reelsView.setInteractive(false)

		reelsView
			.presentWin({
				totalPayout: payout,
				coefficient,
			})
	}

	presentLose() {
		this.presentMessage({text: this.dictionary.no_luck_bmp})
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

	presentMessage({
        text,
        forcePresent = false,
        color,
    }) {
		return
		return this.reelsView.presentMessage({
			text,
			forcePresent,
			color,
		})
	}

	presentError(errorCode) {
		this.setGamePlayTimeScale()
		this.reelsView.reset()
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