import { Container, Graphics, Sprite } from "pixi.js"
import { BaseReelsView } from "./BaseReelsView"
import { PayoutsInfoPanelView } from "./PayoutsInfoPanelView"
import { Timeline } from "../../timeline/Timeline"
import {
	CELL_HEIGHT,
	CELL_WIDTH,
	CELLS_PER_REEL_COUNT,
	REELS_HEIGHT,
	REELS_WIDTH,
} from "../../Constants"
import { getRandomLoseReels } from "../../Utils"
import { InfoBarViewBCP } from "./InfoBarViewBCP"
import { BigWinView } from "./BigWinView"
import { LogoView } from "./LogoView"


export class ReelsView extends BaseReelsView {
	interactiveView
	payoutsInfoPanelView
	blackoutView
	isMobileDevice
	featureTimeline = new Timeline

	constructor({
		initialSymbolsIds,
		assets,
		renderer,
		dictionary,
		coefficients,
		vfxLevel,
		isMobileDevice,
	}) {
		super({
			initialSymbolsIds,
			assets,
			vfxLevel
		})

		this.setSourceArea({width: REELS_WIDTH, height: REELS_HEIGHT})
		this.isMobileDevice = isMobileDevice
		this.initInfoBar(assets)
		this.initLogo(assets)
		this.initBackgrounds(assets)
		this.initBigWin(assets, dictionary)
		this.initPayoutsInfoPanel(assets, coefficients)
		this.setupInteractivity()
	}

	initLogo(assets) {
		this.logoView = this.addChildAt(new LogoView(assets), 0)
		this.logoView.scale.set(0.7)
		this.logoView.position.set(REELS_WIDTH / 2, -95)
	}

	initBackgrounds(assets) {
		// BACKGROUND...
		const backgroundView = this.addChildAt(new Sprite(assets.reels_mobile_background), 1)
		// backgroundView.scale.set(1.8)
		backgroundView.position.set(-40, -32)
		// ...BACKGROUND
	}

	initInfoBar(assets) {
		this.infoBarView = this.addChild(new InfoBarViewBCP({assets}))
		this.infoBarView.position.set(775, -115)
		this.infoBarView.alpha = 0
	}


	initFrame(assets) {
		const backgroundWidth = CELL_WIDTH * 3
		const backgroundHeight = REELS_HEIGHT - 2 + 2
		const container = this.addChildAt(new Container, 0)
	

		// BLACKOUT...
		this.blackoutView = this
			.addChildAt(new Graphics, 1)
			.beginFill(0x000000, 0.6)
			.drawRect(
				-backgroundWidth / 2,
				-backgroundHeight / 2 - 2,
				backgroundWidth,
				backgroundHeight)
			.endFill()

		this.blackoutView.position.set(REELS_WIDTH / 2, REELS_HEIGHT / 2)
		this.blackoutView.alpha = 0
		// ...BLACKOUT


		container.cacheAsBitmap = true
	}

	initPayoutsInfoPanel(assets, coefficients) {
		this.payoutsInfoPanelView = this.addChild(
			new PayoutsInfoPanelView({
				assets,
				reelsView: this,
				coefficients,
			}))

		this.payoutsInfoPanelView.x = this.reelsContainer.x
		this.payoutsInfoPanelView.y = 0
	}

	initBigWin(assets, dictionary) {
		const view = new BigWinView(assets, dictionary)
		view.position.set(REELS_WIDTH / 2, REELS_HEIGHT / 2)
		this.bigWinView = this.addChild(view)
		view.reelsView = this
	}

	setupInteractivity() {
		const { payoutsInfoPanelView } = this
		const interactiveView = this
			.reelsContainer
			.addChild(new Graphics)
			.beginFill(0xFFFFFF, 0.0001)
			.drawRect(0, 0, REELS_WIDTH, REELS_HEIGHT)
			.endFill()

		interactiveView.cursor = 'pointer'
		interactiveView.eventMode = 'static'
		interactiveView.on('pointerdown', ({global}) => {
			if (payoutsInfoPanelView.capturedSymbolView)
				return payoutsInfoPanelView.hide()

			const {x, y} = interactiveView.toLocal(global)
			const cellX = Math.trunc(x / CELL_WIDTH)
			const cellY = Math.trunc(y / CELL_HEIGHT + 1)

			if (cellY <= 0 || cellY > CELLS_PER_REEL_COUNT) return

			const cellView = this.reelsViews[cellX].cellsViews[cellY]

			payoutsInfoPanelView.presentPayouts({
				capturedSymbolView: cellView.getSymbolView(),
				x: cellX,
				y: cellY - 1,
				symbolId: cellView.currentSymbolId
			})

		})
		this.interactiveView = interactiveView
		this.setInteractive(false)
	}

	updateTargetArea(sidesRatio) {
		const {
			isMobileDevice,
		} = this

		this.payoutsInfoPanelView.hide()

		if(sidesRatio > 1.25 && !isMobileDevice) {
			// DESKTOP LANDSCAPE...
			this.setTargetArea({x: 0, y: 0.15, width: 1, height: 0.7})
			// ...DESKTOP LANDSCAPE
		} else if (sidesRatio > 1.25 && isMobileDevice) {
			// MOBILE LANDSCAPE...
			const panelWidth = isMobileDevice ? 0.2 : 0.125
			this.setTargetArea({x: panelWidth, y: 0.05, width: 1 - panelWidth * 2, height: 0.7})
			// ...MOBILE LANDSCAPE
		} else if (sidesRatio > 0.6) {
			// WIDE PORTRAIT...
			this.setTargetArea({x: 0.08, y: 0.2, width: 0.84, height: 0.5})
			// ...WIDE PORTRAIT
		} else {
			// NARROW PORTRAIT...
			this.setTargetArea({x: 0.08, y: 0.2, width: 0.84, height: 0.6})
			// ...NARROW PORTRAIT
		}

		// this.highlight()
	}


	// API...
	setBrightness({ key, map, brightness }) {
		super.setBrightness({ key, map, brightness })
	}

	presentCellsWin({ key, map, progress }) {
		for(let x = 0; x < map.length; x++)
			for(let y = 0; y < map[0].length; y++)
				if(map[x][y] === key)
					this.cellsViews[x][y + 1]
						.getSymbolView()
						.presentWin(progress)
	}


	setMasked(isMasked = true) {
		super.setMasked(isMasked)
	}

	setInteractive(isInteractive = true) {
		this.interactiveView.visible = isInteractive
	}

	presentRandomSymbols() {
		getRandomLoseReels().forEach((reel, x) =>
			reel.forEach((symbolId, y) =>
				this.cellsViews[x][y].presentSymbol(symbolId)))
	}

	reset() {
		super.reset()
		this.setInteractive(false)
	}

	setTimeScale(scale) {
		super.setTimeScale(scale)
		this.bigWinView.setTimeScale(scale)
	}


	presentIntro() {
		// const initialReels = this.getCurrentSymbolsIds()
		// this.placeholdersTableView.setVisible([1, 1, 1, 1, 1, 1, 1]) 
		/*
		this.presentExpansion({
			length: 7,
			forcePresent: true
		})

		this.timeline.deleteAllAnimations()

		let cellIndex = 0
		for (let x = 0; x < initialReels.length; x++) {
			for (let y = 0; y < initialReels[x].length; y++) {
				const view = this.cellsViews[x][y + 1]
				cellIndex++

				const isEmptyCell = y < 2 || y > 4

				this.timeline.addAnimation({
					delay: cellIndex * 10,
					duration: 500,
					onStart: _ => {
						view.setFlip(0.5)
						view.setBrightness(1)
						view.presentSymbol(isEmptyCell ? 0 : initialReels[x][y])
					},
					onProgress: progress => {
						view.setFlip(0.5 + progress * 0.5)
					}
				})
			}
		}

		this.presentExpansion({
			length: 3,
			forcePresent: true
		})
		*/
	}

	refreshPayoutsInfo(bet) {
		this.payoutsInfoPanelView.setBet(bet)
	}

	presentWin({
		totalPayout,
	}) {
		this.reset()

		const {
			timeline,
		} = this

		this.setMasked(false)

		return timeline
			.deleteAllAnimations()
			.addAnimation({
				delay: 800,
				duration: 500,
				onProgress: progress => {
					/*
					let brightness = 1

					if (progress < 0.25) {
						brightness = 1 - progress / 0.25
					} else if (progress > 0.75) {
						brightness = (progress - 0.75) / 0.25
					} else {
						brightness = 0
					}

					this.setBrightness({
						brightness
					})
						*/
	
				}
			})
			.play()
	}

	presentBigWin(payout, currencyCode) {
		return this.bigWinView.present(payout, currencyCode)
	}

	async presentSpinStart() {
		if(this.timeline.isPlaying)
			this.reset()

		await this.payoutsInfoPanelView.hide()

		return super.presentSpinStart()
	}

	async presentSpinStop({
		targetSymbols,
	}) {
		const targetSymbolsIds = targetSymbols.map(reel => reel.map(symbol => symbol))

		await super.presentSpinStop({
			targetSymbolsIds,
		})

		this.setMasked(false)
	}

	presentMessage({
        text,
        forcePresent = false,
        color,
    }) {
		return this.infoBarView.presentMessage({
			text,
			forcePresent,
			color,
		})
	}

	hidePayoutsInfo() {
		return this.payoutsInfoPanelView.hide()
	}

	reset() {
		this.timeline.wind(1).deleteAllAnimations()
		this.cellsViews.forEach(reel => reel.forEach(view => view.reset()))
		this.setBrightness({brightness: 1})
	}
	// ...API
}