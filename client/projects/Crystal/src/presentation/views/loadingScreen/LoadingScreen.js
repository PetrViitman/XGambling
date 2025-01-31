import { AdaptiveContainer } from "../adaptiveDesign/AdaptiveContainer";
import { ProgressBarView } from "./ProgressBarView";
import { Timeline } from "../../timeline/Timeline";

export class LoadingScreen extends AdaptiveContainer {
	backgroundView
	progressBarView
	overlayView

	constructor(assets, dictionary) {
		super()

		this.initBackground()
		this.initProgressBar(assets, dictionary)

		AdaptiveContainer.onResize()
	}

	initBackground() {
		const container = this
			.addChild(new AdaptiveContainer)
			.setTargetArea({x: 0, y: 0, width: 1, height: 1})
			.setSourceArea({width: 100, height: 100})
			.highlight(0x1f1f5c, 1)
			.stretchHorizontally()
			.stretchVertically()

		this.backgroundView = container
	}


	initProgressBar(assets, dictionary) {
		this.progressBarView = new ProgressBarView(assets, dictionary)
		this.addChild(this.progressBarView)
	}

	initLogo(assets) {
		this.addChild(new LogoView(assets))
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