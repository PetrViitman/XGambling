import { Container, Sprite } from "pixi.js"
import { TextField } from "../text/TextField"
import { CELL_HEIGHT, CELL_WIDTH, CELLS_PER_REEL_COUNT, REELS_COUNT, WILD_SYMBOL_ID } from "../../Constants"
import { Timeline } from "../../timeline/Timeline"
import { formatMoney } from "../../Utils"

const PAYOUTS_IDS_COLOR_MAP = {
	1: 0x66EEFF, // WILD
	2: 0xFF3300, // RED
	3: 0xFF99FF, // PINK
	4: 0x99FF00, // GREEN
	5: 0xFFAA33, // YELLOW
	6: 0x33FFFF, // AZURE
	7: 0x33AAFF, // BLUE
}

const ZOOM_DELTA = 0.5

export class PayoutsInfoPanelView extends Container {
	coefficients
	bet
	reelsView
	contentContainer
	panelView
	symbolContainer
	payoutsContainer
	payoutsViews = []
	capturedSymbolParentContainer
	capturedSymbolView
	capturedSymbolId
	timeline = new Timeline
	camera
	isHiding
	
	constructor({
		assets,
		reelsView,
		coefficients,
		camera
	}) {
		super()

		this.camera = camera
		this.coefficients = coefficients
		this.reelsView = reelsView
		this.contentContainer = this.addChild(new Container)
		this.initPanel(assets)
		this.initPayouts()
		this.initSymbolContainer()
		this.contentContainer.visible = false
	}

	initSymbolContainer() {
		this.symbolContainer = this.contentContainer.addChild(new Container)
	}

	initPanel(assets) {
		const sprite = new Sprite(assets.payouts_panel)
		sprite.scale.set(1.23)
		sprite.y = -30
		this.panelView = this.contentContainer.addChild(sprite)
	}

	initPayouts() {
		this.payoutsContainer = this
			.contentContainer
			.addChild(new Container)
	
		for(let i = 0; i < 9; i++) {
			const height = 25
			const textField = this
				.payoutsContainer
				.addChild(
					new TextField({
						maximalWidth: 175,
						maximalHeight: height
					}))
				.setFontName('default')
				.setFontColor(0xFFFFFF)
				.setFontSize(200)
				.setAlignMiddle()
			
			textField.y = i * height + 20
			this.payoutsViews.push(textField)
		}
	}

	hide() {
		const {
			timeline,
			reelsView,
			contentContainer
		} = this

		if(!contentContainer.visible) return
		if(this.isHiding) return

		return timeline
			.deleteAllAnimations()
			.addAnimation({
				duration: 150,
				onStart: () => {
					this.isHiding = true
				},
				onProgress: (progress) => {
					reelsView.setBrightness({ brightness: progress })
					contentContainer.alpha = 1 - progress


					this.capturedSymbolView.presentCoefficients(1 - progress)
				},
				onFinish: () => {
					this.capturedSymbolParentContainer
						.addChild(this.capturedSymbolView)

					this.capturedSymbolView = undefined
					this.contentContainer.visible = false
					this.isHiding = false
					this.reelsView.timeline.play()
				}
			})
			.windToTime(1)
			.play()
	}

	updatePayoutsTexts(color) {
		const {coefficients } = this
		const capturedSymbolId = Math.abs(this.capturedSymbolId)

		if(capturedSymbolId === undefined) return

		if (coefficients[capturedSymbolId]) {

			const coefficientsArray = Object.values(coefficients[capturedSymbolId])
			const symbolsCountOffset = 5 - coefficientsArray.length
			const textFieldHeight = 240 / coefficientsArray.length

			this.payoutsViews.forEach((view, i) => {
				const coefficient = coefficientsArray[i]
				const payout = formatMoney(coefficient * this.bet)

				view.visible = !!coefficient
				color && view.setFontColor(color)
				view.setText((i + symbolsCountOffset + 5) + (i > 3 ? '+' : '') + 'x: ' + payout)
				view.y = textFieldHeight * i + 2
				view.setMaximalHeight(textFieldHeight)
			})
		} else if (capturedSymbolId === WILD_SYMBOL_ID) {
			this.payoutsViews.forEach(view => view.setText(''))
			this.payoutsViews[0].y = 2
			this.payoutsViews[0].setMaximalHeight(240)
			this.payoutsViews[0].setText('WILD')
			color && this.payoutsViews[0].setFontColor(color)
		}
	}

	async presentPayouts({
		capturedSymbolView,
		x,
		y,
		symbolId,
	}){
		const {
			timeline,
			reelsView,
			contentContainer,
		} = this

		// if(!coefficients[symbolId]) return
		if(contentContainer.visible) return
		
		// KEEPING PANEL INSIDE REELS...
		if (x < REELS_COUNT / 2) {
			this.payoutsContainer.x = 75
			this.panelView.x = -30
		} else {
			this.payoutsContainer.x = -177
			this.panelView.x = -213
		}

		if (y < CELLS_PER_REEL_COUNT / 2) {
			this.payoutsContainer.y = 6
			this.panelView.y = -25
		} else {
			this.payoutsContainer.y = -180
			this.panelView.y = -210
		}
		// ...KEEPING PANEL INSIDE REELS

		this.capturedSymbolParentContainer = capturedSymbolView.parent
		this.capturedSymbolView = capturedSymbolView
		this.capturedSymbolId = symbolId
		this.symbolContainer.addChild(capturedSymbolView)
		this.contentContainer.position.set(
			x * CELL_WIDTH,
			y * CELL_HEIGHT)

		this.updatePayoutsTexts(PAYOUTS_IDS_COLOR_MAP[symbolId])
		
		await timeline
			.deleteAllAnimations()
			.addAnimation({
				duration: 250,
				onStart: () => {
					this.contentContainer.visible = true
				},
				onProgress: (progress) => {
					contentContainer.alpha = progress
					reelsView.setBrightness({
						brightness: 1 - progress
					})
					
					capturedSymbolView.setBrightness(1)

					//reelsView.cellsViews.forEach(
					//	reel => reel.forEach(view => view.getSymbolView().presentWin(0)))

					this.capturedSymbolView.presentCoefficients(progress)
					// this.capturedSymbolView.idleFactor = 1 - Math.sin(Math.PI * progress)
				}
			})
			.play()

		timeline
			.deleteAllAnimations()
			.addAnimation({
				duration: 5000,
				onProgress: progress => {
					reelsView.timeline.pause()
					reelsView.cellsViews.forEach(reel => reel.forEach(view => {
						const symbolView = view.getSymbolView()
						if(symbolView !== capturedSymbolView) {
							symbolView.setBrightness(0)
						}
					}))

					capturedSymbolView.setBrightness(1)
				}
			})
			.setLoopMode()
			.play()
	}

	setBet(bet) {
		this.bet = bet
		this.updatePayoutsTexts()
	}
}