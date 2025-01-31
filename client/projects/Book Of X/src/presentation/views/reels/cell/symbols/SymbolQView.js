import { Sprite } from "pixi.js";
import { Flat3DSymbolView } from "./Flat3DSymbolView";

export class SymbolQView extends Flat3DSymbolView {

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

        let sprite = new Sprite(resources.symbol_Q_back)
		sprite.anchor.set(0.5)
		this.patchView = contentContainer.addChild(sprite)

        sprite = new Sprite(resources.symbol_Q_rib)
		sprite.anchor.set(0.5)
		this.ribView = contentContainer.addChild(sprite)

		sprite = new Sprite(resources.symbol_Q)
		sprite.anchor.set(0.5)
		angles[0] = - Math.PI
		distances[0] = 16
		facesViews[0] = contentContainer.addChild(sprite)

		angles[1] = 0
		distances[1] = 16
		facesViews[1] = contentContainer.addChild(sprite)
    }

	initFlames() {
		super.initFlames(this.resources.symbol_Q_light)
	}

	initGlowingFace() {
		super.initGlowingFace('symbol_Q', 9)
	}
}