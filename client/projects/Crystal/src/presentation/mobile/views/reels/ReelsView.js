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
import { BigWinView } from "./BigWinView"
import { LogoView } from "./LogoView"


export class ReelsView extends BaseReelsView {
	interactiveView
	payoutsInfoPanelView
	isMobileDevice
	featureTimeline = new Timeline

	constructor({
		initialSymbolsIds,
		assets,
		dictionary,
		coefficients,
		isMobileDevice,
	}) {
		super({
			initialSymbolsIds,
			assets,
		})

		this.setSourceArea({width: REELS_WIDTH, height: REELS_HEIGHT})
		this.isMobileDevice = isMobileDevice
		this.initLogo(assets)
		this.initBackground(assets)
		this.initBigWin(assets, dictionary)
		this.initPayoutsInfoPanel(assets, coefficients)
		this.setupInteractivity()
	}

	initLogo(assets) {
		this.logoView = this.addChildAt(new LogoView(assets), 0)
		this.logoView.scale.set(0.7)
		this.logoView.position.set(REELS_WIDTH / 2, -95)
	}

	initBackground(assets) {
		const backgroundView = this.addChildAt(new Sprite(assets.reels_mobile_background), 1)
		backgroundView.position.set(-40, -32)
	}

	initPayoutsInfoPanel(assets, coefficients) {
		this.payoutsInfoPanelView = this
			.reelsContainer
			.addChild(
				new PayoutsInfoPanelView({
					assets,
					reelsView: this,
					coefficients,
				}))
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
		this.setMasked(!isInteractive)
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

	refreshPayoutsInfo(bet) {
		this.payoutsInfoPanelView.setBet(bet)
	}

	presentBigWin(payout, currencyCode) {
		return this.bigWinView.present(payout, currencyCode)
	}

	async presentSpinStart() {
		await this.payoutsInfoPanelView.hide()
		return super.presentSpinStart()
	}

	async presentSpinStop(targetSymbols) {
		const targetSymbolsIds = targetSymbols.map(reel => reel.map(symbol => symbol))

		await super.presentSpinStop({
			targetSymbolsIds,
		})

		this.setMasked(false)
	}


	hidePayoutsInfo() {
		return this.payoutsInfoPanelView.hide()
	}

	reset() {
		this.setBrightness({brightness: 1})
	}
	// ...API
}