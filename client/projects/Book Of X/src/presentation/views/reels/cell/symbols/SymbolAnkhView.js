import { Container, Sprite } from "pixi.js";
import { Flat3DSymbolView } from "./Flat3DSymbolView";

export class SymbolAnkhView extends Flat3DSymbolView {
    initFaces(resources) {
        const {
			contentContainer,
			facesViews,
			distances,
			angles,
		} = this

        let sprite = new Sprite(resources.symbol_ankh_back)
		sprite.anchor.set(0.5)
		this.patchView = contentContainer.addChild(sprite)

        sprite = new Sprite(resources.symbol_ankh_rib)
		sprite.anchor.set(0.5)
		this.ribView = contentContainer.addChild(sprite)


		sprite = new Sprite(resources.symbol_ankh)
		sprite.anchor.set(0.5)
		angles[0] = - Math.PI
		distances[0] = 17
		facesViews[0] = contentContainer.addChild(sprite)

		angles[1] = 0
		distances[1] = 17
		facesViews[1] = contentContainer.addChild(sprite)
    }

	initFlames() {
		super.initFlames(this.resources.symbol_ankh_light)
	}

	initGlowingFace() {
		super.initGlowingFace('symbol_ankh', 17)
	}
}