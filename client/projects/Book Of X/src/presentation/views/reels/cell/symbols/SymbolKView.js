import { Sprite } from "pixi.js";
import { Flat3DSymbolView } from "./Flat3DSymbolView";

export class SymbolKView extends Flat3DSymbolView {

	initContentContainers(contentScaleFactor = 1) {
		super.initContentContainers(0.65)
	}

    initFaces(resources) {
        const {
			contentContainer,
			facesViews,
			distances,
			angles,
		} = this

        let sprite = new Sprite(resources.symbol_K_back)
		sprite.anchor.set(0.5)
		this.patchView = contentContainer.addChild(sprite)

        sprite = new Sprite(resources.symbol_K_rib)
		sprite.anchor.set(0.5)
		this.ribView = contentContainer.addChild(sprite)

		sprite = new Sprite(resources.symbol_K)
		sprite.anchor.set(0.5)
		angles[0] = - Math.PI
		distances[0] = 15.5
		facesViews[0] = contentContainer.addChild(sprite)

		angles[1] = 0
		distances[1] = 15.5
		facesViews[1] = contentContainer.addChild(sprite)
    }

	initFlames() {
		super.initFlames(this.resources.symbol_K_light)
	}

	initGlowingFace() {
		super.initGlowingFace('symbol_K', 9)
	}
}