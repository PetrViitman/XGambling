import { BLEND_MODES, Container, Graphics, Sprite } from "pixi.js";
import { TextField } from "../text/TextField";

export class MultipliersPoolView extends Container {
    textFieldsContainers = []
    textFields = []
    highMultiplierTextField
    flashView

    constructor(assets, renderer) {
        super()

        this.initFlash(assets)
        this.initMultipliers(assets, renderer)
    }

    initFlash(assets) {
        const sprite = new Sprite(assets.flash)
        sprite.anchor.set(0.5)
        this.flashView = this.addChild(sprite)
        sprite.blendMode = BLEND_MODES.ADD
    }

    initMultipliers(assets, renderer) {
        let maximalWidth = 80
        let maximalHeight = 60

        for(let i = 0; i < 7; i++) {
            const container = this.addChild(new Container)
            const view = new TextField({
                    maximalWidth,
                    maximalHeight
                })
                .setFontName(
                    'x0123456789.,',
                    [
                        assets.payout_x,
                        assets.payout_0,
                        assets.payout_1,
                        assets.payout_2,
                        assets.payout_3,
                        assets.payout_4,
                        assets.payout_5,
                        assets.payout_6,
                        assets.payout_7,
                        assets.payout_8,
                        assets.payout_9,
                        assets.payout_period,
                        renderer.generateTexture(
                            new Graphics()
                                .beginFill(0x000000, 0.001)
                                .drawRect(0, 0, 50, 181)
                                .endFill(),
                        ),
                    ]
                )
                .setFontSize(maximalHeight)
                .setAlignCenter()
                .setAlignMiddle()
                .setLetterSpacing(-5)

            view.pivot.set(
                maximalWidth / 2,
                maximalHeight / 2
            )

            container.addChild(view)
            this.textFields.push(view)
            this.textFieldsContainers.push(container)
        }


        maximalWidth = 90
        maximalHeight = 60

        this.highMultiplierTextField = new TextField({
                maximalWidth,
                maximalHeight
            })
            .setFontName(
                'x0124',
                [
                    assets.high_multiplier_x,
                    assets.high_multiplier_0,
                    assets.high_multiplier_1,
                    assets.high_multiplier_2,
                    assets.high_multiplier_4,
                ]
            )
            .setFontSize(maximalHeight)
            .setAlignCenter()
            .setAlignMiddle()
            .setLetterSpacing(-10)

        this.highMultiplierTextField
            .pivot
            .set(
                maximalWidth / 2,
                maximalHeight / 2
            )

        this.highMultiplierTextField.scale.set(1.25)


        this.textFieldsContainers[3].addChildAt(this.flashView, 0)
    }

    presentMultiplierShift({
        minimalMultiplier = 1,
        maximalMultiplier = 1024,
        targetMultiplier = 2,
        progress = 0
    }) {
        const finalProgress = progress ** 2

        const {
            textFieldsContainers,
            textFields,
            highMultiplierTextField,
            flashView
        } = this
        
        const maximalMultiplierFinalValue = 'x' + maximalMultiplier
        const distance = 600
        const angleShiftPerItem = 0.16
        const indexOffset = 3
        const targetItemIndex = indexOffset + 1

        if (finalProgress < 0.5) {
            textFieldsContainers[indexOffset].addChildAt(flashView, 0)
        } else {
            textFieldsContainers[targetItemIndex].addChildAt(flashView, 0)
        }

        // MULTIPLIERS TEXTS SETUP...
        let multiplierValue = targetMultiplier

        for(let i = indexOffset; i >= 0; i--) {
            multiplierValue /= 2
            
            if (multiplierValue < minimalMultiplier)
                multiplierValue = maximalMultiplier

            textFields[i].setText('x' + multiplierValue)
        }

        multiplierValue = targetMultiplier
        for(let i = indexOffset + 1; i < textFields.length; i++) {
            textFields[i].setText('x' + multiplierValue)
            multiplierValue *= 2

            if (multiplierValue > maximalMultiplier)
                multiplierValue = minimalMultiplier
        }
        // ...MULTIPLIERS TEXTS SETUP

        // TRANSFORMATIONS...
        highMultiplierTextField.visible = false;
        textFieldsContainers.forEach((container, i) => {
            container.alpha = 0.5
            container.scale.set(0.9)

            if (i === indexOffset) {
                container.alpha = 1 - 0.5 * finalProgress
                container.scale.set(1.1 - 0.2 * finalProgress)
            } else if (i === targetItemIndex) {
                container.alpha = 0.5 + finalProgress
                container.scale.set(0.9 + 0.2 * finalProgress)
            }

            const angle = -(i - indexOffset - finalProgress) * angleShiftPerItem
            container.rotation = angle - Math.PI / 2

            container.position.set(
                Math.cos(angle) * distance, 
                Math.sin(angle) * distance, 
            )

            if (textFields[i].text === maximalMultiplierFinalValue) {
                textFields[i].visible = false
                container.addChild(highMultiplierTextField)
                highMultiplierTextField.visible = true
                highMultiplierTextField.setText('x' + maximalMultiplier)

            } else {
                textFields[i].visible = true
            }
        })
        // ...TRANSFORMATIONS
    }

    presentMultiplierProgress({
        minimalMultiplier = 1,
        maximalMultiplier = 1024,
        progress = 0,
        targetMultiplier = 2,
    }) {
        const { flashView } = this
        
        if (progress < 0.5) {
            flashView.alpha = targetMultiplier > 2
                ? Math.max(0, 1 - progress * 3)
                : 0
        } else if (progress > 0.7) {
            flashView.alpha = (progress - 0.7) / 0.3
        }

        this.presentMultiplierShift({
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
        this.presentMultiplierShift({
            minimalMultiplier,
            maximalMultiplier,
            targetMultiplier,
            progress
        })
    }

    setIdleProgress(progress) {
        this.flashView.scale.set(0.75 + Math.sin(Math.PI * progress) * 0.25)
    }
}