import { Sprite } from "pixi.js";
import { Flat3DSymbolView } from "./Flat3DSymbolView";

export class SymbolHeartView extends Flat3DSymbolView {
    initFaces(resources) {
        const {
			contentContainer,
			facesViews,
			distances,
			angles,
		} = this

        let sprite = new Sprite(resources.symbol_heart_back)
		sprite.anchor.set(0.5)
		this.patchView = contentContainer.addChild(sprite)

        sprite = new Sprite(resources.symbol_heart_rib)
		sprite.anchor.set(0.5)
		this.ribView = contentContainer.addChild(sprite)

		sprite = new Sprite(resources.symbol_heart)
		sprite.anchor.set(0.5)
		angles[0] = - Math.PI
		distances[0] = 9
		facesViews[0] = contentContainer.addChild(sprite)

		angles[1] = 0
		distances[1] = 9
		facesViews[1] = contentContainer.addChild(sprite)
    }

	initFlames() {
		super.initFlames(this.resources.symbol_heart_light)
	}

	initGlowingFace() {
		super.initGlowingFace('symbol_heart', 9)
	}
}