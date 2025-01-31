import { Container, Sprite } from "pixi.js";

export class InfoBarView extends Container {
    skinsViews = []
    
    constructor(assets) {
        super()

        this.initSkins(assets)
    }

    initSkins(assets) {
        for(let i = 0; i < 3; i++ ) {
            const view = new Sprite(assets['info_bar_skin_'+ i])
            view.anchor.set(0.5)
            this.skinsViews[i] = this.addChild(view)
        }
    }
}