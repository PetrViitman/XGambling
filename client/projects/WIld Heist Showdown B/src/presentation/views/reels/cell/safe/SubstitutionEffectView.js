import { BLEND_MODES, Container, Sprite } from "pixi.js";
import { getLightSpot, getRectangleSpot } from "../../../GraphicalPrimitives";

export class SubstitutionEffectView extends Container {
    contentContainer
    glowView
    raysViews

    constructor(assets) {
        super()
        this.initContentContainer()

        this.initRays(assets)
    }

    initContentContainer() {
        this.contentContainer = this.addChild(new Container)
        this.contentContainer.alpha = 0
        this.contentContainer.scale.set(3)
    }

    initRays(assets) {
        this.raysViews = new Sprite(assets.light_rays)
        this.raysViews.blendMode = BLEND_MODES.ADD
        this.raysViews.anchor.set(0.5)
        this.raysViews.x = 8
        this.raysViews.scale.set(1.7)
        this.contentContainer.addChild(this.raysViews)


    }

    setProgress(progress) {
        this.contentContainer.alpha = 1
        this.raysViews.rotation = Math.PI * 2 +  progress;
        
    }

    

    present(progress) {
        this.setProgress(progress)
        this.contentContainer.alpha = Math.sin(Math.PI * progress)
    }


}