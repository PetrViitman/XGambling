import {Container, Sprite} from 'pixi.js'
import {Timeline} from '../../timeline/Timeline'
import {TextField} from '../text/TextField'

export class InfoBarViewBCP extends Container {
    htmlElement

    skinView

    textField

    text

    isHidingText

    messageAlpha = 1

    hiddenTextAlpha = 1

    timeline = new Timeline()

    pauseTimeline = new Timeline().addAnimation({duration: 2000})

    backgroundColor

    constructor({
        assets,
        width = 1200,
        height = 150,
    }) {
        super()
        this.initBackground(assets)
        this.initSkin(assets)
        this.initTextField(width, height)

        this.textField.setText('123124325432CONGRATULATIONS')
    }

    initBackground(assets) {
        const sprite = new Sprite(
            assets['infobar_skin'],
        )
        this.addChild(sprite)
            .anchor.set(0.5)

        sprite.position.set(-2, 2)
        sprite.tint = 0x89007e
    }

    initSkin(assets) {
        const sprite = new Sprite(
            assets['infobar_skin'],
        )
        this.addChild(sprite)
            .anchor.set(0.5)

        sprite.position.set(-2, 2)
        this.skinView = sprite
        this.skinView.alpha = 0
    }

    initTextField(maximalWidth, maximalHeight) {

        this.textField = this
            .addChild(
                new TextField({maximalWidth, maximalHeight}),
            )
            .setFontName('egypt')
            .setFontSize(maximalHeight)
            .setFontColor(0xFFFFFF)
            .setAlignCenter()
            .setAlignMiddle()

        this.textField
            .pivot
            .set(
                maximalWidth / 2,
                maximalHeight / 2,
            )
    }

    presentMessage({
        text,
        forcePresent = false,
        color,
    }) {
        if (this.text === text && !forcePresent) {
            return
        }

        const {
            textField,
            timeline,
            skinView,
        } = this
        const isColorChanged = this.backgroundColor !== color

        this.backgroundColor = color

        if (color) {
            skinView.tint = color
        }

        this.text === text
        || timeline
            .deleteAllAnimations()
            .addAnimation({
                duration: 250,
                onProgress: (progress) => {
                    textField.alpha = 1 - progress

                    if (isColorChanged) {
                        skinView.alpha = Math.min(
                            skinView.alpha,
                            textField.alpha,
                        )
                    }
                },
            })
            .addAnimation({
                delay: 250,
                onDelayFinish: () => {
                    textField.setText(text)
                },
                duration: 250,
                onProgress: (progress) => {
                    textField.alpha = progress
                    if (isColorChanged && color) {
                        skinView.alpha = progress
                    }
                },
            })
            .play()

        this.text = text
    }
}

