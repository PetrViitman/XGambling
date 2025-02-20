import { Container, Graphics, Sprite } from "pixi.js"
import { TextField } from "../text/TextField"
import { CELL_HEIGHT, CELL_WIDTH, REELS_COUNT } from "../../Constants"
import { Timeline } from "../../timeline/Timeline"
import { formatMoney } from "../../Utils"

const PAYOUTS_IDS_COLOR_MAP = {
	1: 0x00e1ff, // '10'
	2: 0x00ffb7, // 'J'
	3: 0xffc600, // 'Q'
	4: 0xff8b00, // 'K'
	5: 0xff0021, // 'A'
	6: 0x0084ff, // 'meat'
	7: 0xffd300, // 'horn'
	8: 0xd3ff00, // 'female'
	9: 0x006dff, // 'viking'
	10: 0xff6f00, // 'warchief's
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
		const sprite = new Sprite(resources.coefficients_panel)
		sprite.scale.set(1.25)
		sprite.pivot.set(20, 20)
		
		this.panelView = this.contentContainer.addChild(sprite)
	}

	initPayouts() {
		this.payoutsContainer = this
			.contentContainer
			.addChild(new Container)
	
		for(let i = 0; i < 2; i++) {
			const textField = this
				.payoutsContainer
				.addChild(
					new TextField({
						maximalWidth: 140,
						maximalHeight: 70
					}))
				.setFontName('default')
				.setFontColor(0x00FF00)
				.setFontSize(50)
				.setAlignLeft()
			
			textField.y = i * 70
			this.payoutsViews.push(textField)
		}

		this.payoutsViews[0].setAlignBottom()
		this.payoutsViews[1].setAlignTop()
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

					this.reelsView
						.cellsViews
						.forEach(reel => reel
							.forEach(view => view
								.setFlip(0.49999 * (1 - progress))))
				},
				onFinish: () => {
					this.reelsView
						.cellsViews
						.forEach(reel => reel
							.forEach(view => view
								.getSymbolView()
								.setLockedBrightness()))

					this.capturedSymbolView.setLockedBrightness()
					this.capturedSymbolParentContainer
						.addChild(this.capturedSymbolView)

					this.capturedSymbolView = undefined
					this.contentContainer.visible = false
					this.isHiding = false
				}
			})
			.windToTime(1)
			.play()
	}

	updatePayoutsTexts(color) {
		if(!this.capturedSymbolId) return

		if(this.coefficients[this.capturedSymbolId][2]) {
			this.payoutsViews.forEach((view, i) => {
				const coefficient = this.coefficients[this.capturedSymbolId][i + 2]
				const payout = formatMoney(coefficient * this.bet)
				color && view.setFontColor(color)
				view.setText((i + 2) + 'x: ' + payout)
			})
		} else {
			const coefficient = this.coefficients[this.capturedSymbolId][3]
			const payout = formatMoney(coefficient * this.bet)
			this.payoutsViews[0].setText('3x:')
			this.payoutsViews[1].setText(payout + '')

			if (color) {
				this.payoutsViews[0].setFontColor(color)
				this.payoutsViews[1].setFontColor(color)
			}
		}
	}

	presentPayouts({
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

		capturedSymbolView.setLockedBrightness(1)
		
		// KEEPING PANEL INSIDE REELS...
		if (x < REELS_COUNT - 2) {
			this.payoutsContainer.x = 190
			this.panelView.x = 0
		} else {
			this.payoutsContainer.x = -145
			this.panelView.x = -150
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
		
		return timeline
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
					capturedSymbolView.setBrightness(1)

					camera
						.focus({view: this.capturedSymbolView})
						.setZoom(1 + ZOOM_DELTA  * progress)

					this.reelsView
						.cellsViews
						.forEach(reel => reel
							.forEach(view => view
								.setFlip(0.49999 * progress)))
				}
			})
			.play()
	}

	setBet(bet) {
		this.bet = bet
		this.updatePayoutsTexts()
	}
}