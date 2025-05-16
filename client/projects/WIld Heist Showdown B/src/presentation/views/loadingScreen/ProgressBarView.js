import { Container, Graphics, Sprite } from "pixi.js";
import { AdaptiveContainer } from "../adaptiveDesign/AdaptiveContainer";
import { TextField } from "../text/TextField";
import { Timeline } from "../../timeline/Timeline";
import { colorToColor, getRectangleSpot } from "../GraphicalPrimitives";

import { TouchScreenHintView } from "../splashScreens/hints/TouchScreenHintView";
import { HintView } from "../splashScreens/hints/HintView";

export class ProgressBarView extends AdaptiveContainer {
	idleTimeline = new Timeline
	timeline = new Timeline
	textField
	isMobileDevice

	constructor({assets, dictionary, isMobileDevice}) {
		super()

		this.setSourceArea({width: 1000, height: 1000})

		this.initText(dictionary)

		this.dictionary = dictionary
		this.isMobileDevice = isMobileDevice
	}



	updateTargetArea(sidesRatio) {
		if(sidesRatio > 1)
			this.setTargetArea({x: 0.25, y: 0.25, width: 0.5, height: 0.5})
		else
			this.setTargetArea({x: 0.05, y: 0.25, width: 0.9, height: 0.5})
	}


	destroy() {
		super.destroy()
		this.hintView.destroy()
		this.timeline.destroy()
		this.idleTimeline.destroy()
	}

	initText(dictionary) {
		const maximalWidth = 500
        const maximalHeight = 50

        const textField = new TextField({maximalWidth, maximalHeight})
            .setFontName('default')
            .setFontSize(maximalHeight)
            .setFontColor(0xFFFF00)
            .setAlignCenter()
            .setAlignMiddle()
            .setText(dictionary.loading)

        textField.pivot.set(maximalWidth / 2, maximalHeight / 2)
		textField.position.set(500, 1100)
        this.textField = this.addChild(textField)
	}

	presentInteractionRequest(assets) {
		const {isMobileDevice, dictionary} = this

		const hintView = isMobileDevice
			? new TouchScreenHintView(assets)
			: new HintView(assets)

		hintView.position.set(500, 1250)
		hintView.scale.set(0.45)
		this.hintView = this.addChild(hintView)


		return this
			.timeline
			.addAnimation({
				duration: 200,
				onProgress: (progress) => {
					this.textField.alpha = 1 - Math.sin(Math.PI * progress)
				},
			})
			.addAnimation({
				duration: 100,
				onFinish: () => {
					this.textField.setText(
						isMobileDevice
							? dictionary.tap_to_continue
							: dictionary.click_to_continue
					)
				},
			})
			.play()
	}
}