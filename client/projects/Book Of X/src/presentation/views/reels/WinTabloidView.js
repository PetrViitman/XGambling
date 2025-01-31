import { Container } from "pixi.js"
import { TextField } from '../text/TextField'
import { Timeline } from '../../timeline/Timeline'
import { formatMoney } from '../../Utils'
import { getRectangleSpot } from "../GraphicalPrimitives"

const SHADOW_COLOR_MAP = {
	0: 0x0055FF,
	// undefined: 0x006677,
	undefined: 0xFF9900,
}

const TEXT_COLOR_MAP = {
	0: 0x0055FF,
	undefined: 0xFFFFFF
}

export class WinTabloidView extends Container{
	shadowView
	textFieldContainer
	textField
	timeline = new Timeline
	camera
	
	constructor({resources, camera}) {
		super()

		this.camera = camera
		this.initShadow()
		this.initTextField(resources)

		this.timeline.addAnimation({
			duration: 1000,
			onProgress: progress => {
				this.presentPayout(123, progress) 
			}
		})

		this.scale.set(0.75)
	}

	initShadow() {
		this.shadowView = this.addChild(getRectangleSpot({
			width: 100,
			height: 30,
			color: 0xFFFFFF
		}))

		this.shadowView.cacheAsBitmap = false
		this.shadowView.alpha = 0
	}

	initTextField(resources) {
		this.textFieldContainer = this.addChild(new Container)
		this.textFieldContainer.alpha = 0
		this.textField = this
			.textFieldContainer
			.addChild(new TextField({
				maximalWidth: 800,
				maximalHeight: 200
			}))

		this.textField.setFontName(
			'0123456789.,',
			[
				resources.digit_0,
				resources.digit_1,
				resources.digit_2,
				resources.digit_3,
				resources.digit_4,
				resources.digit_5,
				resources.digit_6,
				resources.digit_7,
				resources.digit_8,
				resources.digit_9,
				resources.period,
				resources.comma,
			])
		this.textField
			.setText('')
			.setFontSize(200)
			.setMaximalWidth(800)
			.setMaximalHeight(200)
			.setAlignCenter()
			.setAlignMiddle()
			//.setFontColor(0x9966FF)
			//.setFontColor(0xFF9900)
			.setLetterSpacing(0)
			.pivot.set(400, 125)
			
	}


	/*
	presentPayout({
		payout,
		multiplier = 1
	}) {
		const { textFieldContainer, textField } = this

		textField.setText(formatMoney(payout / multiplier))
		this.shadowView.alpha = 0

		return this
			.timeline
			.deleteAllAnimations()
			.addAnimation({
				delay: 500,
				duration: 250,
				onProgress: (progress) => {
					textFieldContainer.alpha = progress
					this.shadowView.alpha = progress
				},
			})
			.addAnimation({
				delay: 500,
				duration: 1500,
				onProgress: (progress) => {
					const scale = 1 + 0.1 * progress

					textFieldContainer.scale.set(
						scale,
						scale + 0.1  * (1 - progress) * Math.cos(Math.PI * 2 * ((progress * 5) % 1)))
				   
				},
			})
			.addAnimation({
				delay: 2000,
				duration: 250,
				onProgress: (progress) => {
					const reversedProgress = 1 - progress
					textFieldContainer.alpha = reversedProgress
					this.shadowView.alpha = reversedProgress
				},
			})
			.addAnimation({
				delay: 1500,
				duration: 500,
				onDelayFinish: () => {
					textField.setText(payout.toFixed(2))
				},
				onProgress: (progress) => {
					if(multiplier <= 1) return

					this.camera
						.focus({view: textField})
						.setZoom(1.25 - 0.25 * progress ** 2)

					textField.scale.set(1 + Math.abs(Math.cos(Math.PI * 2 * progress) * 0.25 * (1 - progress)))
				},
			})
			.addAnimation({
				duration: 2250,
				onProgress: (progress) => {
					const floatingProgress = Math.abs(Math.cos(Math.PI  * 2* ((progress * 2) % 1))) * (1 - progress)
					this.shadowView.scale.set(
						1.5 + 2 * floatingProgress,
						2 + 0.5 * floatingProgress
					)
				}
			})
			.play()
	}
*/
	reset() {
		this.timeline.wind(1).pause()
		this.textField.setText('')
	}

	setTimeScale(scale) {
		this.timeline.setTimeScaleFactor({name: 'scale', value: scale})
	}
	

	presentPayout(payout = 123, progress = 0) {
		this.textField.setFontColor(TEXT_COLOR_MAP[undefined])
		this.shadowView.tint = SHADOW_COLOR_MAP[undefined]
		let subProgress = 1
		
		if(progress < 0.25) {
			subProgress = progress / 0.25
		} else if(progress >= 0.75) {
			subProgress = 1 - (progress - 0.75) / 0.25
		}

		this.textField.setText(formatMoney(payout * Math.min(1, progress * 4)))
		this.textFieldContainer.alpha = subProgress

		const scale = 0.25 * subProgress + 0.25 * Math.abs(Math.sin(Math.PI * 1 * progress))

		this.textFieldContainer.scale.set(
			0.75 + scale,
			0.5 + scale * 2
			)

		this.shadowView.alpha = Math.min(1, Math.sin(Math.PI * progress) * 3) * 0.5
		this.shadowView.scale.set(3 + 1 * progress)
	}
}