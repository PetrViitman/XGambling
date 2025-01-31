import { Container, Sprite } from "pixi.js"
import { TextField } from "../text/TextField"
import { CELL_HEIGHT, CELL_WIDTH, REELS_COUNT } from "../../Constants"
import { Timeline } from "../../timeline/Timeline"
import { formatMoney } from "../../Utils"

const PAYOUTS_IDS_COLOR_MAP = {
	0: 0xFF55ff, // 10
	1: 0xAAff00, // Q
	2: 0x00AAff, // J
	3: 0xFF8800, // A
	4: 0xFF5500, // K
	5: 0x55EEFF, // scarab
	6: 0xffd300, // eye
	7: 0x7766FF, // pharaoh
	8: 0xFF5500, // ankh
	9: 0xff6f00, // book
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
		resources,
		reelsView,
		coefficients,
		camera
	}) {
		super()

		this.camera = camera
		this.coefficients = coefficients
		this.reelsView = reelsView
		this.contentContainer = this.addChild(new Container)
		this.initPanel(resources)
		this.initPayouts()
		this.initSymbolContainer()
		this.contentContainer.visible = false
	}

	initSymbolContainer() {
		this.symbolContainer = this.contentContainer.addChild(new Container)
		this.symbolContainer.position.set(CELL_WIDTH / 2, CELL_HEIGHT / 2)
	}

	initPanel(resources) {
		const sprite = new Sprite(resources.payout_panel)
		this.panelView = this.contentContainer.addChild(sprite)
	}

	initPayouts() {
		this.payoutsContainer = this
			.contentContainer
			.addChild(new Container)
	
		for(let i = 0; i < 4; i++) {
			const textField = this
				.payoutsContainer
				.addChild(
					new TextField({
						maximalWidth: 215,
						maximalHeight: 43
					}))
				.setFontName('egypt')
				.setFontColor(0x00FF00)
				.setFontSize(50)
				.setAlignMiddle()
			
			textField.y = i * 43 + 23
			this.payoutsViews.push(textField)
		}
	}

	hide() {
		const {
			camera,
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
					reelsView.winTabloidView.alpha = progress
					reelsView.winLinesPoolView.alpha = progress
					contentContainer.alpha = 1 - progress
					camera
						.focus({view: this.capturedSymbolView})
						.setZoom(1 + ZOOM_DELTA  * (1 - progress))


					this.capturedSymbolView.presentDemo(1 - progress)
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
		const {coefficients, capturedSymbolId } = this

		if(capturedSymbolId === undefined) return

		const coefficientsArray = Object.values(coefficients[capturedSymbolId])
		const symbolsCountOffset = 5 - coefficientsArray.length
		const textFieldHeight = 175 / coefficientsArray.length

		this.payoutsViews.forEach((view, i) => {
			const coefficient = coefficientsArray[i]
			const payout = formatMoney(coefficient * this.bet)

			view.visible = !!coefficient
			color && view.setFontColor(color)
			view.setText((i + symbolsCountOffset + 1) + 'x: ' + payout)
			view.y = textFieldHeight * i + 23
			view.setMaximalHeight(textFieldHeight)
		})
	}

	async presentPayouts({
		capturedSymbolView,
		x,
		y,
		symbolId,
	}){
		const {
			camera,
			timeline,
			reelsView,
			coefficients,
			contentContainer,
		} = this

		if(!coefficients[symbolId]) return
		if(contentContainer.visible) return
		
		// KEEPING PANEL INSIDE REELS...
		if (x < REELS_COUNT - 2) {
			this.payoutsContainer.x = 240
			this.panelView.x = 0
		} else {
			this.payoutsContainer.x = -190
			this.panelView.x = -230
		}
		// ...KEEPING PANEL INSIDE REELS

		this.capturedSymbolParentContainer = capturedSymbolView.parent
		this.capturedSymbolView = capturedSymbolView
		this.capturedSymbolId = symbolId
		this.symbolContainer.addChild(capturedSymbolView)
		this.contentContainer.position.set(
			x * CELL_WIDTH,
			y * CELL_HEIGHT)

		// capturedSymbolView.presentAnimation({index: 0})
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
					reelsView.winTabloidView.alpha = 1 - progress
					reelsView.winLinesPoolView.alpha = 1 - progress
					reelsView.setBrightness({
						brightness: 1 - progress
					})

					this.reelsView.setBrightness({brightness: 1 - progress})
					capturedSymbolView.setBrightness(1)

					this.capturedSymbolView.presentWin(0)
					this.capturedSymbolView.presentDemo(progress)
					this.capturedSymbolView.idleFactor = 1 - Math.sin(Math.PI * progress)

					camera
						.focus({view: this.capturedSymbolView})
						.setZoom(1 + ZOOM_DELTA  * progress)
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
							symbolView.presentWin(0)
							symbolView.idleFactor = 1
							symbolView.update(progress)
						}
					}))

					capturedSymbolView.idleFactor = 1
					capturedSymbolView.setBrightness(1)
					capturedSymbolView.update(progress)
					capturedSymbolView.presentDemo(1)
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