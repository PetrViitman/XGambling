import {Container, Sprite} from 'pixi.js';

export class CoinView extends Container {
    contentContainer

    framesViews

    currentFrameView
    
    constructor(assets) {
        super()

        const container = this.addChild(new Container())
        this.framesViews = new Array(10).fill(0)
            .map((_, i) => {
                const texture = assets['coin_frame_' + i]
                const sprite = new Sprite(texture)

                sprite.anchor.set(0.5)
                sprite.visible = false

                return container.addChild(sprite)
            })

        this.setFlipProgress()
        this.contentContainer = container
    }

    setFlipProgress(progress = 0) {
        if (this.currentFrameView) {
            this.currentFrameView.visible = false
        }

        const frameIndex = Math.trunc(progress * 9)

        this.currentFrameView = this.framesViews[frameIndex]
        this.currentFrameView.visible = true
    }

    setScale(scale = 1) {
        this.contentContainer.scale.set(scale)
    }

    setRotation(rotation = 0) {
        this.contentContainer.rotation = rotation
    }
}
