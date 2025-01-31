import { Container, Graphics, Sprite } from "pixi.js";
import { CELL_HEIGHT, CELL_WIDTH } from "../../Constants";
import { Timeline } from "../../timeline/Timeline";
import { getRectangleSpot } from "../GraphicalPrimitives";
import { WinLineView } from "./winLine/WInLineView";

export class TensionView extends Container {
	chainsViews
	loopTimeline = new Timeline
	revealTimeline = new Timeline

	constructor(resources) {
		super()

		this.chainsViews = [-50, 50].map(offsetX => {
			const view = this.addChild(new WinLineView(resources))
			view.rotation = -Math.PI / 2
			view.x = offsetX
			view.y = -150
			view.scale.set(0.75)

			return view
		})

		this.mask = this
			.addChild(new Graphics)
			.beginFill(0xFF0000)
			.drawRect(
				-CELL_WIDTH / 2,
				-CELL_HEIGHT * 3.5,
				CELL_WIDTH,
				CELL_HEIGHT * 3)
			.endFill()

		this.glowView = this.addChild(getRectangleSpot({
			width: 100,
			height: 30,
			color: 0xFFFFFF
		}))

		this.glowView.rotation = Math.PI / 2
		this.glowView.y = -300
	}

	setProgress(progress) {
		const { chainsViews } = this
		chainsViews[0].adjust(0, progress, 1)
		chainsViews[1].adjust(0, 1 - progress, 1)

		this.glowView.scale.set(
			2 + 2 * progress,
			2 + 2 * Math.abs(Math.sin(Math.PI * 4 * progress)) * (1 - progress))
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