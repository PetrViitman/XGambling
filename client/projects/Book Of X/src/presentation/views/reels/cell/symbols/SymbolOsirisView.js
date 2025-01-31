import { Container, Sprite } from "pixi.js";
import { Flat3DSymbolView } from "./Flat3DSymbolView";

export class SymbolOsirisView extends Flat3DSymbolView {
    initFaces(resources) {
        const {
			contentContainer,
			facesViews,
			distances,
			angles,
		} = this

        let sprite = new Sprite(resources.symbol_osiris_back)
		sprite.anchor.set(0.5)
		this.patchView = contentContainer.addChild(sprite)

		this.ribView = contentContainer.addChild(new Container)

		sprite = new Sprite(resources.symbol_osiris)
		sprite.anchor.set(0.5)
		angles[0] = - Math.PI
		distances[0] = 16
		facesViews[0] = contentContainer.addChild(sprite)

		angles[1] = 0
		distances[1] = 16
		facesViews[1] = contentContainer.addChild(sprite)
    }

	initFlames() {
		super.initFlames(this.resources.symbol_osiris_light, 1.5)
	}

	initGlowingFace() {
		super.initGlowingFace('symbol_A', 9)
	}
}