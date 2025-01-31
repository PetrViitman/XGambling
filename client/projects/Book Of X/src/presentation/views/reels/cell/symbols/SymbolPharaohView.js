import { Container, Sprite } from "pixi.js";
import { Flat3DSymbolView } from "./Flat3DSymbolView";
import { Base3DSymbolView } from "./Base3DSymbolView";

export class SymbolPharaohView extends Flat3DSymbolView {
    initFaces(resources) {
        const {
			contentContainer,
			facesViews,
			distances,
			angles,
		} = this


        let sprite = new Sprite(resources.symbol_pharaoh_back)
		sprite.anchor.set(0.5)
		this.patchView = contentContainer.addChild(sprite)

        sprite = new Sprite(resources.symbol_pharaoh_rib)
		sprite.anchor.set(0.5)
		this.ribView = contentContainer.addChild(sprite)


		sprite = new Sprite(resources.symbol_pharaoh)
		sprite.anchor.set(0.5)
		angles[0] = -Math.PI
		distances[0] = 25
		facesViews[0] = contentContainer.addChild(sprite)

		angles[1] = 0
		distances[1] = 25
		facesViews[1] = contentContainer.addChild(sprite)

        sprite = new Sprite(resources.symbol_pharaoh_face_2)
        sprite.anchor.set(0.5)
        angles[2] = -Math.PI
		distances[2] = 25
		facesViews[2] = contentContainer.addChild(sprite)
        /*

		sprite = new Sprite(resources.symbol_pharaoh_face_2)
		sprite.anchor.set(0.5)
		angles[0] = - Math.PI
		distances[0] = 22
		facesViews[0] = contentContainer.addChild(sprite)

        sprite = new Sprite(resources.symbol_pharaoh)
		sprite.anchor.set(0.5)
		angles[1] = 0
		distances[1] = 22
		facesViews[1] = contentContainer.addChild(sprite)
        */


        // GEM...
        const gemView = new Sprite(resources.symbol_pharaoh_gem)
        gemView.anchor.set(0.5)
        this.gemView = contentContainer.addChild(gemView)
        contentContainer.sortableChildren = true
        // ...GEM
    }

	initFlames() {
		super.initFlames(this.resources.symbol_pharaoh_light)
        this.flamesContainer.zIndex = -2
	}

    onFlipped(progress, offsetProgress) {
        super.onFlipped(progress, offsetProgress)

        const {
            contentContainer,
            gemView,
            flipProgress
        } = this

        this.patchView.scale.x = progress
		this.ribView.scale.x = 1 - this.patchView.scale.x

        const zIndex = (flipProgress > 0.25 && flipProgress < 0.75) ? 10 : -1
        

        gemView.zIndex = zIndex
        gemView.skew.x = -contentContainer.skew.x
        gemView.rotation = -contentContainer.rotation
        gemView.x = -55 * offsetProgress
        gemView.scale.set(0.85 + 0.15 * offsetProgress)
	}

	initGlowingFace() {
		super.initGlowingFace('symbol_pharaoh_face_2', 9)
	}
}