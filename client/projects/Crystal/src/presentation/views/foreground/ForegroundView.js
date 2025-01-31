import { Sprite } from "pixi.js";
import { AdaptiveContainer } from "../adaptiveDesign/AdaptiveContainer";

export class ForegroundView extends AdaptiveContainer {
    leftBoxesView
    rightBoxesView
    logoView

    constructor(assets) {
        super()

        this.initBoxes(assets)
        this.initLogo(assets)
    }

    initBoxes(assets) {
        const leftBoxesView = this.addChild(new AdaptiveContainer)
        let sprite = leftBoxesView.addChild(new Sprite(assets.boxes))
        sprite.anchor.set(0, 1)
        sprite.position.set(0, 400)
        leftBoxesView.sprite = sprite

        this.leftBoxesView = leftBoxesView

        const rightBoxesView = this.addChild(new AdaptiveContainer)
        sprite = rightBoxesView.addChild(new Sprite(assets.boxes))
        sprite.anchor.set(0, 1)
        sprite.scale.x = -1
        sprite.position.set(1000, 400)
        rightBoxesView.sprite = sprite
        
        this.rightBoxesView = rightBoxesView
    }

    initLogo(assets) {
        const logoView = this.addChild(new AdaptiveContainer)
        logoView.sprite = logoView.addChild(new Sprite(assets.logo))
        logoView.sprite.anchor.set(0.5)

        this.logoView = logoView

    }

    updateTargetArea(sidesRatio) {
        const { leftBoxesView, rightBoxesView, logoView } = this

        if (sidesRatio > 1.15) {
            logoView
                .setSourceArea({width: 2800, height: 900})
                .setTargetArea({x: 0, y: 0, width: 1, height: 1})
                .stickTop()
                .stickRight()

            logoView.sprite.position.set(2550, 150)

            leftBoxesView
                .setSourceArea({width: 3500, height: 700})
                .setTargetArea({x: 0, y: 0, width: 1, height: 1})
                .stickLeft()
                .stickBottom()

            leftBoxesView.sprite.position.set(0, 700)


            rightBoxesView
                .setSourceArea({width: 3500, height: 700})
                .setTargetArea({x: 0, y: 0, width: 1, height: 1})
                .stickRight()
                .stickBottom()

            rightBoxesView.sprite.position.set(3500, 700)
        } else if (sidesRatio > 0.8) {
            logoView
                .setSourceArea({width: 2800, height: 900})
                .setTargetArea({x: 0, y: 0, width: 1, height: 1})
                .stickTop()
                .stickRight()

            logoView.sprite.position.set(2550, 150)
            
            leftBoxesView
                .setSourceArea({width: 2000, height: 700})
                .setTargetArea({x: 0, y: 0, width: 1, height: 1})
                .stickLeft()
                .stickBottom()

            leftBoxesView.sprite.position.set(0, 700)


            rightBoxesView
                .setSourceArea({width: 2000, height: 700})
                .setTargetArea({x: 0, y: 0, width: 1, height: 1})
                .stickRight()
                .stickBottom()

            rightBoxesView.sprite.position.set(2000, 700)
        } else if (sidesRatio > 0.6) {
            logoView
                .setSourceArea({width: 433, height: 130})
                .setTargetArea({x: 0, y: 0, width: 1, height: 0.125})
                .stickBottom()
                .stickCenter()

            logoView.sprite.position.set(216, 75)


            leftBoxesView
                .setSourceArea({width: 1000, height: 1500})
                .setTargetArea({x: 0, y: 0, width: 1, height: 1})
                .stickLeft()
                .stickBottom()

            leftBoxesView.sprite.position.set(0, 1500)


            rightBoxesView
                .setSourceArea({width: 600, height: 1500})
                .setTargetArea({x: 0, y: 0, width: 1, height: 1})
                .stickRight()
                .stickBottom()

            rightBoxesView.sprite.position.set(600, 1500)
        } else {
            logoView
                .setSourceArea({width: 433, height: 130})
                .setTargetArea({x: 0, y: 0, width: 1, height: 0.2})
                .stickBottom()
                .stickCenter()

            logoView.sprite.position.set(216, 75)

            leftBoxesView
                .setSourceArea({width: 1000, height: 1500})
                .setTargetArea({x: 0, y: 0, width: 1, height: 0.9})
                .stickLeft()
                .stickBottom()

            leftBoxesView.sprite.position.set(0, 1500)


            rightBoxesView
                .setSourceArea({width: 600, height: 1500})
                .setTargetArea({x: 0, y: 0, width: 1, height: 0.9})
                .stickRight()
                .stickBottom()

            rightBoxesView.sprite.position.set(600, 1500)
        }
    }
}