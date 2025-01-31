import { AdaptiveContainer } from "../adaptiveDesign/AdaptiveContainer";
import { ProgressBarView } from "./ProgressBarView";
import { Timeline } from "../../timeline/Timeline";

export class LoadingScreen extends AdaptiveContainer {
	backgroundView
	progressBarView
	overlayView

	constructor(resources, dictionary) {
		super()

		this.initBackground()
		this.initProgressBar(resources, dictionary)

		AdaptiveContainer.onResize()
	}

	initBackground() {
		const container = this
			.addChild(new AdaptiveContainer)
			.setTargetArea({x: 0, y: 0, width: 1, height: 1})
			.setSourceArea({width: 100, height: 100})
			.highlight(0x000000, 1)
			.stretchHorizontally()
			.stretchVertically()

		this.backgroundView = container
	}


	initProgressBar(resources, dictionary) {
		this.progressBarView = new ProgressBarView(resources, dictionary)
		this.addChild(this.progressBarView)
	}

	initLogo(resources) {
		this.addChild(new LogoView(resources))
	}
	

	setProgress(progress) {
		this.progressBarView.setProgress(progress)
	}

	async hide(progressCallback) {
		const timeline = new Timeline()
			.addAnimation({
				duration: 1000,
				onProgress: (progress) => {
					this.progressBarView.alpha = 1 - progress
					this.alpha = 1 - progress
					progressCallback(progress)
				}
			})

		await timeline.play()
		this.progressBarView.destroy()
		timeline.destroy()
	}
}