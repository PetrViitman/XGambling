import { Container, Sprite } from "pixi.js";
import { brightenColor, colorToColor, toHexColor } from "../../Utils";
import { TextField } from "../text/TextField";

export class FolderView extends Container {
    colors
    contentContainer
    facesContainer
    facesViews = []
    basesViews = []
    glowContainer
    glowViews = []
    gradientsViews = []

    textField

    project

    constructor(
        assets,
        project = {
            name: 'Shark Wash',
            colors: [
                {red: 255, green: 255, blue: 0},
                {red: 255, green: 200, blue: 0}
            ]
        }
    ) {

        super()
        
        this.project = project
        this.colors = project.colors
        this.contentContainer = this.addChild(new Container)

        this.initGlow(assets)
        this.initFaces(assets, project.name)

        this.eventMode = 'static'
        this.on(
            'pointerdown', () => this.onClick?.({selectedOption: 'project', data: this.project})
        )
        this.cursor = 'pointer'
        
        /*
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
                duration: 1000,
                onProgress: progress => {
                    this.presentGlow(progress)
                }
            })
            .setLoopMode()
            .play()
        */

    
        this.initBanner(project.name, assets)
        this.initTextField(project.name)
    }

    initGlow(assets) {
        const container = this.contentContainer.addChild(new Container)
        for(let i = 0; i < 2; i++) {
            const sprite = new Sprite(assets.disk_glow)
            sprite.anchor.set(0.5)
            sprite.alpha = 0.5

            container.addChild(sprite)
            this.glowViews[i] = sprite
        }

        this.glowContainer = container
    }

    initFaces(assets, name) {
        const {facesViews, basesViews, gradientsViews} = this
        
        this.facesContainer = this.contentContainer.addChild(new Container)

        // BACK...
        let container = new Container
        let sprite = new Sprite(assets.disk_back)
        sprite.anchor.set(0.5)
        basesViews.push(sprite)
        container.addChild(sprite)

        /*
        sprite = new Sprite(assets.disk_gradient)
        sprite.anchor.set(0.5)
        sprite.tint = 0xFFFF00
        sprite.alpha = 0.5
        container.addChild(sprite)
        gradientsViews.push(sprite)
        */

        facesViews.push(this.facesContainer.addChild(container))
        // ...BACK
        
        // FRONT...
        container = new Container
        sprite = new Sprite(assets.disk_face)
        sprite.anchor.set(0.5)
        basesViews.push(sprite)
        container.addChild(sprite)

        /*
        sprite = new Sprite(assets.disk_gradient)
        sprite.anchor.set(0.5)
        sprite.tint = 0xFFFF00
        container.addChild(sprite)
        gradientsViews.push(sprite)
        */

        facesViews.push(this.facesContainer.addChild(container))
        // ...FRONT
    }

    async initBanner(name, assets) {
        const sprite = new Sprite(assets['preview_' + name.toLowerCase().replace(/ /g, '_')])

        this.facesViews[0].addChild(sprite)

        sprite.position.set(0, 125)
        sprite.anchor.set(0.5, 1)
        sprite.rotation = 0.2

        const scaleFactorX = 500 / sprite.width
        const scaleFactorY = 400 / sprite.height
        const scaleFactor = Math.min(scaleFactorX, scaleFactorY)
        sprite.scale.set(scaleFactor)
    }


    initTextField(projectName) {

        const {red, green, blue} = this.colors[0]

        const maximalWidth = 500
        const maximalHeight = 45
        const textField = new TextField({maximalWidth, maximalHeight})
            .setFontName('default')
            .setFontSize(maximalHeight)
            .setAlignCenter()
            .setAlignMiddle()
            .setFontColor(brightenColor(red, green, blue, 1))
            .setText(projectName.toUpperCase())

        textField.pivot.set(maximalWidth / 2, maximalHeight / 2)
        textField.position.set(10, 215)

        this.textField = this.facesViews[1].addChild(textField)
    }

    setFlip(progress) {
        const finalProgress = progress * 0.05

        const {facesViews, glowContainer, facesContainer} = this  
        const distance = 25
        const angle = finalProgress * Math.PI

        const sin = Math.sin(angle)
        const scaleFactor = 1 - Math.abs(sin)
        const brightnessFactor = 1 - Math.abs(Math.sin(Math.PI * 1 * progress))
        const rotation = 0.015 * Math.sin(Math.PI * 2 * progress)

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

    presentGlow(progress) {
        const {colors} = this

        let color = colorToColor(
            colors[0].red,
            colors[0].green,
            colors[0].blue,
            colors[1].red,
            colors[1].green,
            colors[1].blue,
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

        this.textField?.setFontColor(color)

        /*
        color = colorToColor(
            255,
            255,
            0,
            200,
            255,
            0,
            1 - Math.sin(Math.PI * progress)
        )

        this.gradientsViews.forEach(view=> {
            view.alpha =  Math.sin(Math.PI * progress)
            view.tint = color
        })
            */
    }
}