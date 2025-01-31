import { BLEND_MODES, Container, Filter, Graphics, Sprite } from "pixi.js";
import { CELL_HEIGHT, CELL_WIDTH } from "../../Constants";
import { Timeline } from "../../timeline/Timeline";
import { getRectangleSpot } from "../GraphicalPrimitives";

const COLOR_MAP = {
	1: 0xFF0000,
	2: 0xFF9900,
	3: 0xFF00FF,
	4: 0x8833FF,
}

export class TensionView extends Container {
	loopTimeline = new Timeline
	revealTimeline = new Timeline

	constructor(index = 0) {
		super()

		this.mask = this
			.addChild(new Graphics)
			.beginFill(0x000000)
			.drawRect(
				-CELL_WIDTH,
				-CELL_HEIGHT * 4,
				CELL_WIDTH * 2,
				CELL_HEIGHT * 10)
			.endFill()

		this.glowView = this.addChild(getRectangleSpot({
			width: 100,
			height: 30,
			color: COLOR_MAP[index],
		}))

		this.glowView.rotation = Math.PI / 2
		this.glowView.pivot.x = -50 

		const filter = new Filter()
		filter.blendMode = BLEND_MODES.ADD
		this.filters = [filter]
	}

	setProgress(progress) {
		const floatingProgress = Math.abs(Math.sin(Math.PI * 4 * progress)) * (1 - progress)

		this.glowView.scale.set(
			3 + 2 * progress,
			4 + 2 * floatingProgress)
	}

	present({delay, duration}) {
		this.loopTimeline
			.deleteAllAnimations()
			.addAnimation({
				duration: 750,
				onProgress: (progress) => {
					this.setProgress(progress)
				}
			})
			.setLoopMode()
			.play()

		return this
			.revealTimeline
			.deleteAllAnimations()
			.addAnimation({
				delay,
				duration: 250,
				onProgress: (progress) => this.alpha = progress
			})
			.addAnimation({ delay, duration })
			.play()
	}

	hide() {
		this.revealTimeline
			.deleteAllAnimations()
			.addAnimation({
				duration: 500,
				onProgress: (progress) => {
					this.alpha = 1 - progress
				},
				onFinish: () => {
					this.loopTimeline.pause()
				}
			})
			.play()
	}

	setTimeScale(timeScale) {
		this.revealTimeline
			.setTimeScaleFactor({
				name: 'scale',
				value: timeScale
			})
	}
}