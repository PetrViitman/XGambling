import { Container, Sprite } from "pixi.js";
import { CELL_HEIGHT } from "../../Constants";
import { Timeline } from "../../timeline/Timeline";
import { brightnessToHexColor, getRectangleSpot } from "../GraphicalPrimitives";
import { TextField } from "../text/TextField";

export class CounterView extends Container {
	bodyContainer
	faceView
	borderView
	logoView
	textContainer
	textField
	timeline = new Timeline
	remainingSpinsCount

	constructor({
		resources,
		headerText,
		color = 0xFF5500
	}) {
		super()

		
		this.initBody(resources)
		this.initText(headerText, color)
		this.setFlip()
	}

	initBody(resources) {
		this.bodyContainer = this.addChild(new Container)

		this.borderView = this.bodyContainer.addChild(new Sprite(resources.frame_border))
		this.borderView.anchor.set(0.5, 0.5)
		this.borderView.y = CELL_HEIGHT / 2

		const sprite = new Sprite(resources.symbol_empty)
		sprite.anchor.set(0.5)
		this.faceView = sprite
		this.bodyContainer.addChild(sprite)

		const logo = new Sprite(resources.x_logo)
		logo.anchor.set(0.5)
		this.logoView = this.bodyContainer.addChild(logo)
	}

	initText(headerText, color = 0xFFFFFF) {
		this.textContainer = this.bodyContainer.addChild(new Container)
		this.textContainer.visible = false

		// CAPTION...
		const captionView = this
			.textContainer
			.addChild(new TextField({
				maximalWidth: 150,
				maximalHeight: 30
			}))

		captionView.position.set(-75, -60)

		captionView.setFontName('default')
		captionView
			.setText(headerText)
			.setFontSize(100)
			.setAlignCenter()
			.setAlignMiddle()
			.setFontColor(color)
			.setLetterSpacing(0)
		// ...CAPTION

		// TEXT FIELD...
		this.textField = this
			.textContainer
			.addChild(new TextField({
				maximalWidth: 150,
				maximalHeight: 110
			}))
			.setFontColor(color)

		this.textField.position.set(-75, -43)

		this.textField.setFontName('default')
		this.textField
			.setText('10')
			.setFontSize(100)
			.setAlignCenter()
			.setAlignTop()
			.setLetterSpacing(0)
		// ...TEXT FIELD
	}

	setFlip(progress = 0.001) {
		const {
			bodyContainer,
			borderView,
			faceView,
			logoView,
			textContainer,
		} = this
		const shiftedProgress = (progress + 0.5) % 1
		const finalProgress = Math.sin(Math.PI * shiftedProgress)
		bodyContainer.scale.y = finalProgress
		bodyContainer.scale.x = 0.95 + 0.05 * finalProgress
		bodyContainer.y = Math.sin(Math.PI * 2 * shiftedProgress) * 5
		faceView.tint = brightnessToHexColor(finalProgress)

		borderView.scale.y = 1 / finalProgress - finalProgress
		borderView.tint = brightnessToHexColor(Math.max(0.5, 1 - finalProgress))

		logoView.alpha = finalProgress
		textContainer.alpha = finalProgress

		if(shiftedProgress < 0.5) {
			borderView.y = -CELL_HEIGHT / 2 + 1
			borderView.anchor.y = 1
		} else {
			borderView.y = CELL_HEIGHT / 2 - 1
			borderView.anchor.y = 0
			bodyContainer.y -= 37 * ((shiftedProgress - 0.5) / 0.5)
		}
	}

	async presentRemainingSpinsCount(remainingSpinsCount) {
		if(this.remainingSpinsCount === remainingSpinsCount) {
			return
		}

		const {
			logoView,
			textField,
			textContainer,
		} = this

		this.remainingSpinsCount = remainingSpinsCount

		return this
			.timeline
			.deleteAllAnimations()
			.addAnimation({
				duration: 300,
				onProgress: progress => {
					this.setFlip(progress * 0.5)
				},
				onFinish: () => {
					logoView.visible = remainingSpinsCount === undefined
					textContainer.visible = !logoView.visible
					textContainer.visible
					&& textField.setText(remainingSpinsCount + '')
				}
			})
			.addAnimation({
				delay: 300,
				duration: 300,
				onProgress: progress => {
					this.setFlip(0.5 + progress * 0.5)
				},
			})
			.play()
	}

	setTimeScale(timeScale) {
		this.timeline.setTimeScaleFactor({value: timeScale})
	}
}