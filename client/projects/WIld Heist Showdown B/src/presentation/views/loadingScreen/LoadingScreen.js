import { AdaptiveContainer } from "../adaptiveDesign/AdaptiveContainer";
import { ProgressBarView } from "./ProgressBarView";
import { Timeline } from "../../timeline/Timeline";
import { Sprite } from "pixi.js";

export class LoadingScreen extends AdaptiveContainer {
	backgroundView
	progressBarView
	overlayView
	isMobileDevice

	constructor({
		assets,
		dictionary,
		isMobileDevice
	}) {
		super()

		this.isMobileDevice = isMobileDevice
		this.initBackground()
		this.initStartScreen(assets)
		this.initProgressBar({assets, dictionary, isMobileDevice})
	}

	initBackground() {
		const container = this
			.addChild(new AdaptiveContainer)
			.setTargetArea({x: 0, y: 0, width: 1, height: 1})
			.setSourceArea({width: 2796, height: 2796})
			.highlight(0x000000, 1)
			.stretchHorizontally()
			.stretchVertically()

		this.backgroundView = container
		
		
	}

	initStartScreen(assets){
		
		const loaderContainer = this
		.addChild(new AdaptiveContainer)
		.setTargetArea({x: 0, y: 0, width: 1, height: 1})
		.setSourceArea({width: 1290, height: 2796})
		this.loaderContainer = loaderContainer
		const sprite = this.addChild(new Sprite(assets.preloading_screen))
		sprite.scale.set(2)
		this.loaderContainer.addChild(sprite)
	}

	initProgressBar({assets, dictionary, isMobileDevice}) {
		this.progressBarView = new ProgressBarView({assets, dictionary, isMobileDevice})
		this.addChild(this.progressBarView)
	}

	setProgress(progress) {
	}

	async hide(progressCallback) {
		const timeline = new Timeline()
			.addAnimation({
				duration: 1000,
				onProgress: (progress) => {
					this.progressBarView.alpha = 1 - Math.min(progress * 5, 1)
					this.alpha = 1 - progress
					progressCallback?.(progress)
				}
			})

		await timeline.play()
		this.progressBarView.destroy()
		timeline.destroy()
	}

	async presentInteractionRequest(assets) {
		await this.progressBarView.presentInteractionRequest(assets)

		return new Promise(resolve => {
			this.eventMode = 'static'
			this.addEventListener('pointerdown', resolve)
		})
	}



}