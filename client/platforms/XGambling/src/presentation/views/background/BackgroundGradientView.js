import { Container, Graphics } from "pixi.js";
import { getGradient } from "../../Utils";
import { AdaptiveContainer } from "../adaptiveDesign/AdaptiveContainer";
import { Timeline } from "../../timeline/Timeline";

export class BackgroundGradientView extends AdaptiveContainer {
    constructor() {
        super()

        const width = 1000
        const height = 1000


        

        const container = this.addChild(new Container)

        container
            .addChild(new Graphics)
            .beginFill(0x1f002c)
            .drawRect(0, 0, width, height)
            .endFill()

        let gradient = getGradient({
            width,
            height,
            color: 0xFF0000
        })
        
        gradient.x = 500
        gradient.y = 1000
        gradient.rotation = Math.PI / 2 * 1
        gradient.alpha = 0.35
        container.addChild(gradient)



        gradient = getGradient({
            width,
            height,
            color: 0x000022
        })
        
        gradient.x = 500
        gradient.rotation = -Math.PI / 2

        container.addChild(gradient)

        this.setSourceArea({width, height})
            .setTargetArea({x: 0, y: 0, width: 1, height: 1})
            .stretchHorizontally()
            .stretchVertically()
    }

    cacheBitmaps() {
        const timeline = new Timeline()
        timeline.addAnimation({
                duration: 1
            }).play().then(() =>{
                container.cacheAsBitmap = true
                timeline.destroy()
            })
    }
}