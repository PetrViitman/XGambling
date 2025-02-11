import { Sprite } from "pixi.js";
import { AdaptiveContainer } from "../adaptiveDesign/AdaptiveContainer";
import { Timeline } from "../../timeline/Timeline";
import { colorToColor } from "../../Utils";

export class FooterGradientView extends AdaptiveContainer {
    sprite
    
    constructor(assets) {
        super()

        const sprite = new Sprite(assets.bottom_gradient)
        this.sprite = this.addChild(sprite)
        sprite.anchor.set(0.5, 1)
        sprite.position.set(512, 256)

        this.setSourceArea({width: 1024, height: 256})
            .setTargetArea({x: 0, y: 0, width: 1, height: 1})
            .stretchHorizontally()
            .stretchVertically()


        new Timeline()
            .addAnimation({
                duration: 5000,
                onProgress: progress => {
                    this.presentIdle(progress)
                }
            })
            .setLoopMode()
            .play()
    }


    presentIdle(progress) {
        const finalProgress = Math.sin(Math.PI * progress)
        this.alpha = 0.5 + 0.5 * finalProgress
        this.sprite.scale.y = 0.035 + 0.035 * finalProgress
        this.sprite.tint = colorToColor(
            255,
            255,
            0,
            200,
            255,
            0,
            finalProgress
        )
    }
}