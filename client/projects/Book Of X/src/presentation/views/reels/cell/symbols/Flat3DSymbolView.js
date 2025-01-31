import { BLEND_MODES, Container, Sprite } from "pixi.js";
import { Base3DSymbolView } from "./Base3DSymbolView";
import { brightnessToHexColor } from "../../../GraphicalPrimitives";

export class Flat3DSymbolView extends Base3DSymbolView {

    constructor(resources) {
        super(resources)
		this.initGlowingFace()
    }

    initFaces(resources) {
		const {
			contentContainer,
			facesViews,
			distances,
			angles,
		} = this

        let sprite = new Sprite(resources.symbol_10_back)
		sprite.anchor.set(0.5)
		this.patchView = contentContainer.addChild(sprite)

        sprite = new Sprite(resources.symbol_10_rib)
		sprite.anchor.set(0.5)
		this.ribView = contentContainer.addChild(sprite)


		sprite = new Sprite(resources.symbol_10)
		sprite.anchor.set(0.5)
		angles[0] = - Math.PI
		distances[0] = 16
		facesViews[0] = contentContainer.addChild(sprite)

		angles[1] = 0
		distances[1] = 16
		facesViews[1] = contentContainer.addChild(sprite)
	}

    onFlipped(progress, offsetProgress) {
        this.facesViews[0].visible = true
        this.patchView.scale.x = this.facesViews[0].scale.x
		this.patchView.x = -this.facesViews[0].x
		this.ribView.scale.x = 1 - this.patchView.scale.x
	}

    adjustBrightness() {
		super.adjustBrightness()
        const brightness = Math.max(0.5, 1 - (this.facesViews[0].flipProgress ?? 0)) * this.brightness

        this.patchView.tint = brightnessToHexColor(brightness)
        this.ribView.tint = this.patchView.tint
	}
}