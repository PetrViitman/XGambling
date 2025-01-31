import { BLEND_MODES, Container, Sprite } from "pixi.js";
import { MultipliersPoolView } from "./MultipliersPoolView";
import { Timeline } from '../../timeline/Timeline'

export class MultiplierIndicatorView extends Container {
    panelContainer
    multipliersPoolView
    glowView

    constructor(assets, renderer) {
        super()

        this.initPanel(assets)
        this.initMultipliersPool(assets, renderer)

        new Timeline()
            .addAnimation({
                duration: 1000,
                onProgress: progress => this.setIdleProgress(progress)
            })
            .setLoopMode()
            .play()


        const demoTimeline = new Timeline
        let targetMultiplier = 2
        document.addEventListener('keyup', () => {
            demoTimeline
                .deleteAllAnimations()
                .addAnimation({
                    duration: 500,
                    onProgress: progress => this.presentMultiplierProgress({progress, targetMultiplier})
                })
                .play()

            targetMultiplier *= 2
        })
    }

    initPanel(assets) {
        // PANEL CONTAINER...
        let container = new Container()
        this.panelContainer = this.addChild(container)
        // ...PANEL CONTAINER

        // PANEL...
        let sprite = new Sprite(assets.multiplier_panel)
        container.addChild(sprite)
        // ...PANEL

        // GLOW...
        sprite = new Sprite(assets.multiplier_panel_glow)
        sprite.anchor.set(0.5)
        sprite.scale.set(0.75)
        sprite.blendMode = BLEND_MODES.ADD
        sprite.position.set(265, 105)
        this.glowView = container.addChild(sprite)
        // ...GLOW

    }

    initMultipliersPool(assets, renderer) {
        const view = new MultipliersPoolView(assets, renderer)
        view.position.set(275, -490)
        view.rotation = Math.PI / 2
        this.panelContainer.addChild(view)
        this.multipliersPoolView = view

        // MASK...
        const sprite = new Sprite(assets.multiplier_panel_mask)
        sprite.position.set(271, 102)
        sprite.anchor.set(0.5)
        view.mask = sprite
        this.panelContainer.addChild(sprite)
        // ...MASK
    }

    setIdleProgress(progress) {
        this.multipliersPoolView.setIdleProgress(progress)
    }

    presentMultiplierProgress({
        minimalMultiplier = 1,
        maximalMultiplier = 1024,
        progress = 0,
        targetMultiplier = 2,
    }) {
        this.glowView.alpha = Math.min(1, Math.sin(Math.PI * progress) * 2)

        this.multipliersPoolView
            .presentMultiplierProgress({
                minimalMultiplier,
                maximalMultiplier,
                targetMultiplier,
                progress
            })
    }

    presentMultiplierRegress({
        minimalMultiplier = 1,
        maximalMultiplier = 1024,
        progress = 0,
        targetMultiplier = 2,
    }) {
        this.multipliersPoolView
            .presentMultiplierRegress({
                minimalMultiplier,
                maximalMultiplier,
                targetMultiplier,
                progress
            })
    }
}