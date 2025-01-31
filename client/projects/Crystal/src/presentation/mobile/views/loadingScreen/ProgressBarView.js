import { Container, Graphics, Sprite } from "pixi.js";
import { AdaptiveContainer } from "../adaptiveDesign/AdaptiveContainer";
import { TextField } from "../text/TextField";
import { Timeline } from "../../timeline/Timeline";
import { getRectangleSpot } from "../GraphicalPrimitives";

export class ProgressBarView extends AdaptiveContainer {
	timeline = new Timeline
	progressMaskView
	barContainer
	captionView

	constructor(assets, dictionary) {
		super()

		this.setSourceArea({width: 949, height: 603})
		this.initBar(assets)
		this.initCaption(dictionary)

		this.setProgress(0)
	}

	initBar(assets) {
		const barContainer = this.addChild(new Container)

		barContainer
			.addChild(new Sprite(assets.progress_bar_frame))
			.position.set(140, 155)

		const barView = barContainer.addChild(
			new Sprite(assets.progress_bar))

		this.progressMaskView = barContainer
			.addChild(new Graphics)
			.beginFill(0xFF0000, 0.5)
			.drawRect(0, 0, 633, 400)
			.endFill()

		this.progressMaskView.x = 163

		barView.mask = this.progressMaskView
		barView.position.set(167, 182)
		barContainer.y = 200
		this.barContainer = barContainer
	}

	initCaption(dictionary) {
		const textField = new TextField({
			maximalWidth: 949,
			maximalHeight: 200
		})
			.setFontName('roboto')
			.setFontSize(60)
			.setText(dictionary.loading_bmp)
			.setAlignCenter()
			.setAlignMiddle()
			.setFontColor(0x00FFFF)

		textField.pivot.set(949 / 2, 200 / 2)
		textField.position.set(textField.pivot.x, textField.pivot.y + 185)
		this.captionView = this.addChild(textField)

		this.timeline
			.addAnimation({
				duration: 1500,
				onProgress: (progress) => {
					textField.scale.set(
						1,
						1 + 0.1  * (1 - progress) * Math.cos(Math.PI * 2 * ((progress * 5) % 1)))
					
				},
			})
			.setLoopMode()
			.play()
	}

	updateTargetArea(sidesRatio) {
		if(sidesRatio > 1)
			this.setTargetArea({x: 0.25, y: 0.25, width: 0.5, height: 0.5})
		else
			this.setTargetArea({x: 0.05, y: 0.25, width: 0.9, height: 0.5})
	}

	setProgress(progress) {
		this.progressMaskView.scale.x = progress
	}

	destroy() {
		super.destroy(true)
		this.timeline.destroy()
	}
}