import { Application, settings, MIPMAP_MODES, Ticker, BitmapFont, Sprite, Container, Graphics, SCALE_MODES, EventBoundary, Text } from "pixi.js"
import { AdaptiveContainer } from "./views/adaptiveDesign/AdaptiveContainer"
import { Timeline } from "./timeline/Timeline"
import { BackgroundView } from "./views/BackgroundView"
import { getPreloadingAssets, getAssets } from "./Assets"
import { ReelsView } from "./views/reels/ReelsView"
import { formatMoney, getRandomLoseReels } from "./Utils"
import { TURBO_MODE_TIME_SCALE, WIN_COEFFICIENTS } from "./Constants"
import { BonusAwardSplashScreen } from "./views/splashScreens/BonusAwardSplashScreen"
import { BonusPayoutSplashScreen } from "./views/splashScreens/BonusPayoutSplashScreen"
import { LoadingScreen } from "./views/loadingScreen/LoadingScreen"
import { getVFXLevel } from "./Benchmark"
import { BigWinPayoutSplashScreen } from "./views/splashScreens/BigWinPayoutSplashScreen"
import { Camera } from "./views/adaptiveDesign/Camera"
import { InteractiveLayerView } from "./views/InteractiveLayerView"
import { BankView } from "./views/bank/BankView"
import { SkyView } from "./views/bank/SkyView"
import { AwardView } from "./views/splashScreens/award/AwardView"
import { GUIView } from "./views/GUI/GUIView"
import { TextField } from "./views/text/TextField"
import { Audio } from "./audio/Audio"

settings.MIPMAP_MODES = MIPMAP_MODES.ON


export class Presentation {
	preloadingAssetsMap
	assetsMap
	audioMap
	assets
	pixiApplication
	loadingScreen
	backgroundView
	reelsView
	interactiveLayerView
	bonusAwardSplashScreen
	bonusPayoutSplashScreen
	bigWinPayoutSplashScreen
	splashScreens = []
	remainingAutoSpinsCount = 0
	isTurboMode
	vfxLevel
	isMobileDevice
	camera
	languageCode
	accounts
	isLTRTextDirection
	isMobileApplicationClient
	audio = new Audio()

	setup({
		wrapperHTMLElementId,
		customVFXLevel,
		customUIOption,
		languageCode,
		preloadingAssetsMap,
		assetsMap,
		audioMap,
		isLTRTextDirection = true,
		isMobileApplicationClient = false,
		dictionary = {
			"maximal_bet": "МАКСИМУМ",
			"info_bar_idle_multiplier": "MULTIPLIER DOUBLES AFTER EVERY WIN",
			"congratulations": "ПОЗДРАВЛЯЕМ!",
			"bonuses": "БОНУСЫ",
			"symbol_payout_values": "ВЫПЛАТЫ ЗА СИМВОЛЫ",
			"scatter": "SCATTER",
			"info_bar_idle_3600_ways": "{WAYS_COUNT} WAYS TO WIN!",
			"info_bar_tension": "ANOTHER {SCATTER_SYMBOL}?!",
			"minimal_bet": "МИНИМУМ",
			"gold_framed_symbols": "СИМВОЛЫ В ЗОЛОТОЙ РАМКЕ",
			"info_bar_common_payout": "TOTAL WINNINGS: {PAYOUT}",
			"click_anywhere_to_continue": "КЛИКНИТЕ В ЛЮБОМ МЕСТЕ, ЧТОБЫ ПРОДОЛЖИТЬ!",
			"set_your_bet": "НАСТРОЙКИ СТАВКИ",
			"bonus_free_bet_shorthand": "БОНУС: БЕСПЛАТНАЯ СТАВКА",
			"info_bar_free_spins_triggered": "{SCATTER_SYMBOLS} HAVE ACTIVATED {FS_COUNT} FREE SPINS!",
			"bonus_secure_half_bet_shorthand": "БОНУС: ВОЗВРАТ ½ СТАВКИ",
			"tap_anywhere_to_continue": "НАЖМИТЕ В ЛЮБОМ МЕСТЕ, ЧТОБЫ ПРОДОЛЖИТЬ!",
			"free_spins_over": "БОНУСНАЯ ИГРА ЗАВЕРШЕНА!",
			"maximal_bet_is": "МАКСИМАЛЬНАЯ СТАВКА {BET}",
			"win_3600_ways": "3600 СПОСОБОВ ВЫИГРАТЬ",
			"good_luck": "УДАЧИ!",
			"big_win": "ЭТО BIG WIN!",
			"free_spins_won": "ПОЛУЧЕНЫ БЕСПЛАТНЫЕ ВРАЩЕНИЯ",
			"select_the_account": "ВЫБЕРИТЕ СЧЁТ",
			"win_3600_ways_instructions_part_2": "• Общее количество выигрышных комбинаций для каждого символа рассчитывается умножением числа одинаковых символов на каждом из барабанов слева направо.║║• Выплата за комбинацию символов умножается на общее количество таких комбинаций.",
			"slide_or_tap": "ПРОВЕДИТЕ ДЛЯ ПРОКРУТКИ / НАЖМИТЕ ДЛЯ КАСТОМИЗАЦИИ",
			"buy_feature_price": "СТОИМОСТЬ БОНУСНОЙ ИГРЫ:",
			"no_win": "НЕ ВЫИГРЫШ",
			"multiplier_instructions": "• В начале каждого вращения в основной игре, множитель равен x1.║║• Если в результате любого вращения, выпадет любой выигрыш, то после получения всех выплат и выпадения новых символов, множитель удваивается.║║• Максимальное значение множителя равно 1024.",
			"tap_to_continue": "НАЖМИТЕ ЧТОБЫ ПРОДОЛЖИТЬ",
			"no_bonuses": "У ВАС ПОКА НЕТ БОНУСОВ",
			"bonus_double_up_shorthand": "БОНУС: УДВОЕНИЕ",
			"maximal_win": "МАКСИМАЛЬНЫЙ ВЫИГРЫШ",
			"set_your_autoplay": "ВЫБЕРИТЕ ДЛИТЕЛЬНОСТЬ АВТОИГРЫ",
			"buy_bonus_game": "ПОКУПАЙТЕ БОНУСНУЮ ИГРУ!",
			"mega_win": "ЭТО MEGA WIN!",
			"loading": "ЗАГРУЗКА",
			"no_luck": "В СЛЕДУЮЩИЙ РАЗ ПОВЕЗЁТ!",
			"switch": "ПЕРЕКЛЮЧИТЬСЯ",
			"symbol_payout_instructions": "• WILD заменяет все символы, кроме SCATTER.║║• Символы в ЗОЛОТОЙ РАМКЕ появляются только на 3-м и 4-м барабанах.",
			"slide_to_select": "ПРОВЕДИТЕ ДЛЯ ПРОКРУТКИ",
			"info_bar_idle_scatter": "{SCATTERS_COUNT} OR MORE {SCATTER_SYMBOL} ACTIVATE {FS_COUNT} OR MORE FREE SPINS",
			"win_3600_ways_instructions_part_3": "• После получения выплат в каждом раунде все выигрышные символы взрываются. Оставшиеся и новые символы падают вниз, формируя новый раунд.║║• Это продолжается до тех пор, пока есть выигрышные комбинации.║║• Все выигрыши отображаются в валюте.",
			"paytable": "ТАБЛИЦА ВЫПЛАТ",
			"wild": "WILD",
			"win_3600_ways_example": "ИЗ ПРИМЕРА ВЫШЕ:",
			"free_bet": "БЕСПЛАТНАЯ СТАВКА {BET} EUR",
			"purchase": "КУПИТЬ",
			"info_bar_idle_wild": "EVERY SYMBOL WITH A GOLDEN FRAME CAN TURN INTO A {WILD_SYMBOL}!",
			"buy_feature_instructions": "КАЖДОЕ БОНУСНОЕ ВРАЩЕНИЕ БУДЕТ ПРОХОДИТЬ ПО ВЫБРАННОЙ СТАВКЕ {BET}",
			"minimal_bet_is": "МИНИМАЛЬНАЯ СТАВКА {BET}",
			"free_spins_feature_instructions": "• 3 символа SCATTER, выпавшие в любом месте на барабанах, активируют 10 БЕСПЛАТНЫХ ВРАЩЕНИЙ. Каждый дополнительный символ SCATTER активирует 2 дополнительных БЕСПЛАТНЫХ ВРАЩЕНИЯ║║• В начале каждого бесплатного вращения, множитель имеет начальное значение x8.║║• Если в результате бесплатного вращения, выпадет любой выигрыш, то после получения всех выплат и выпадения новых символов, множитель удваивается.║║• БЕСПЛАТНЫЕ ВРАЩЕНИЯ могут быть повторно активированы во время бесплатных вращений.",
			"info_bar_payout": "{SYMBOLS} {×} {PAYOUT} PAID OUT",
			"maximal_win_instructions": "• Максимальный выигрыш (5000x от ставки) составляет {PAYOUT}.",
			"win": "ВЫИГРЫШ",
			"free_spins_feature": "БЕСПЛАТНЫЕ ВРАЩЕНИЯ",
			"get_3_guaranteed_scatters": "ПОЛУЧИТЕ 3 ГАРАНТИРОВАННЫХ СКАТТЕРА И 10 БОНУСНЫХ ВРАЩЕНИЙ",
			"huge_win": "ЭТО HUGE WIN!",
			"gold_framed_symbols_instructions": "• Во время любого вращения некоторые символы (кроме WILD и SCATTER) на барабанах 3 и/или 4 могут быть в ЗОЛОТОЙ РАМКЕ.║║• В каждом следующем раунде, после выпадения новых символов, любые символы в ЗОЛОТОЙ РАМКЕ, участвовавшие в выигрыше в предыдущем раунде, превращаются в WILD.",
			"win_3600_ways_instructions": "• Выигрышные комбинации складываются из символов, идущих подряд слева направо.",
			"click_to_continue": "КЛИКНИТЕ ЧТОБЫ ПРОДОЛЖИТЬ",
			"multiplier": "МНОЖИТЕЛЬ",
			"activate": "АКТИВИРОВАТЬ"
		},
		getTranslatedText
	}) {
		this.isLTRTextDirection = isLTRTextDirection
		this.isMobileApplicationClient = isMobileApplicationClient
		TextField.isLTRTextDirection = isLTRTextDirection
		this.dictionary = dictionary
		if(getTranslatedText) {
			Object.keys(dictionary).forEach(key => dictionary[key] = getTranslatedText(key))
		}


		this.preloadingAssetsMap = preloadingAssetsMap
		this.assetsMap = assetsMap
		this.audioMap = audioMap

		this.languageCode = languageCode
		this.pixiApplication = new Application({
			background: 0x000000,
		})
		this.vfxLevel = customVFXLevel
		this.pixiApplication.view.setAttribute('touch-action', 'none')
		this.pixiApplication.renderer.plugins.accessibility.destroy();
		delete this.pixiApplication.renderer.plugins.accessibility;


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

		
		let timeStampFPS = 0
		Ticker.shared.add(() => {
			Timeline.update()

			const currentTime = Date.now()
			if(currentTime - timeStampFPS < 1000) return

			timeStampFPS = currentTime
		})

		// GUI...
		this.pixiGUIApplication = new Application({
			background: 0x0a153d,
			backgroundAlpha: 0,
			resolution: window.devicePixelRatio
		})
		this.pixiGUIApplication.view.setAttribute('touch-action', 'none')
		this.pixiGUIApplication.renderer.plugins.accessibility.destroy();
		delete this.pixiGUIApplication.renderer.plugins.accessibility;

        // CANVAS APPENDING...
		Object.assign(this.pixiGUIApplication.view.style, {
			width: '100%',
			height: '100%',
			position: 'absolute',
			'z-index': 1,
		})
		document.getElementById(wrapperHTMLElementId)
				.appendChild(this.pixiGUIApplication.view)

		const overlay = this.pixiGUIApplication.view;
		const canvas = this.pixiApplication.view;



		const redirectPointerEvent = (event) => {
			GUIView.isOverlayInteraction || canvas.dispatchEvent(
				new PointerEvent(event.type, event)
			);
		}

		[
			'pointerdown',
			'pointerup',
			'pointermove',
			'pointerover',
			'pointerout',
		].forEach((eventName) => {
			overlay.addEventListener(eventName, (event) => {
				redirectPointerEvent(event)
			});
		});

		// ...CANVAS APPENDING
		// ...GUI
		
		this.guiView = new GUIView(wrapperHTMLElementId)
		this.guiView.alpha = 0
		this.guiView.visible = false
		this.guiView.onWindowVisibleStateChanged = (isVisible) => {
			this.pixiApplication.stage.visible = !isVisible

			this.setGamePlayTimeScale(Number(!isVisible))
		}

		this.pixiGUIApplication.stage.addChild(this.guiView)

		AdaptiveContainer.install([this.pixiApplication, this.pixiGUIApplication], true)
		
		/*
		const renderer = this.pixiApplication.renderer;
		const drawElements = renderer.gl.drawElements;
		let drawCount = 0
		const oldDrawElementsFunction = renderer.gl.drawElements.bind(renderer.gl)

		renderer.gl.drawElements = (arg1, arg2, arg3, arg4) => {

			oldDrawElementsFunction(arg1, arg2, arg3, arg4);
			drawCount++;
		}

		this.pixiApplication.ticker.add(() => {
			document.title = `RC: ${drawCount}`
			drawCount = 0;
		});
		*/


		/*
		const {renderer} = this.pixiGUIApplication
		let drawCount = 0
		const oldDrawElementsFunction = renderer.gl.drawElements.bind(renderer.gl)

		renderer.gl.drawElements = (arg1, arg2, arg3, arg4) => {

			oldDrawElementsFunction(arg1, arg2, arg3, arg4);
			drawCount++;
		}

		this.pixiGUIApplication.ticker.add(() => {
			document.title = `RC: ${drawCount}`
			drawCount = 0;
		});
		*/

		return this
	}

	async init({
		initialReels = getRandomLoseReels(),
		currencyCode,
		betsOptions,
		bet,
		minimalBet,
		maximalBet,
		balance,
		coefficients,
		accounts,
		buyFeatureBetMultiplier,
		locale
	}) {

		// ADJUSTING RESOLUTION...
		const highestResolution = window.devicePixelRatio
		const lowestResolution = Math.min(1.5, highestResolution)
		const resolutionDelta = highestResolution - lowestResolution

		if (this.vfxLevel) {
			this.pixiApplication.renderer.resolution = Math.max(lowestResolution, this.vfxLevel)
		} else {

			const vfxLevel = await getVFXLevel({
				pixiApplication: this.pixiApplication,
				testVFXMultiplier: document.testVFXMultiplier,
				testDelayMultiplier: document.testDelayMultiplier
			})

			this.pixiApplication.renderer.resolution = lowestResolution + resolutionDelta * vfxLevel
			this.vfxLevel = vfxLevel
		}
		// ...ADJUSTING RESOLUTION


		const {stage} = this.pixiApplication

		// FETCHING DICTIONARY...
		//const prefix = '../../public/translations/'
		//if (!locales[prefix + this.languageCode + '.json'])
		//	this.languageCode = 'en'

		//this.dictionary = await locales[prefix + this.languageCode + '.json']()
		// ...FETCHING DICTIONARY

	
		this.assets = await getPreloadingAssets(this.preloadingAssetsMap, this.vfxLevel)
		this.initBitmapFonts(accounts)
		this.initLoadingScreen(this.assets)
		AdaptiveContainer.onResize()

		this.assets = await getAssets(this.assetsMap, this.vfxLevel)
		this.audio.load(this.audioMap)
		await this.guiView.init({
			gameAssets: this.assets,
			dictionary: this.dictionary,
			currencyCode,
			vfxLevel: this.vfxLevel,
			buyFeatureBetMultiplier,
			coefficients,
			isLTRTextDirection: this.isLTRTextDirection,
			isMobileApplicationClient: this.isMobileApplicationClient,
			locale,
			audio: this.audio
		})

		this.initCamera()
		this.initBackground()
		this.initBank()
		this.initReels({initialReels, coefficients})
		this.initSplashScreens()
		stage.addChild(this.loadingScreen)
		this.pixiApplication.renderer.backgroundColor = 0x0a153d
		this.initInteractiveLayer()
		AdaptiveContainer.onResize()
		await this.reelsView.preRenderSymbols()


		this.guiView.refresh({
			dictionary: this.dictionary,
			currencyCode,
			betsOptions,
			autoplayOptions: [5, 10, 25, 50, 100, Infinity],
			balance,
			payout: 0,
			bet,
			minimalBet,
			maximalBet,
			accounts,
		})

		this.guiView.onAutoplaySpinsCountChange = (spinsCount) => {
			this.remainingAutoSpinsCount = spinsCount
			this.guiView.refresh({remainingAutoSpinsCount: spinsCount})
		}

		this.guiView.onTurboToggle = (isTurboMode) => {
			this.gamePlayTimeScale = isTurboMode ? TURBO_MODE_TIME_SCALE : 1
			this.isTurboMode = isTurboMode
			this.setGamePlayTimeScale()
		}

		this.guiView.onSkipRequested = () => { this.skip() }


		await this.loadingScreen.presentInteractionRequest(this.assets)



		const isSignedIn = accounts.find(account => account.isActive)

		isSignedIn && this.guiView.requestFullScreen()

		this.guiView.visible = true
		await Promise.all([
			this.loadingScreen.hide((progress) => {
				this.guiView.alpha = progress
			}).then(() => isSignedIn && this.guiView.requestFullScreen()),
			this.presentIntro()
		])


		this.loadingScreen.destroy()

	}

	initLoadingScreen() {
		const {
			pixiApplication: {stage},
			assets,
			dictionary,
			isMobileDevice,
		} = this

		this.loadingScreen = stage
			.addChild
			(
				new LoadingScreen({
					assets,
					dictionary,
					isMobileDevice
				})
			)
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

	initReels({
		initialReels,
		coefficients,
	}) {
		const {
			pixiApplication: {stage, renderer},
			assets,
			dictionary,
			vfxLevel,
			isMobileDevice,
			camera,
			audio
		} = this

		this.reelsView = stage.addChild(
			new ReelsView({
				initialSymbolsIds: initialReels,
				assets,
				renderer,
				dictionary,
				coefficients,
				vfxLevel,
				isMobileDevice,
				camera,
				audio
			}))

		this.reelsView.infoBarView = this.guiView.infoBarView
		this.bankView.attachReels(this.reelsView)

		// this.reelsView.alpha = 0
		window.flipFactor = 0.25


		this.reelsView.alpha = 0
				window.flipFactor = 10


		window.flipFactor = 0.25 * 0.65
		this.reelsView.alpha = 1
		this.bankView.setFlip(0)
	}

	initBank() {
		const {
			pixiApplication: {stage},
			assets,
			vfxLevel,
			audio
		} = this

		this.skyView = stage.addChild(new SkyView(assets, vfxLevel))
		this.bankView = stage.addChild(
			new BankView({assets, vfxLevel, audio})
		)

		this.bankView.skyView = this.skyView
	}

	initSplashScreens() {
		const {
			pixiApplication: {stage, renderer},
			assets,
			dictionary,
			isMobileDevice,
			camera,
			vfxLevel,
			audio
		} = this

		const awardView = new AwardView({assets, vfxLevel, audio})

		this.bonusAwardSplashScreen = stage
			.addChild(new BonusAwardSplashScreen({
				camera,
				assets,
				renderer,
				dictionary,
				isMobileDevice,
				awardView,
				audio
			}))
		this.bonusPayoutSplashScreen = stage
			.addChild(new BonusPayoutSplashScreen({
				camera,
				assets,
				renderer,
				dictionary,
				isMobileDevice,
				awardView,
				audio
			}))
		this.bigWinPayoutSplashScreen = stage
			.addChild(new BigWinPayoutSplashScreen({
				camera,
				assets,
				renderer,
				dictionary,
				isMobileDevice,
				awardView,
				audio
			}))

		this.splashScreens = [
			this.bonusAwardSplashScreen,
			this.bonusPayoutSplashScreen,
			this.bigWinPayoutSplashScreen
		]
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

	async initBitmapFonts(accounts) {
		const bitmapPhrases = []
		Object.values(this.dictionary).map(text => bitmapPhrases.push(text))

		TextField.fontStyles.default =  {
			fontFamily: "Helvetica",
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
					chars: [new Set([
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
		this.guiView.refresh({isSkipExpected: false})
		this.interactiveLayerView.setInteractive(false)
		this.reelsView.setInteractive(false)
		this.setGamePlayTimeScale(5)
	}

	setGamePlayTimeScale(scale = 1) {
		const turboMultiplier = this.isTurboMode ? TURBO_MODE_TIME_SCALE : 1
		const finalTimeSale = scale * turboMultiplier
		this.reelsView.setTimeScale(finalTimeSale)
		this.bankView.setTimeScale(finalTimeSale)

		this.audio.setTimeScale(scale)
	}

	async getUserInput({
		bet,
		balance,
		betsOptions,
		payout = 0,
		currencyCode,
		winCurrencyCode,
		minimalBet,
		maximalBet,
		activeBonusDescriptor,
		accounts
	}) {
		this.setGamePlayTimeScale()

		this.guiView.refresh({
			bet,
			balance,
			betsOptions,
			currencyCode,
			winCurrencyCode,
			minimalBet,
			maximalBet,
			isSpinExpected: true,
			isSkipExpected: false,
			activeBonusDescriptor,
			payout,
			accounts
		})


		this.interactiveLayerView.setInteractive(false)
		this.reelsView.refreshPayoutsInfo(bet)
		this.reelsView.setInteractive()

		this.remainingAutoSpinsCount = Math.max(0, this.remainingAutoSpinsCount - 1)
		if (this.remainingAutoSpinsCount) {
			return { key: 'make_bet' }
		}

		this.guiView.refresh({
			remainingAutoSpinsCount: this.remainingAutoSpinsCount,
		})

		payout && this.bankView.presentIdle()

		return this.guiView.getUserInput()
	}

	presentBonuses(bonuses = []) {
		this.guiView.presentBonuses(bonuses)
	}


	async presentIntro() {
		this.audio.recoverCookieMuteState()
		this.audio.playMusic()
		// this.assets.music.play({loop: true})
		this.setGamePlayTimeScale()
		this.guiView.refresh({ isSkipExpected: true })
		this.interactiveLayerView.setInteractive()
		this.reelsView.setInteractive(false)
		this.guiView.infoBarView.presentIdle()

		await this.bankView.presentPanorama({
			duration: 2000,
			initialFlipProgress: 0.5,
			flipProgressDelta: 0.5
		})

		this.setGamePlayTimeScale()
		this.guiView.refresh({ isSkipExpected: true })
		this.interactiveLayerView.setInteractive()
		this.reelsView.setInteractive(false)

		await this.bankView.presentIntro()
		this.bankView.presentIdle()
	}

	
	async presentSpinStart({
		balance,
		commonPayout = 0,
		freeSpinsCount,
		currencyCode,
		multiplier = 1,
	}) {
		const { reelsView, dictionary, isLTRTextDirection } = this
		const isSkipExpected = false
		const formattedPayout = formatMoney({
			value: commonPayout ?? 0,
			isLTRTextDirection
		})

		this.bankView.presentIdle()
		this.guiView.infoBarView.presentSpinStart()

		this.audio.presentSpinStart()
		this.guiView.presentPopup()

		this.guiView.refresh({
			activePopupName: '',
			remainingAutoSpinsCount: this.remainingAutoSpinsCount,
			isSpinExpected: false,
			isSkipExpected,
			balance,
			payout: commonPayout,
			currencyCode,
		})

		this.setGamePlayTimeScale()
		this.interactiveLayerView.setInteractive(isSkipExpected)
		reelsView.setInteractive(false)


		// INFO BAR MESSAGE...
		if (commonPayout >= 0) {
			this.presentMessage(dictionary.you_have_won + ' ' + formattedPayout + ' ' + currencyCode)
		} else {
			this.presentMessage(dictionary.good_luck)
		}
		// ...INFO BAR MESSAGE

		this.bankView.presentTension()

		return reelsView.presentSpinStart({
			freeSpinsCount,
			multiplier
		})
	}

	presentSpinStop({
		targetSymbols = getRandomLoseReels(),
		payout,
		isBonusPurchased
	}) {
		this.setGamePlayTimeScale()
		this.guiView.refresh({ isSkipExpected: true })
		this.interactiveLayerView.setInteractive()
		this.reelsView.setInteractive(false)

		payout && this.bankView.presentWin()
		
		this.audio.presentSpinStop()

		return this.reelsView.presentSpinStop({
			targetSymbols,
			isBonusPurchased
		})
	}

	presentCascade({
		payout,
		currencyCode,
		corruptionMap,
		patchMap,
		multiplier = 1,
	}) {
		this.guiView.refresh({ isSkipExpected: true, currencyCode })
		this.setGamePlayTimeScale()

		this.audio.presentWin()

		return this.reelsView.presentCascade({
			payout,
			corruptionMap,
			patchMap,
			multiplier,
			currencyCode
		})
	}

	async presentWin({
		payout,
		coefficient,
		commonPayout,
		currencyCode
	}) {
		this.setGamePlayTimeScale()
		const {
			reelsView,
		} = this
		
		this.guiView.refresh({
			isSkipExpected: true,
			payout: commonPayout,
			currencyCode
		})
		this.interactiveLayerView.setInteractive()
		this.reelsView.setInteractive(false)

		reelsView
			.presentWin({
				totalPayout: payout,
				coefficient,
			})

		this.guiView.infoBarView.presentCommonPayout({payout, currencyCode})
	}

	async presentFreeSpinsAward({awardedFreeSpinsCount, freeSpinsCount}) {
		this.guiView.refresh({ isSkipExpected: true })

		this.interactiveLayerView.setInteractive()
		this.reelsView.setInteractive(false)
		this.setGamePlayTimeScale()
		this.guiView.infoBarView.presentFreeSpinsAward({
			scattersCount: this.reelsView.getScattersCount(),
			freeSpinsCount: awardedFreeSpinsCount
		})

		this.audio.presentBigWin()
		await this.bankView.presentFreeSpinsAward(freeSpinsCount)

		this.guiView.refresh({ isSkipExpected: false })
		this.interactiveLayerView.setInteractive(false)
		this.setGamePlayTimeScale()

		return this.bonusAwardSplashScreen.presentAward({
			awardedFreeSpinsCount
		})
	}
	

	presentLose() {
		this.guiView.infoBarView.presentLose()
		this.bankView.presentLose()
		this.presentMessage(this.dictionary.no_luck)
	}


	async presentTransitionToBonusGame({
		awardedFreeSpinsCount,
		multiplier
	}) {
		this.setGamePlayTimeScale()
		this.guiView.refresh({ isSkipExpected: false })
		this.interactiveLayerView.setInteractive(false)
		this.reelsView.setInteractive(false)

		this.guiView.infoBarView.presentFreeSpinsAward({
			scattersCount: this.reelsView.getScattersCount(),
			freeSpinsCount: awardedFreeSpinsCount
		})
		this.audio.presentFreeSpinsIntro()
		await this.reelsView.presentFreeSpinsAward(awardedFreeSpinsCount)
		this.audio.presentBigWin()
		await this.bonusAwardSplashScreen.presentAward({awardedFreeSpinsCount, awardedKeysCount: 5})
		
		this.setGamePlayTimeScale()
		this.guiView.refresh({ isSkipExpected: true })
		this.interactiveLayerView.setInteractive()
		this.reelsView.setInteractive(false)
		await this.bankView.presentTransitionToFreeSpinsPart1(multiplier)


		this.setGamePlayTimeScale()
		this.guiView.refresh({ isSkipExpected: true })
		this.interactiveLayerView.setInteractive()
		this.reelsView.setInteractive(false)
		return this.bankView.presentTransitionToFreeSpinsPart2(awardedFreeSpinsCount)
	}


	async presentTransitionToDefaultGame({payout, balance, currencyCode, multiplier}) {
		this.setGamePlayTimeScale()
		this.guiView.refresh({ isSkipExpected: false })
		this.interactiveLayerView.setInteractive(false)
		this.reelsView.setInteractive(false)

		this.guiView.infoBarView.presentCommonPayout({payout, delay: 10000, currencyCode})
		this.audio.presentBigWin()
		await this.reelsView.presentFreeSpinsAward(0)
		
		await this.bonusPayoutSplashScreen.presentPayout(payout)
		this.interactiveLayerView.setInteractive(true)
		this.guiView.refresh({ isSkipExpected: true })
		const {isLTRTextDirection} = this
		const formattedPayout = formatMoney({
			value: payout,
			currencyCode,
			isLTRTextDirection
		})

		this.presentMessage(
			isLTRTextDirection
				? this.dictionary.you_have_won + ' ' + formattedPayout
				: formattedPayout + ' ' + this.dictionary.you_have_won
		)

		this.guiView.refresh({balance, payout })
		this.setGamePlayTimeScale()
		this.guiView.refresh({ isSkipExpected: true })
		this.interactiveLayerView.setInteractive()
		this.reelsView.setInteractive(false)

		await Promise.all([
			this.reelsView.presentFreeSpinsCount(0),
			this.bankView.presentTransitionFromFreeSpinsPart1(multiplier)
		])

		this.setGamePlayTimeScale()
		this.guiView.refresh({ isSkipExpected: true })
		this.interactiveLayerView.setInteractive()
		this.reelsView.setInteractive(false)

		return this.bankView.presentTransitionFromFreeSpinsPart2()
	}

	presentTotalWin({
		totalCoefficient,
		totalPayout,
		currencyCode,
		balance
	}) {
		this.setGamePlayTimeScale()
		this.guiView.infoBarView.presentCommonPayout({payout: totalPayout, currencyCode})
		if(totalCoefficient < WIN_COEFFICIENTS.BIG) return

		this.guiView.refresh({
			isSkipExpected: false ,
			balance: balance - totalPayout,
			currencyCode
		})
		this.interactiveLayerView.setInteractive(false)

		this.audio.presentBigWin()
		return this.bigWinPayoutSplashScreen.presentPayout({
			coefficient: totalCoefficient,
			payout: totalPayout,
		})
	}

	presentMessage(text) {
		return this.guiView.presentMessage(text)
	}

	presentError(errorCode) {
		this.setGamePlayTimeScale()
		this.reelsView.reset()
		this.remainingAutoSpinsCount = 0
		this.guiView.refresh({
			isSkipExpected: false,
			remainingAutoSpinsCount: 0,
			errorText: this.dictionary['error_' + errorCode] ?? errorCode
		})

		this.guiView.presentError(errorCode)

		this.bankView.presentLose()

		this.interactiveLayerView.setInteractive(false)
	}

	presentNetworkResponseAwait() {
		this.guiView.refresh({
			isSpinExpected: false
		})

		this.interactiveLayerView.setInteractive(false)
		this.reelsView.setInteractive(false)
	}

	setAdaptiveDesignOffsets({
		offsetTop = 0,
		offsetBottom = 0,
	}) {
		this.bankView.setAdaptiveDesignOffsets({offsetTop, offsetBottom})
		this.skyView.setAdaptiveDesignOffsets({offsetTop, offsetBottom})
		this.splashScreens.forEach(view => view.setAdaptiveDesignOffsets({offsetTop, offsetBottom}))
		this.guiView.setAdaptiveDesignOffsets({offsetTop, offsetBottom})
	}

	resolve() {
		this.guiView.resolve?.({})
	}


	setAudioPaused(isPaused = true) {
		this.audio.setPaused(isPaused)
	}
	// ...API
}