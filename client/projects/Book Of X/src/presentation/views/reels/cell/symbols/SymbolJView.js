import { Sprite } from "pixi.js";
import { Flat3DSymbolView } from "./Flat3DSymbolView";

export class SymbolJView extends Flat3DSymbolView {

	initContentContainers() {
		super.initContentContainers(0.65)
	}

    initFaces(resources) {
        const {
			contentContainer,
			facesViews,
			distances,
			angles,
		} = this

        let sprite = new Sprite(resources.symbol_J_back)
		sprite.anchor.set(0.5)
		this.patchView = contentContainer.addChild(sprite)

        sprite = new Sprite(resources.symbol_J_rib)
		sprite.anchor.set(0.5)
		this.ribView = contentContainer.addChild(sprite)

		sprite = new Sprite(resources.symbol_J)
		sprite.anchor.set(0.5)
		angles[0] = - Math.PI
		distances[0] = 16
		facesViews[0] = contentContainer.addChild(sprite)

		angles[1] = 0
		distances[1] = 16
		facesViews[1] = contentContainer.addChild(sprite)
    }

	initFlames() {
		super.initFlames(this.resources.symbol_J_light)
	}

	initGlowingFace() {
		super.initGlowingFace('symbol_J', 9)
	}
}