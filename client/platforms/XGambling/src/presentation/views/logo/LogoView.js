import { Container, Sprite } from "pixi.js";
import { Timeline } from "../../timeline/Timeline";
import { brightenColor, colorToColor } from "../../Utils";
import { AdaptiveContainer } from "../adaptiveDesign/AdaptiveContainer";

export class LogoView extends AdaptiveContainer {
    contentContainer
    facesContainer
    facesViews = []
    basesViews = []
    glowContainer
    glowViews = []
    gradientsViews = []

    constructor(assets) {
        super()

        this.contentContainer = this.addChild(new Container)
        this.contentContainer.position.set(100, 0)
        this.contentContainer.scale.set(0.4)
        this.setSourceArea({width: 200, height: 1600})
            .setTargetArea({x: 0, y: 0.1, width: 1, height: 0.8})
            .stickTop()


        this.initGlow(assets)
        this.initFaces(assets)
        
        new Timeline()
            .addAnimation({
                duration: 5000,
                onProgress: progress => {
                    this.setFlip(Math.sin(Math.PI * 2 * progress) * 0.5)
                }
            })
            .setLoopMode()
            .play()


        new Timeline()
            .addAnimation({
                duration: 5000,
                onProgress: progress => {
                    this.setColorProgress(Math.sin(Math.PI * progress))
                }
            })
            .setLoopMode()
            .play()

        new Timeline()
            .addAnimation({
                duration: 1000,
                onProgress: progress => {
                    this.presentGlow(progress)
                }
            })
            .setLoopMode()
            .play()
    }

    initGlow(assets) {
        const container = this.contentContainer.addChild(new Container)
        for(let i = 0; i < 2; i++) {
            const sprite = new Sprite(assets.logo_face_glow)
            sprite.anchor.set(0.5)
            sprite.alpha = 0.5

            container.addChild(sprite)
            this.glowViews[i] = sprite
        }

        this.glowContainer = container
    }

    initFaces(assets) {
        const {facesViews, basesViews, gradientsViews} = this
        
        this.facesContainer = this.contentContainer.addChild(new Container)

        // BACK...
        let container = new Container
        let sprite = new Sprite(assets.logo_face)
        sprite.anchor.set(0.5)
        basesViews.push(sprite)
        container.addChild(sprite)

        sprite = new Sprite(assets.logo_face_gradient)
        sprite.anchor.set(0.5)
        sprite.tint = 0xFFFF00
        sprite.alpha = 0.5
        container.addChild(sprite)
        gradientsViews.push(sprite)

        facesViews.push(this.facesContainer.addChild(container))
        // ...BACK
        
        // FRONT...
        container = new Container
        sprite = new Sprite(assets.logo_face)
        sprite.anchor.set(0.5)
        basesViews.push(sprite)
        container.addChild(sprite)

        sprite = new Sprite(assets.logo_face_gradient)
        sprite.anchor.set(0.5)
        sprite.tint = 0xFFFF00
        container.addChild(sprite)
        gradientsViews.push(sprite)

        facesViews.push(this.facesContainer.addChild(container))
        // ...FRONT
    } 

    setFlip(progress) {
        const finalProgress = progress * 0.2

        const {facesViews, glowContainer, facesContainer} = this  
        const distance = 25
        const angle = finalProgress * Math.PI

        const sin = Math.sin(angle)
        const scaleFactor = 1 - Math.abs(sin)
        const brightnessFactor = 1 - Math.abs(Math.sin(Math.PI * 1 * progress))
        const rotation = 0.05 * Math.sin(Math.PI * 2 * progress)

        facesViews[0].x = -distance * sin
        facesViews[0].scale.x = scaleFactor
        facesViews[0].darkness = 1 - brightnessFactor
        facesViews[1].x = distance * sin
        facesViews[1].scale.x = scaleFactor
        facesViews[1].darkness = brightnessFactor

        facesContainer.rotation = rotation

        glowContainer.x = facesViews[0].x
        glowContainer.rotation = rotation
        glowContainer.scale.x = Math.min(1, facesViews[0].scale.x * 1.25) 
    
    }


    setColorProgress(progress) {
        const {facesViews, basesViews} = this
        const darknessMultiplier = 0.15
        let channel = 255 * (1 - facesViews[0].darkness * darknessMultiplier)
        let channel2 = 200 * (1 - facesViews[1].darkness * darknessMultiplier)

        basesViews[0].tint = colorToColor(
            channel,
            channel,
            0,
            channel2,
            channel,
            0,
            1 - progress
        )

        
        basesViews[1].tint = colorToColor(
            channel,
            channel,
            0,
            channel2,
            channel,
            0,
            progress
        )
    }

    presentGlow(progress) {
        let color = colorToColor(
            255,
            255,
            0,
            200,
            255,
            0,
            Math.sin(Math.PI * progress)
        )

        this.glowViews.forEach((view, i) => {
            const shiftedProgress = (progress + (0.25 * i)) % 1
            const finalProgress = Math.sin(Math.PI *  shiftedProgress)
            // view.rotation = Math.sin(Math.PI * 2 *  shiftedProgress) * 0.1
            view.y = Math.cos(Math.PI * 2 *  shiftedProgress) * 25
            view.scale.set(2 +  finalProgress * 0.15)

            view.tint = color
        })


        color = colorToColor(
            255,
            255,
            0,
            200,
            255,
            0,
            1 - Math.sin(Math.PI * progress)
        )

        this.gradientsViews.forEach((view, i) => {
            view.tint = color
        })
    }

    /*
    updateTargetArea(sidesRatio) {
        const {contentContainer} = this
        if (sidesRatio > 1.3) {
            contentContainer.scale.set(0.5)
        } else if (sidesRatio > 1) {
            contentContainer.scale.set(0.4)
        } else {
            contentContainer.scale.set(0.35)
        }
    }
    */
}