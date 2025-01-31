import { Container, Sprite } from "pixi.js";
import { Timeline } from "../../timeline/Timeline";
import { TextField } from "../text/TextField";

export class FreeSpinsIndicatorView extends Container {
    dictionary
    textField
    timeline = new Timeline
    spinsCount

    constructor(resources, dictionary) {
        super()

        this.dictionary = dictionary
        this.initFrame(resources)
        this.initTextField()
    }

    initFrame(resources) {
        const sprite = new Sprite(resources.free_spins_indicator)
        sprite.anchor.set(0.5)
        sprite.skew.x = 0.2
        this.addChild(sprite)
    }

    initTextField() {
        const width = 320
        const height = 60

        const textField = new TextField({
            maximalWidth: width,
            maximalHeight: height
        })
            .setFontColor(0xFF9900)
            .setFontColor(0xFF9955)
            .setFontName('egypt')
            .setFontSize(45)
            .setText('123456')
            .setAlignMiddle()
            .setAlignCenter()

        textField.pivot.set(width / 2, height / 2)

        this.addChild(textField)
        this.textField = textField
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
                        this.textField.setText(this.dictionary.free_spins_bmp + ': ' + spinsCount)
                }
            })
            .play()
    }
}