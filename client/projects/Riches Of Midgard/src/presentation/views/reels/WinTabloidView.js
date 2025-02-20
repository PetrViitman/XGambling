import { Container } from "pixi.js"
import { TextField } from '../text/TextField'
import { Timeline } from '../../timeline/Timeline'
import { formatMoney } from '../../Utils'
import { getRectangleSpot } from "../GraphicalPrimitives"

export class WinTabloidView extends Container{
	textFieldContainer
	textField
	timeline = new Timeline
	camera
	
	constructor({resources, camera}) {
		super()

		this.camera = camera
		this.initGlow()
		this.initTextField(resources)
		this.scale.set(0.75)
	}

	initGlow() {
		this.glowView = this.addChild(getRectangleSpot({
			width: 100,
			height: 30,
			color: 0xFFFFFF
		}))
		this.glowView.alpha = 0
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

		this.textField.setFontName('default')
		this.textField
			.setText('')
			.setFontSize(200)
			.setMaximalWidth(800)
			.setMaximalHeight(200)
			.setAlignCenter()
			.setAlignMiddle()
			.setFontColor(0x99EEFF)
			.setFontColor(0xFFFFFF)
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
		this.glowView.alpha = 0

		return this
			.timeline
			.deleteAllAnimations()
			.addAnimation({
				delay: 500,
				duration: 250,
				onProgress: (progress) => {
					textFieldContainer.alpha = progress
					this.glowView.alpha = progress
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
					this.glowView.alpha = reversedProgress
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
					this.glowView.scale.set(
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
		let subProgress = 1
		
		if(progress < 0.25) {
			subProgress = progress / 0.25
		} else if(progress >= 0.75) {
			subProgress = 1 - (progress - 0.75) / 0.25
		}

		this.textField.setText(formatMoney(payout * Math.min(1, progress * 4)))
		this.textFieldContainer.alpha = subProgress
		this.textFieldContainer.scale.set(
			0.75 + 0.25 * subProgress + 0.25 * Math.abs(Math.sin(Math.PI * 4 * progress)) * (1 - progress)
			)

		this.glowView.alpha = Math.min(1, Math.sin(Math.PI * progress) * 3)
		this.glowView.scale.set(
			2 + 2 * progress,
			2 + 2 * Math.abs(Math.sin(Math.PI * 4 * progress)) * (1 - progress))
	}
}