import { Container, Sprite } from "pixi.js";
import { Timeline } from "../../timeline/Timeline";
import { TextField } from "../text/TextField";

export class FreeSpinsIndicatorView extends Container {
    textField
    timeline = new Timeline
    spinsCount

    constructor(assets, dictionary) {
        super()

        // this.initFrame(assets)
        this.initTextFields(dictionary)

        this.presentRemainingSpinsCount(15)
    }

    initFrame(assets) {
        const sprite = new Sprite(assets.free_spins_indicator)
        sprite.anchor.set(0.5)
        this.addChild(sprite)
    }

    initTextFields(dictionary) {
        const width = 150
        const height = 45

        const textFields = [0, 0].map(_ => {
            const textField = new TextField({
                maximalWidth: width,
                maximalHeight: height
            })
                .setFontColor(0xFFFFFF)
                .setFontName('default')
                .setText(dictionary.free_spins_bmp)
                .setFontSize(45)
                .setAlignMiddle()
                .setAlignCenter()

            textField.pivot.set(width / 2, height / 2)
            textField.y = -25

            return this.addChild(textField)
        })

        textFields[1].y = 20
        textFields[1].setMaximalHeight(50)
        textFields[1].setText('1')

        this.textField = textFields[1]
    }

    setTimeScale() {

    }

    presentRemainingSpinsCount(spinsCount = 0) {
        if(this.spinsCount === spinsCount) return

        this.spinsCount = spinsCount

        return this.timeline
            .deleteAllAnimations()
            .addAnimation({
                duration: 500,
                onProgress: progress => {
                    const subProgress = Math.sin(Math.PI * progress)
                    this.textField.alpha = 1 - subProgress
                    this.textField.scale.set(1 - subProgress)
                    if(progress > 0.5)
                        this.textField.setText(spinsCount + '')
                }
            })
            .play()
    }
}