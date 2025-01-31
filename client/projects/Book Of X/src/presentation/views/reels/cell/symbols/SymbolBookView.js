import { Container, Sprite } from "pixi.js";
import { Base3DSymbolView } from "./Base3DSymbolView";
import { Timeline } from "../../../../timeline/Timeline";

export class SymbolBookView extends Base3DSymbolView {
	timeline = new Timeline

    constructor(resources) {
        super(resources)
    }

	initContentContainers() {
		super.initContentContainers(0.8)
	}

    initFaces(resources) {
		const {
			contentContainer,
			facesViews,
			distances,
			angles,
		} = this


		let sprite = new Sprite(resources.symbol_book_rib)
		sprite.anchor.set(0.5)
		angles[2] = - Math.PI / 2
		distances[2] = 78
		facesViews[2] = contentContainer.addChild(sprite)

		sprite = new Sprite(resources.symbol_book_rib_2)
		sprite.anchor.set(0.5)
		angles[3] = Math.PI / 2
		distances[3] = 78
		facesViews[3] = contentContainer.addChild(sprite)

		sprite = new Sprite(resources.symbol_book_face_2)
		sprite.anchor.set(0.5)
		angles[0] = - Math.PI
		distances[0] = 28
		facesViews[0] = contentContainer.addChild(sprite)

		sprite = new Sprite(resources.symbol_book_face)
		sprite.anchor.set(0.5)
		distances[1] = 28
		facesViews[1] = contentContainer.addChild(sprite)
	}

    initFlames() {
		super.initFlames(this.resources.symbol_book_light)
	}

	initGlowingFace() {
		super.initGlowingFace('symbol_book_face_2', 9)
	}

	reset() {
		this.timeline.wind(1)
	}

	presentTeasing() {
		// return
		this.timeline
			.deleteAllAnimations()
			.addAnimation({
				duration: 200,
				onProgress: progress => {
					this.idleFactor = 1 - progress
				}
			})
			.addAnimation({
				duration: 600,
				onProgress: progress => {
					// this.presentationSpinProgress = Math.sin(Math.PI * 6 * progress) * 0.1 * progress
					this.presentationFlipProgress = Math.sin(Math.PI * 5 * progress) * 0.125 * Math.sin(progress * Math.PI)
					this.flameIntensity = 1 - 0.25 * Math.sin(Math.PI * 4 * progress) * Math.sin(progress * Math.PI)
				}
			})
			.addAnimation({
				delay: 400,
				duration: 200,
				onProgress: progress => {
					this.idleFactor = progress
				}
			})
			.play()
	}

	presentSpecialWin() {
		return this
			.timeline
			.deleteAllAnimations()
			.addAnimation({
				duration: 200,
				onProgress: progress => {
					this.idleFactor = 1 - progress
				}
			})
			.addAnimation({
				duration: 600,
				onProgress: progress => {
					// this.presentationSpinProgress = Math.sin(Math.PI * 6 * progress) * 0.1 * progress
					this.presentationFlipProgress = Math.sin(Math.PI * 5 * progress) * 0.125 * Math.sin(progress * Math.PI)
					this.flameIntensity = 1 - 0.25 * Math.sin(Math.PI * 4 * progress) * Math.sin(progress * Math.PI)
				}
			})
			.addAnimation({
				delay: 400,
				duration: 200,
				onProgress: progress => {
					this.idleFactor = progress
				}
			})
			.play()
	}

	setTimeScale(timeScale) {
		this.timeline.setTimeScaleFactor({value: timeScale})
	}
}