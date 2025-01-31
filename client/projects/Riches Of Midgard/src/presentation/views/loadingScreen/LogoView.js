import { Sprite } from "pixi.js";
import { AdaptiveContainer } from "../adaptiveDesign/AdaptiveContainer";
import { Timeline } from "../../timeline/Timeline";

export class LogoView extends AdaptiveContainer {
	sprite
	
	constructor(resources) {
		super()
		const sprite = this.addChild(new Sprite(resources.game_logo))
		sprite.anchor.set(0.5)
		sprite.position.set(263 / 2, 206)
		this.sprite = sprite

		new Timeline()
			.addAnimation({
				duration: 500,
				onProgress: (progress) => {
					const finalProgress = progress ** 2
					sprite.alpha = finalProgress
					sprite.y = 103 - 200 * (1 - finalProgress)
				}
			})
			.windToTime(1)
			.play()
	}

	updateTargetArea(sidesRatio) {
		if (sidesRatio > 1) {
			this.sprite.scale.set(1)
			this.setSourceArea({width: 263, height: 206})
				.setTargetArea({x: 0, y: 0, width: 1, height: 0.35})
		} else {
			this.sprite.scale.set(1.35)
			this.setSourceArea({width: 263, height: 800})
				.setTargetArea({x: 0.1, y: 0, width: 0.8, height: 1})
		}
	}
}