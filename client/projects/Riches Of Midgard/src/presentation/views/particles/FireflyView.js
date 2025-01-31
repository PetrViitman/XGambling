import { Container, Graphics } from 'pixi.js'
import { getLightSpot } from '../GraphicalPrimitives'

const LIFE_TIME = 200

export class FireflyView extends Container {
	bodyView
	glowView
	wingsViews
	framesCount = 0
	angle
	directionMultiplier = 1
	progress = 0
	scaleProgress = 0

	constructor(color = 0xFFFF00) {
		super()
		this.glowView = this.addChild(
			getLightSpot({
				color,
				radius: 10,
			}))

		this.bodyView = this.addChild(new Container)

		this.wingsViews = [0, 0].map(_ =>
			this.bodyView
				.addChild(new Graphics)
				.beginFill(0xFFFFFF)
				.drawRoundedRect(0, -5, 8, 10)
				.endFill())

		this.wingsViews[1].scale.x = -1

	}

	reset() {
		this.framesCount = 0
		this.angle = Math.PI / 4 + (Math.PI / 2) * Math.random()
		this.bodyView.scale.y = 0
		this.alpha = 1
		this.glowView.alpha = 0
		this.directionMultiplier = 0.025 * (Math.random() > 0.5 ? 1 : -1)
	}

	update(timeScale = 1) {
		this.framesCount += timeScale
		this.angle += this.directionMultiplier * timeScale
		const speed = 1.5 * timeScale
		this.x += speed * Math.cos(this.angle)
		this.y += speed * Math.sin(this.angle) * this.scaleProgress


		this.progress = (this.progress + 0.05 * timeScale) % 1
		const wingsProgress = Math.sin(Math.PI * this.progress)
		this.wingsViews[0].skew.y = -1 + wingsProgress * 2
		this.wingsViews[1].skew.y = 1 - wingsProgress * 2

		this.wingsViews[0].rotation = 0.5 * wingsProgress
		this.wingsViews[1].rotation = -0.5 * wingsProgress

		this.glowView.scale.set(1 + 0.5 * wingsProgress)

		this.scaleProgress = (this.scaleProgress + 0.01 * timeScale) % 1
		this.bodyView.scale.y = Math.max(0.3, Math.sin(Math.PI * this.scaleProgress))
		this.bodyView.y = 5 * wingsProgress
		this.glowView.y = this.bodyView.y

		const lifeProgress = Math.min(1, Math.sin(Math.PI * this.framesCount / LIFE_TIME) * 4) 

		this.bodyView.rotation = this.angle + Math.PI / 2
		this.alpha = lifeProgress
		this.glowView.alpha = Math.min(1, this.framesCount / 10)
	}

	isReadyToBeReused() {
		return this.alpha <= 0.001
	}

	setColor(color) {

	}
}
