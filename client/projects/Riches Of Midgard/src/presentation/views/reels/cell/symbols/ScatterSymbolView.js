import { Container, Sprite } from "pixi.js";
import { Timeline } from "../../../../timeline/Timeline";
import { brightnessToHexColor, getRectangleSpot } from "../../../GraphicalPrimitives";
import { BaseSymbolView } from "./BaseSymbolView";

export class ScatterSymbolView extends BaseSymbolView {
	isLocked = true
	timeline = new Timeline

	generateBody(name, resources) {
		const container = new Container

		// BACKGROUND...
		let sprite = new Sprite(resources['symbol_' + name])
		sprite.anchor.set(0.5)
		container.backgroundView = sprite
		container.addChild(sprite)
		// ...BACKGROUND

		// HUMMER...
		const hummerContainer = container.addChild(new Container)
		container.hummerContainer = hummerContainer

		sprite = new Sprite(resources['symbol_scatter_hammer'])
		sprite.anchor.set(0.5)
		container.hummerView = sprite
		hummerContainer.addChild(sprite)
		
		// GLOW...
		container.glowsViews = [0, Math.PI / 2].map(angle => {
			const view = hummerContainer.addChild(getRectangleSpot({
				width: 70,
				height: 30,
				color: 0xFFFFFF
			}))

			view.rotation = angle
			view.y = -25
			view.scale.set(0.001)

			return view
		})
		// ...GLOW
		
		// ...HUMMER

		// LABEL...
		sprite = new Sprite(resources['symbol_scatter_text'])
		sprite.anchor.set(0.5)
		sprite.y = 32
		container.labelView = sprite
		container.addChild(sprite)
		// ...LABEL

		return container
	}

	setBlur(strength) {
		super.setBlur(strength)
		this.blurredBodyView.visible = this.isLocked
	}

	presentTeasing() {
		const {
			hummerView,
			hummerContainer,
			backgroundView,
			labelView,
			glowsViews
		} = this.bodyView

		return this
			.timeline
			.deleteAllAnimations()
			.addAnimation({
				duration: 500,
				onProgress: progress => {
					const subProgress = Math.sin(Math.PI * progress)
					hummerContainer.scale.set(1 + 0.25 * subProgress)
					hummerContainer.y = -50 * subProgress

					labelView.scale.set(1 + 0.25 * subProgress ** 2)

					const glowProgress = Math.abs(Math.sin(Math.PI * 3 * progress))
					const scaleProgress = glowProgress * (1 - progress)

					glowsViews[0].scale.set(scaleProgress * 2)
					glowsViews[1].scale.set(scaleProgress * 2)
				}
			})
			.play()
	}

	presentSpecialWin() {
		return this.presentTeasing()
	}

	setBrightness(brightness) {
		super.setBrightness(brightness)
		const tint = brightnessToHexColor(this.brightness)

		this.bodyView.hummerView.tint = tint
		this.bodyView.backgroundView.tint = tint
		this.bodyView.labelView.tint = tint
	}

	setTimeScale(timeScale) {
		this.timeline.setTimeScaleFactor({value: timeScale})
	}
}