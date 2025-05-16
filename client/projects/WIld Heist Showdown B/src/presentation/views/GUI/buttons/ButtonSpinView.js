import { Container, Graphics, Sprite } from "pixi.js";
import { ButtonView } from "./ButtonView";
import { colorToColor } from "../../GraphicalPrimitives";
import { SpineView } from "../../SpineView";
import { GUIView } from "../GUIView";

export class ButtonSpinView extends ButtonView {
    initBody(assets) {
        const view = new SpineView(assets.button)

        this.bodyContainer.addChild(view)
        this.bodyView = view

        this.bodyView.playAnimation({
            name: 'autoplay',
            isLoopMode: false
        })
    }

    setupInteractionListeners() {
        const {hitShapeView} = this
        hitShapeView.eventMode = 'static'
        hitShapeView.addEventListener('pointerdown', () => {
            GUIView.isOverlayInteraction = true

            if(!this.isResponsive) return
            this.onClick()
            this.presentClick()
        })

        hitShapeView.addEventListener('pointerup', () => { GUIView.isOverlayInteraction = false })
        hitShapeView.addEventListener('pointerleave', () => { GUIView.isOverlayInteraction = false })
        hitShapeView.addEventListener('pointercancel', () => { GUIView.isOverlayInteraction = false })
        hitShapeView.addEventListener('pointerout', () => { GUIView.isOverlayInteraction = false })
        hitShapeView.addEventListener('pointerupoutside', () => { GUIView.isOverlayInteraction = false })
    }


    initIcon(assets) {

        this.hitShapeView = new Graphics()
            .beginFill(0xFF0000, 0.001)
            .drawRect(-150, -150, 300, 300)
            .endFill()

        this.addChild(this.hitShapeView)

        this.iconView = new Container
        
        this.iconContainer.addChild(this.iconView)

        /*
        const sprite = new Sprite(assets.iconSpin)
        sprite.anchor.set(0.5)
        sprite.scale.set(0.75)
        this.iconView = sprite
        this.iconContainer.addChild(sprite)
        */
    }

    presentClick() {
        let isPressed = false
        this.timeline
        .wind(1)
            .deleteAllAnimations()
            .addAnimation({
                duration: 150,
                onProgress: progress => {
                    if (isPressed) return
                    super.presentPress(progress)
                },
                onFinish: () => {
                    isPressed = true
                }
            })
            .addAnimation({
                duration: 500,
                onProgress: progress => {
                    const subProgress = Math.sin(Math.PI * progress)
                    this.iconView.rotation = Math.PI * 2 * progress
                    this.iconView.tint = colorToColor(255, 255, 255, 255, 255, 0, subProgress)
                    this.iconContainer.scale.set(1 - 0.1 * Math.abs(subProgress))
                }
            })
            .setLoopMode()
            .play()

        this.bodyView.playAnimation({
            name: 'autoplay',
            isLoopMode: false
        })      
    }

    presentIdle() {

        /*
        this.timeline
            .wind(1)
            .deleteAllAnimations()
            .addAnimation({
                delay: 500,
                duration: 250,
                onProgress: progress => {
                    const subProgress = Math.sin(Math.PI * progress)
                    this.iconView.rotation = 0.5 * subProgress
                    this.iconView.tint = colorToColor(255, 255, 255, 255, 255, 0, subProgress)
                    this.iconContainer.scale.set(1 - 0.1 * Math.abs(subProgress))
                }
            })
            .setLoopMode()
            .play()
        */
    }
}