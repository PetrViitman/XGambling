import { Container, Graphics, Sprite } from "pixi.js";
import { Timeline } from "../../../timeline/Timeline";
import { brightnessToHexColor } from "../../GraphicalPrimitives";

export class GearView extends Container {
    faceView
    backView
    edges = []
    stretchView

    flip = 0.25
    spin = 0
    
    constructor(resources) {
        super()

        const container = this.addChild(new Container)

        this.backView = container.addChild(new Container)
        let sprite = new Sprite(resources.gear_back)
        sprite.anchor.set(0.5)
        this.backView.addChild(sprite)
        this.backView.sprite = sprite

        this.stretchView = container.addChild(new Sprite(resources.gear_rib))
        this.stretchView.anchor.set(0.5)

        for(let i = 0; i < 12; i++) {
            this.edges[i] = new Sprite(resources.gear_edge)
            this.edges[i].anchor.set(0.5)
            container.addChild(this.edges[i])
        }

        this.faceView = container.addChild(new Container)
        sprite = new Sprite(resources.gear)
        sprite.anchor.set(0.5)
        this.faceView.addChild(sprite)
        this.faceView.sprite = sprite

        this.adjust()

    }

    adjust() {
        const {
            faceView,
            backView,
            flip,
            spin,
            edges
        } = this

        const angle = spin * Math.PI * 2

        faceView.sprite.rotation = angle
        backView.sprite.rotation = angle
    

        const scale = flip
        backView.x = 20 * (1 - flip)
        faceView.x = -20 * (1 - flip)

        faceView.scale.x = scale
        backView.scale.x = scale

        backView.sprite.tint = 0x888888

        edges.forEach((view, i) => {
            const angleOffset = Math.PI / 6 * i

            // view.skew.x = Math.PI * -spin - angleOffset
            view.scale.x = 1 - flip
            view.scale.y = Math.max(0.2, Math.abs(Math.cos(Math.PI * 2 * spin + angleOffset)))
            view.y = -103 * Math.sin(Math.PI * 2 * spin + angleOffset)
            view.x = -100 * Math.cos(Math.PI * 2 * spin + angleOffset) * flip


            view.tint = brightnessToHexColor(
                view.x > -10
                    ? 1 - 0.5 * Math.abs(view.y) / 103
                    : 0.5
                )

        })

        return this
    }

    setSpin(spin = 0) {
        this.spin = spin
        
        return this.adjust()
    }

    setFlip(flip = 0.3) {
        this.flip = flip

        return this.adjust()
    }
}