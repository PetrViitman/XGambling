import { Application, settings, MIPMAP_MODES, Ticker, BitmapFont, Sprite, Container } from "pixi.js"
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
import { DoubleUpSplashScreen } from "./views/splashScreens/DoubleUpSplashScreen"
import { BonusPayoutSplashScreen } from "./views/splashScreens/BonusPayoutSplashScreen"
import { TransitionView } from "./views/TransitionView"
import { LoadingScreen } from "./views/loadingScreen/LoadingScreen"
import { getVFXLevel } from "./Benchmark"
import { BigWinPayoutSplashScreen } from "./views/splashScreens/BigWinPayoutSplashScreen"
import { Camera } from "./views/adaptiveDesign/Camera"
import { InteractiveLayerView } from "./views/InteractiveLayerView"
import { WildIndicatorView } from "./views/WildIndicatorView"
import { getDictionary } from "./Dictionary"
import { TextField } from "./views/text/TextField"

settings.MIPMAP_MODES = MIPMAP_MODES.ON

export class Presentation {
	resources
	pixiApplication
	loadingScreen
	backgroundView
	reelsView
	wildIndicatorView
	interactiveLayerView
	transitionView
	doubleUpSplashScreen
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
		dictionary
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
		betIndex,
		linesOptions,
		balance,
		coefficients,
		winLinesTopologies
	}) {
		// FETCHING DICTIONARY...
		if (!this.dictionary) {
			this.dictionary =  await getDictionary(this.languageCode)
			this.isLTRTextDirection = this.dictionary.isLTRTextDirection
			TextField.isLTRTextDirection = this.isLTRTextDirection
		}
		// ...FETCHING DICTIONARY
		
		const {stage} = this.pixiApplication

		this.resources = await getPreloadingResources()
		this.initBitmapFonts()
		this.initLoadingScreen()
		AdaptiveContainer.onResize()

		this.resources = await getResources((progress) => {
			this.loadingScreen.setProgress(progress)
		})


		this.initCamera()
		this.initBackground()
		this.initReels({initialReels, coefficients, winLinesTopologies})
		this.initSplashScreens()
		this.initWildIndicator()
		this.initVueUIContainer()
		stage.addChild(this.loadingScreen)
		this.initInteractiveLayer()
		this.initTransitionView()
		AdaptiveContainer.onResize()

		this.vueContext.refresh({
			dictionary: this.dictionary,
			currencyCode,
			betsOptions: betsOptions.map(value => formatMoney(value)),
			linesOptions: linesOptions.map(value => value),
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
			vfxLevel,
			isMobileDevice
		} = this

		this.backgroundView = stage.addChild(
			new BackgroundView({
				resources,
				vfxLevel,
				isMobileDevice,
			}))
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

	initWildIndicator() {
		const {
			pixiApplication: {stage},
			resources,
		} = this

		const view = new WildIndicatorView(resources)

		this.wildIndicatorView = stage.addChild(view)
	}

	initSplashScreens() {
		const {
			pixiApplication: {stage},
			resources,
			dictionary,
			isMobileDevice,
			camera
		} = this

		this.doubleUpSplashScreen = stage
			.addChild(new DoubleUpSplashScreen({
				camera,
				resources,
				dictionary,
				isMobileDevice
			}))

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

	initBitmapFonts(accounts = []) {
		const bitmapPhrases = []
		for (const [key, value] of Object.entries(this.dictionary))
			if (key.includes('_bmp'))
				bitmapPhrases.push(value)

		TextField.fontStyles.default =  {
			fontFamily: "default",
			dropShadow: true,
			dropShadowDistance: 7,
			dropShadowAngle: Math.PI / 2,
			dropShadowColor: 0x333333,
			fontWeight: 'bold',
			fontSize: 100,
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
		this.setGamePlayTimeScale(10)
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
		betPerLine,
		betsOptions,
		linesCount,
		payout = 0,
	}) {

		await this.doubleUpSplashScreen.setVisible(false)
		this.setGamePlayTimeScale()
		this.vueContext.refresh({
			betIndex,
			linesCount,
			balance:
				formatMoney(balance - payout)
				+ (payout
				? (' + ' + formatMoney(payout))
				: ''),
			betsOptions: betsOptions.map(value => formatMoney(value)),
			currencyCode,
			isSpinExpected: true,
			isSkipExpected: false,
			isRiskExpected: !!payout,
			payout: formatMoney(payout)
		})

		this.interactiveLayerView.setInteractive(false)
		this.reelsView.refreshPayoutsInfo(betPerLine)
		this.reelsView.setInteractive()
		this.reelsView.presentLinesCount(linesCount)

		if (this.remainingAutoSpinsCount) {
			this.remainingAutoSpinsCount--
			return { key: 'make_bet' }
		}

		return this.vueContext.getUserInput()
	}

	getUserRiskChoice(payout) {
		this.reelsView.hidePayoutsInfo()
		this.vueContext.refresh({
			isSpinExpected: false,
			isRiskExpected: false
		})
		return this.doubleUpSplashScreen.getUserChoice(payout)
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
			isRiskExpected: false,
			balance: formatMoney(balance),
			payout: formatMoney(commonPayout),
		})
		this.interactiveLayerView.setInteractive(isSkipExpected)
		reelsView.setInteractive(false)

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
		this.reelsView.setInteractive(false)

		return this.reelsView.presentSpinStop(targetSymbols)
	}

	async presentWin({
		winLines,
		payout,
		coefficient,
		commonPayout,
		reels,
	}) {
		this.setGamePlayTimeScale()
		const { reelsView } = this

		this.vueContext.refresh({
			isSkipExpected: true,
			payout: formatMoney(commonPayout)
		})
		this.interactiveLayerView.setInteractive()
		this.reelsView.setInteractive(false)

		await reelsView
			.presentWin({
				winLines,
				totalPayout: payout,
				coefficient,
				reels
			})

		this.reelsView.presentWin({winLines})
	}

	presentSpecialWin({
		commonPayout,
		substitutionSymbolId,
		specialWinReels,
		specialWinLines,
		stepSpecialCoefficient,
		stepSpecialPayout,
		reels
	}) {
		this.setGamePlayTimeScale()
		const { reelsView } = this

		this.vueContext.refresh({
			isSkipExpected: true,
			payout: formatMoney(commonPayout)
		})
		this.interactiveLayerView.setInteractive()
		this.reelsView.setInteractive(false)

		return Promise.all([
			reelsView.presentSpecialWin({
				substitutionSymbolId,
				specialWinLines,
				stepSpecialPayout,
				stepSpecialCoefficient,
				specialWinReels,
			})
		])
	}

	async presentFreeSpinsAward({awardedFreeSpinsCount, freeSpinsCount}) {
		this.vueContext.refresh({ isSkipExpected: true })
		this.interactiveLayerView.setInteractive()
		this.reelsView.setInteractive(false)
		this.setGamePlayTimeScale()

		await this.reelsView.presentFreeSpinsAward({freeSpinsCount})

		this.vueContext.refresh({ isSkipExpected: false })
		this.interactiveLayerView.setInteractive(false)
		this.setGamePlayTimeScale()

		return this.bonusAwardSplashScreen.presentAward({
			awardedFreeSpinsCount
		})
	}

	presentRiskWin({
		option,
		balance,
		payout
	}) {
		const formattedPayout = formatMoney(payout)

		this.vueContext.refresh({
			balance:
				formatMoney(balance - payout)
				+ (payout
				? (' + ' + formattedPayout)
				: ''),
			payout: formattedPayout,
			isSpinExpected: false,
			isRiskExpected: false
		})

		return this
			.doubleUpSplashScreen
			.presentWin({
				option,
				payout,
			})
	}

	presentRiskLoose({
		option,
		balance,
	}) {
		this.vueContext.refresh({
			balance: formatMoney(balance),
			payout: formatMoney(0),
			isSpinExpected: false,
			isRiskExpected: false
		})

		this.reelsView.reset()

		return this
			.doubleUpSplashScreen
			.presentLoose(option)
	}

	async presentFreeSpinsModeTransition({
		freeSpinsCount,
		awardedFreeSpinsCount,
		payout,
		specialSymbolId,
	}) {
		this.setGamePlayTimeScale()
		this.vueContext.refresh({ isSkipExpected: false })
		this.interactiveLayerView.setInteractive(false)
		this.reelsView.setInteractive(false)

		if(awardedFreeSpinsCount) {
			// TRANSITION TO FREE SPINS...
			await this.reelsView.presentFreeSpinsAward({freeSpinsCount})
			await this.bonusAwardSplashScreen.presentAward({awardedFreeSpinsCount, specialSymbolId})
			await this.transitionView.presentTransition()
			this.backgroundView.setFreeSpinsMode()
			this.reelsView.setFreeSpinsMode()
			this.wildIndicatorView.presentSymbol(specialSymbolId)

			return
			// ...TRANSITION TO FREE SPINS
		}

		// TRANSITION FROM FREE SPINS...
		const formattedPayout = formatMoney(payout)

		await this.bonusPayoutSplashScreen.presentPayout(payout)
		this.wildIndicatorView.presentSymbol()
		await this.transitionView.presentTransition()
		this.vueContext.refresh({ payout: formattedPayout })
		this.reelsView.setFreeSpinsMode(false)
		this.backgroundView.setFreeSpinsMode(false)

		return Promise.all([
			this.reelsView.presentFreeSpinsCount(),
		])
		// ...TRANSITION FROM FREE SPINS
	}

	presentTotalWin({
		totalCoefficient,
		totalPayout,
		balance
	}) {
		this.setGamePlayTimeScale()
		if(totalCoefficient < WIN_COEFFICIENTS.BIG) return

		this.vueContext.refresh({
			isSkipExpected: false ,
			balance:
				formatMoney(balance - totalPayout)
				+ (totalPayout
				? (' + ' + formatMoney(totalPayout))
				: ''),
		})
		this.interactiveLayerView.setInteractive(false)

		return this.bigWinPayoutSplashScreen.presentPayout({
			coefficient: totalCoefficient,
			payout: totalPayout,
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