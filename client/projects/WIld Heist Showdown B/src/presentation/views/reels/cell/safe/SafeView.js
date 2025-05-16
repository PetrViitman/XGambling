import { Container, Graphics, Sprite } from "pixi.js";
import { brightnessToHexColor } from "../../../GraphicalPrimitives";
import { Timeline } from "../../../../timeline/Timeline";
import { SubstitutionEffectView } from "./SubstitutionEffectView";
import { CELL_HEIGHT, CELL_WIDTH, WILD_SYMBOL_ID } from "../../../../Constants";

export class SafeView extends Container {
    idleFactor = 1
    doorFlipProgress = 0

    contentContainer
    doorView
    timeline = new Timeline
    cellView
    substitutionEffectView
    isLowVfxLevel


    constructor(assets, vfxLevel) {
        super()

        this.isLowVfxLevel = vfxLevel < 0.15

        this.initGoldenFrame(assets)
        this.initSubstitutionEffect(assets, vfxLevel)
        
        this.initContainers()
        this.initTimeline()
    }

    initContainers() {
        const container = this.addChild(new Container)
        container.position.set(128)
        this.contentContainer = container

    }

    initSubstitutionEffect(assets, vfxLevel) {
        if(vfxLevel < 0.15) return

        this.substitutionEffectView = this.addChild(new SubstitutionEffectView(assets))
        this.substitutionEffectView.position.set(CELL_WIDTH / 2, CELL_HEIGHT / 2)
        this.substitutionEffectView.scale.set(1.25)

    }

    initGoldenFrame(assets) {
        const sprite = new Sprite(assets.golden_frame)
        sprite.anchor.set(0.5)
        sprite.position.set(128)
        sprite.scale.set(0.95)
        

        this.goldenFrameView = this
            .addChild(sprite)
    }


    initTimeline() {
        const { contentContainer } = this
        this.timeline

        
            .addAnimation({
                duration: 250,
                onProgress: progress => {
                    const symbolView = this.cellView.getSymbolView()
                  
                    symbolView.scale.set(1 + Math.sin(Math.PI * progress) * 0.4 - 0.45 * progress)
                },
                onFinish: () => {
                    this.cellView.presentSymbol(WILD_SYMBOL_ID)
                    const symbolView = this.cellView.getSymbolView()
                    symbolView.presentWildAnimation("in")
                    this.update()
                }
            })

            .addAnimation({
                delay: 200,
                duration: 50,
                onDelayFinish: () => {
                    this.cellView.getSymbolView().scale.set(1)
                    this.cellView.presentSymbol(-WILD_SYMBOL_ID)
                    //this.cellView.getSymbolView().scale.set(0.5)
                },
                onProgress: progress => {
                    this.update()
                }
            })


            .addAnimation({
                delay: 100,
                duration: 350,
                onProgress: progress => {
                    this.addChildAt(this.substitutionEffectView, 2)
                    this.substitutionEffectView?.present(progress)

                 
                }
            })


            .addAnimation({
                delay: 150,
                duration: 150,
                onProgress: progress => {
                                 
                    this.goldenFrameView.alpha = 1 -progress
                },

            }
        )
    }





    setVisible(isVisible = true) {
        this.goldenFrameView.visible = isVisible
    }


    update(progress) {

        const idleProgress = Math.sin(Math.PI * progress) * 0.5
        
        
    }

    setBrightness(brightness) {
        
        this.goldenFrameView.tint = brightnessToHexColor(Math.max(0.25, brightness))
    }

    presentSubstitution(progress) {
        this.timeline.wind(progress)
    }

    attach(cellView) {
        this.cellView = cellView
        this.contentContainer
            .addChild(cellView.contentContainer)
    }

    reset() {
        this.goldenFrameView.alpha = 1
    }
}