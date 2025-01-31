import { BLEND_MODES, Container, Sprite } from "pixi.js";
import { Timeline } from "../../timeline/Timeline";
import { getRectangleSpot } from "../GraphicalPrimitives";

const COLOR_MAP = [
	0xFF55ff, // 10
	0xAAff00, // Q
	0x00AAff, // J
	0xFF8800, // A
	0xFF5500, // K
	0x55EEFF, // scarab
	0xffd300, // eye
	0x7766FF, // pharaoh
	0xFF5500, // ankh
	0xff6f00, // book
]


export class ReelHitEffect extends Container {
	timeline = new Timeline
	glowView

	constructor(resources) {
		super()

		this.visible = false

		/*
		const sprites = [0, 0, 0].map((_, i) => {
			const sprite = new Sprite(resources.reel_hit_effect)
			
			sprite.anchor.set(0.5, 0.5)
			sprite.scale.x = i % 2 === 0 ? 1.25 : - 1.25
			return this.addChild(sprite)
		})
		*/

		const glowView = this.addChild(getRectangleSpot({
			width: 100,
			height: 30,
			color: 0xFFFFFF
		}))

		glowView.cacheAsBitmap = false
		glowView.blendMode = BLEND_MODES.ADD
		this.glowView = glowView

		this.timeline
			.addAnimation({
				duration: 500,
				onStart: () => this.visible = true,
				onProgress: progress => {
					// this.alpha =  Math.min(1, Math.sin(Math.PI * 2 * progress) * 3)

					glowView.alpha = Math.min(1, Math.sin(Math.PI * progress) * 3)
					glowView.scale.set(
						0.5 + 1.5 * Math.sin(Math.PI * progress) ** 2  * (1 - progress),
						1.5 * Math.sin(Math.PI * 4 * progress) * (1 - progress))
				},
				onFinish: () => this.visible = false
			})
	}

	presentHit(symbolId = 0) {
		this.glowView.tint = COLOR_MAP[symbolId]

		return this.timeline.wind(0).play()
	}
}