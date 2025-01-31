import { Application, settings, MIPMAP_MODES, Ticker, BitmapFont } from "pixi.js"
import { AdaptiveContainer } from "./views/adaptiveDesign/AdaptiveContainer"
import { Timeline } from "./timeline/Timeline"
import { BackgroundView } from "./views/BackgroundView"
import { getPreloadingResources, getResources } from "./Assets"
import { ReelsView } from "./views/reels/ReelsView"
import { mountVueUI } from "./views/vueUI/VueUI.vue"
import { VueUIContainer } from "./views/vueUI/VueUIContainer"
import { formatMoney } from "./Utils"
import { TURBO_MODE_TIME_SCALE, WIN_COEFFICIENTS } from "./Constants"
import { BonusAwardSplashScreen } from "./views/splashScreens/BonusAwardSplashScreen"
import { BonusPayoutSplashScreen } from "./views/splashScreens/BonusPayoutSplashScreen"
import { TransitionView } from "./views/TransitionView"
import { FirefliesPoolView } from "./views/particles/FirefliesPoolView"
import { LoadingScreen } from "./views/loadingScreen/LoadingScreen"
import { getVFXLevel } from "./Benchmark"
import { BigWinPayoutSplashScreen } from "./views/splashScreens/BigWinPayoutSplashScreen"
import { Camera } from "./views/adaptiveDesign/Camera"
import { InteractiveLayerView } from "./views/InteractiveLayerView"
const locales = import.meta.glob('../../public/translations/*.json')


settings.MIPMAP_MODES = MIPMAP_MODES.ON

export class Presentation {
	resources
	pixiApplication
	loadingScreen
	backgroundView
	reelsView
	interactiveLayerView
	transitionView
	bonusAwardSplashScreen
	bonusPayoutSplashScreen
	bigWinPayoutSplashScreen
	vueContext
	remainingAutoSpinsCount = 0
	isTurboMode
	vfxLevel
	isMobileDevice
	camera
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
			"buy": "Buy",
			"select_bet": "Select bet",
			"select_autoplay": "Selet autoplay length",
			"buy_feature": "Buy feature",
			"buy_feature_per_spin": " per spin",
			"start": "Start",
			"select": "Select",
			"ok": "Confirm",
			"make_cheat_bet": "Make cheat bet",
			"error_100": "Server error",
			"error_200": "Not enough money",
			"error_300": "Bet is invalid",
			"error_400": "Cheat bets are not expected",
			"error_401": "Desired result is impossible",
			
			"spins_left_bmp": "FREE SPINS",
			"total_win_bmp": "TOTAL WIN",
			"congratulations_bmp": "CONGRATULATIONS!",
			"free_spins_bmp": "FREE SPINS",
			"you_have_won_bmp": "YOU WON",
			"respin_awarded_bmp": "RE-SPIN!",
			"loading_bmp": "LOADING",
			"free_spins_teaser_bmp": "FREE SPINS!",
			"wild_multipliers_teaser_bmp": "WILD SYMBOLS!",
			"click_anywhere_to_continue_bmp": "Click anywhere to continue!",
			"tap_anywhere_to_continue_bmp": "Tap anywhere to continue!",
			"big_win_bmp": "That's a BIG WIN!",
			"huge_win_bmp": "That's a HUGE WIN!",
			"mega_win_bmp": "That's a MEGA WIN!"
		}
	}) {
		this.dictionary = dictionary
		this.languageCode = languageCode
		this.vueContext = mountVueUI(wrapperHTMLElementId)

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

		// ADJUSTING RESOLUTION...
		this.pixiApplication = new Application()
		const highestResolution = window.devicePixelRatio
		const lowestResolution = this.isMobileDevice ? Math.min(1.5, highestResolution) : 1
		const resolutionDelta = highestResolution - lowestResolution
		const vfxLevel = customVFXLevel ?? getVFXLevel(this.pixiApplication)
		const finalVFXLevel = Math.min(1, Math.max(0, vfxLevel))
		this.pixiApplication.renderer.resolution = lowestResolution + resolutionDelta * finalVFXLevel
		this.vfxLevel = finalVFXLevel
		// ...ADJUSTING RESOLUTION

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
		initialReels,
		currencyCode,
		betsOptions,
		buyFeatureOptions,
		balance,
		bet,
		coefficients,
		winLinesTopologies
	}) {
		const {stage} = this.pixiApplication

		this.resources = await getPreloadingResources()
		this.initBitmapFonts()
		this.initLoadingScreen()
		this.initFireflies()
		AdaptiveContainer.onResize()

		this.resources = await getResources((progress) => {
			this.loadingScreen.setProgress(progress)
		})


		this.initCamera()
		this.initBackground()
		this.initReels({initialReels, coefficients, winLinesTopologies})
		this.initSplashScreens()
		this.initVueUIContainer()
		stage.addChild(this.loadingScreen)
		this.firefliesPoolView && stage.addChild(this.firefliesPoolView)
		this.initInteractiveLayer()
		this.initTransitionView()
		AdaptiveContainer.onResize()

		this.vueContext.refresh({
			dictionary: this.dictionary,
			currencyCode,
			betsOptions: betsOptions.map(value => formatMoney(value)),
			autoSpinsValues: [5, 10, 25, 50, 100, Infinity],
			buyFeatureOptions: buyFeatureOptions.map(value => formatMoney(value)),
			balance: formatMoney(balance),
			payout: formatMoney(0),
			bet: formatMoney(bet),
		})

		await this
			.loadingScreen
			.presentTeasers({
				resources: this.resources,
				dictionary: this.dictionary,
				isMobileDevice: this.isMobileDevice})

		this.vueContext.refresh({activePopupName: ''})

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
			this.isTurboMode = isTurboMode
			this.setGamePlayTimeScale()
		}

		this.vueContext.onSkipRequested = () => { this.skip() }
	}

	initLoadingScreen() {
		const {
			pixiApplication: {stage},
			resources,
			dictionary,
		} = this

		this.loadingScreen = stage
		.addChild(new LoadingScreen(
			resources,
			dictionary
		))
	}

	initBackground() {
		const {
			pixiApplication: {stage},
			resources,
		} = this

		this.backgroundView = stage.addChild(new BackgroundView(resources))
	}

	initReels({
		initialReels,
		coefficients,
		winLinesTopologies
	}) {
		const {
			pixiApplication: {stage},
			resources,
			dictionary,
			vfxLevel,
			isMobileDevice,
			camera
		} = this

		this.reelsView = stage.addChild(
			new ReelsView({
				initialSymbolsIds: initialReels,
				resources,
				dictionary,
				coefficients,
				winLinesTopologies,
				vfxLevel,
				isMobileDevice,
				camera
			}))
	}

	initFireflies() {
		if (this.vfxLevel < 0.5) return

		const { pixiApplication: { stage }} = this

		this.firefliesPoolView = stage
			.addChild(
				new FirefliesPoolView({
					scaleFactor: 1,
					color: 0xFF5500,
					spawnArea: {
						x: 0,
						y: 0,
						width: 1,
						height: 1
					}
				})
			)
	}

	initSplashScreens() {
		const {
			pixiApplication: {stage},
			resources,
			dictionary,
			isMobileDevice,
			camera
		} = this

		this.bonusAwardSplashScreen = stage
			.addChild(new BonusAwardSplashScreen({
				camera,
				resources,
				dictionary,
				isMobileDevice
			}))
		this.bonusPayoutSplashScreen = stage
			.addChild(new BonusPayoutSplashScreen({
				camera,
				resources,
				dictionary,
				isMobileDevice
			}))
		this.bigWinPayoutSplashScreen = stage
			.addChild(new BigWinPayoutSplashScreen({
				camera,
				resources,
				dictionary,
				isMobileDevice
			}))
	}

	initTransitionView() {
		const {
			pixiApplication: { stage },
			camera,
			reelsView
		} = this

		this.transitionView = stage.addChild(
			new TransitionView({camera, reelsView}))
	}

	initInteractiveLayer() {
		const {
			pixiApplication: { stage },
		} = this

		this.interactiveLayerView = stage.addChild(new InteractiveLayerView)
		this.interactiveLayerView.onClick = () => { this.skip() }
	}

	initCamera() {
		this.camera = new Camera(this.pixiApplication.stage)
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
			"runes",
			{
				fontFamily: "runes",
				dropShadow: true,
				dropShadowDistance: 10,
				dropShadowAngle: Math.PI / 2,
				dropShadowColor: 0x333333,
				fontWeight: 'bold',
				fontSize: 100,
				fill: ['#FFFFFF', '#CCCCCC'],
			},
			{
				chars: [
					...new Set(bitmapPhrases.join('').split('')),
					...'0123456789x:,.'
				]
			}
		)

		BitmapFont.from(
			"Multiplier",
			{
				fontFamily: "bangopro",
				fontSize: 100,
				fill: '#FFFFFF',
			},
			{
				chars: '12345x'
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
		this.setGamePlayTimeScale(10)
	}

	setGamePlayTimeScale(scale = 1) {
		const turboMultiplier = this.isTurboMode ? TURBO_MODE_TIME_SCALE : 1
		const finalTimeSale = scale * turboMultiplier
		this.reelsView.setTimeScale(finalTimeSale)
	}

	async getUserInput({
		bet,
		balance,
		currencyCode,
		winLines = [],
	}) {
		this.setGamePlayTimeScale()
		this.vueContext.refresh({
			bet: formatMoney(bet),
			balance: formatMoney(balance),
			currencyCode,
			isSpinExpected: true,
			isSkipExpected: false,
		})

		this.reelsView.refreshPayoutsInfo(bet)
		this.reelsView.setInteractive()
		this.interactiveLayerView.setInteractive(false)

		if (this.remainingAutoSpinsCount) {
			this.remainingAutoSpinsCount--
			return { key: 'make_bet', bet}
		}

		const promises = [this.vueContext.getUserInput()]
		
		winLines.length > 1 && promises.push(
			this.reelsView
				.presentWin({winLines})
				.then(() => {return {key: 'idle'}}))

		return Promise.any(promises)
	}
	
	async presentSpinStart({
		balance,
		commonPayout = 0,
		freeSpinsCount,
		lockedReelsIndexes = [],
		lockedSymbolId,
	}) {
		const { reelsView } = this
		const isSkipExpected = !!lockedReelsIndexes.length

		this.setGamePlayTimeScale()

		this.vueContext.refresh({
			activePopupName: '',
			remainingAutoSpinsCount: this.remainingAutoSpinsCount,
			isSpinExpected: false,
			isSkipExpected,
			balance: formatMoney(balance),
			payout: formatMoney(commonPayout),
		})
		this.interactiveLayerView.setInteractive(isSkipExpected)

		return reelsView.presentSpinStart({
			lockedReelsIndexes,
			lockedSymbolId,
			freeSpinsCount,
		})
	}

	presentSpinStop(targetSymbols) {
		this.setGamePlayTimeScale()
		this.vueContext.refresh({ isSkipExpected: true })
		this.interactiveLayerView.setInteractive()

		return this.reelsView.presentSpinStop(targetSymbols)
	}

	presentExpansion(length) {
		this.vueContext.refresh({ isSkipExpected: true })
		this.interactiveLayerView.setInteractive()
		this.setGamePlayTimeScale()
		return this.reelsView.presentExpansion({length})
	}

	presentWin({
		winLines,
		payout,
		coefficient,
		commonPayout,
		reels
	}) {
		this.setGamePlayTimeScale()
		const { reelsView } = this

		this.vueContext.refresh({
			isSkipExpected: true,
			payout: formatMoney(commonPayout)
		})
		this.interactiveLayerView.setInteractive()

		return reelsView.presentWin({
			winLines,
			totalPayout: payout,
			coefficient,
			reels
		})
	}

	presentFreeSpinsAward({freeSpinsCount}) {
		this.vueContext.refresh({ isSkipExpected: true })
		this.interactiveLayerView.setInteractive()
		this.setGamePlayTimeScale()
		return this.reelsView.presentFreeSpinsAward({
			freeSpinsCount,
			isHarvestingRequired: true})
	}

	async presentFreeSpinsModeTransition({
		freeSpinsCount,
		awardedFreeSpinsCount,
		commonFreeSpinsPayout,
	}) {
		this.setGamePlayTimeScale()
		this.vueContext.refresh({ isSkipExpected: false })
		this.interactiveLayerView.setInteractive(false)

		if(awardedFreeSpinsCount) {
			await this.reelsView.presentFreeSpinsAward({freeSpinsCount})
			await this.bonusAwardSplashScreen.presentAward(awardedFreeSpinsCount)
			await this.transitionView.presentTransition()
			this.backgroundView.setFreeSpinsMode()
			this.reelsView.setFreeSpinsMode()
			this.firefliesPoolView?.setColor(0xFFAA00)

			return
		}
		const formattedPayout = formatMoney(commonFreeSpinsPayout)

		await this.bonusPayoutSplashScreen.presentPayout(formattedPayout)
		await this.transitionView.presentTransition()
		this.vueContext.refresh({ payout: formatMoney(0) })
		this.reelsView.setFreeSpinsMode(false)
		this.backgroundView.setFreeSpinsMode(false)
		this.firefliesPoolView?.setColor(0x00FFFF)

		return Promise.all([
			this.reelsView.presentFreeSpinsCount(),
			this.reelsView.presentExpansion({})
		])
	}

	presentTotalWin({
		totalCoefficient,
		totalPayout,
	}) {
		this.setGamePlayTimeScale()
		if(totalCoefficient < WIN_COEFFICIENTS.BIG) return

		this.vueContext.refresh({ isSkipExpected: false })
		this.interactiveLayerView.setInteractive(false)

		return this.bigWinPayoutSplashScreen.presentPayout({
			coefficient: totalCoefficient,
			payout: totalPayout,
		})
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