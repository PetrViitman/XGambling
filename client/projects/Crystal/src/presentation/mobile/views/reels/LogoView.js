import { Container, Sprite } from "pixi.js";

export class LogoView extends Container {
    constructor(assets) {
        super()

        const bodyView = this.addChild(new Sprite(assets.static_logo))
        bodyView.anchor.set(0.5)
        
        const chainsViews = [
            {
                x: -235,
                scale: -1,
                rotation: 0.7
            },
            {
                x: 235,
                scale: 1,
                rotation: -0.7
            }
        ].map(({scale, x, rotation}) => {
            const view = new Sprite(assets.chain)
            view.anchor.set(0.1, 0.5)
            view.rotation = rotation
            view.x = x
            view.y = -80
            view.scale.set(scale * 0.5, 0.5)

            return this.addChild(view)
        })
    }
}