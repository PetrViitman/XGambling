import { AdaptiveContainer } from "../adaptiveDesign/AdaptiveContainer";
import { Timeline } from "../../timeline/Timeline";
import { HintView } from "./hints/HintView";
import { TouchScreenHintView } from "./hints/TouchScreenHintView";
import { SpineView } from "../SpineView";
import { Container } from "pixi.js";

export class BaseSplashScreen extends AdaptiveContainer {
	overlayView
	dictionary
	assets
	isMobileDevice
	camera
	timeline = new Timeline
	isVisible = false
	audio
	
	constructor({
		assets,
		dictionary,
		isMobileDevice,
		camera,
		awardView,
		audio
	}) {
		super()

		this.audio = audio
		this.awardView = awardView
		this.assets = assets
		this.dictionary = dictionary
		this.isMobileDevice = isMobileDevice
		this.camera = camera
		this.initOverlay()
		this.initBody({})
		this.visible = false
		this.initHint(assets)



	}


	initOverlay() {
		const view = new AdaptiveContainer()

		.setTargetArea({x: 0, y: 0, width: 1, height: 1})
		.setSourceArea({width: 2796, height: 2796})
		.highlight(0x000000, 0.9)
		.stretchHorizontally()
		.stretchVertically()

		this.overlayView = this.addChildAt(view,0)
	}

	initBody({
		
		width = 1290,
		height = 2796
	}) {
		const view = new AdaptiveContainer()
		.setTargetArea({x: 0, y: 0, width: 1, height: 1})	
		.setSourceArea({
				width,
				height 
			})

	this.bodyView = this.addChildAt(view,1)

	}




	setVisible(isVisible = true) {
		if(this.isVisible === isVisible) return

		return this
			.timeline
			.deleteAllAnimations()
			.addAnimation({
				duration: 300,
				target: this,
				key: 'alpha',
				initialValue: isVisible ? 0 : 1,
				finalValue: isVisible ? 1 : 0,
				onStart: () => {
					this.visible = true
				},
				onFinish: () => {
					this.isVisible = isVisible
					this.visible = isVisible
				}
			})
			.play()
	}

	initHint(assets) {
		const {isMobileDevice} = this
		const hintView = isMobileDevice
			? new TouchScreenHintView(assets)
			: new HintView(assets)

		hintView.position.set(500, 1450)
		hintView.scale.set(0.65)
		this.hintView = this.addChildAt(hintView,1)
	}

	setAdaptiveDesignOffsets({offsetTop, offsetBottom}) {
        this.offsetTop = offsetTop
        this.offsetBottom = offsetBottom + offsetTop
        this.onResize()
    }
}