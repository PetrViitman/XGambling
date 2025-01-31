import { Container, Sprite } from "pixi.js";
import { Flat3DSymbolView } from "./Flat3DSymbolView";

export class SymbolEyeView extends Flat3DSymbolView {
    initFaces(resources) {
        const {
			contentContainer,
			facesViews,
			distances,
			angles,
		} = this

        let sprite = new Sprite(resources.symbol_eye_back)
		sprite.anchor.set(0.5)
		this.patchView = contentContainer.addChild(sprite)

        sprite = new Sprite(resources.symbol_eye_rib)
		sprite.anchor.set(0.5)
		this.ribView = contentContainer.addChild(sprite)


		sprite = new Sprite(resources.symbol_eye)
		sprite.anchor.set(0.5)
		angles[0] = - Math.PI
		distances[0] = 9
		facesViews[0] = contentContainer.addChild(sprite)

		angles[1] = 0
		distances[1] = 9
		facesViews[1] = contentContainer.addChild(sprite)


        // EYE BALL...
        const eyeBallView = new Sprite(resources.symbol_eye_ball)
        eyeBallView.anchor.set(0.5)
        this.eyeBallView = contentContainer.addChild(eyeBallView)
        contentContainer.sortableChildren = true
        // ...EYE BALL
    }

	initFlames() {
		super.initFlames(this.resources.symbol_eye_light)
        this.flamesContainer.zIndex = -2
	}

    initGlowingFace() {
		super.initGlowingFace('symbol_eye', 10)
	}

    onFlipped(progress, offsetProgress) {
        super.onFlipped(progress, offsetProgress)

        const {
            contentContainer,
            eyeBallView,
            flipProgress
        } = this

        const zIndex = (flipProgress > 0.25 && flipProgress < 0.75) ? 10 : -1

        eyeBallView.zIndex = zIndex
        eyeBallView.skew.x = -contentContainer.skew.x
        eyeBallView.rotation = -contentContainer.rotation
        eyeBallView.x = -55 * offsetProgress + 10
        eyeBallView.y = -15
        eyeBallView.scale.set((1.25 + 0.15 * offsetProgress) * 0.45)
	}


    adjustBrightness() {
        super.adjustBrightness()
        this.eyeBallView.tint = this.facesViews[0].tint
    }
}