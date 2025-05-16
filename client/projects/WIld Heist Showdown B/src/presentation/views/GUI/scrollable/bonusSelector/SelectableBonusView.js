import { Container, Sprite } from "pixi.js";
import { TextField } from "../../../text/TextField";
import { ButtonBarView } from "../../selectors/accounts/ButtonBarView";
import { getDefaultLocale } from "../../../../Utils";
import { ButtonBonusView } from "./ButtonBonusView";
import { BonusIconsPoolView } from "./BonusIconsPoolView";

export class SelectableBonusView extends Container {
    descriptor
    buttonView
    descriptionTextField
    itemsCountTextField
    remainingTimeTextField
    iconsViews = []
    bonusIconsPoolView
    
    constructor({assets, dictionary, isLTRTextDirection, audio}) {
        super()

        this.initFrame(assets)
        this.initTexts(isLTRTextDirection)
        this.initButton({assets, dictionary, audio})
        this.initIcons(assets, isLTRTextDirection)
    }

    initFrame(assets) {
        const width = 1000

        let sprite = new Sprite(assets.UIBorder)
        sprite.anchor.set(0, 0.5)
        sprite.rotation = -Math.PI / 2
        sprite.height = width - 20
        sprite.position.set(width / 2, 250)
        this.addChild(sprite)
    }
 
    initTexts(isLTRTextDirection) {
        let maximalWidth = 1000
        let maximalHeight = 125

        let textField = new TextField({
            maximalWidth,
            maximalHeight,
            isDynamicCharacterSet: true
        })
            .setFontName('default')
            .setFontSize(40)
            .setFontColor(0xf8ee89)
            .setAlignCenter()
            .setAlignMiddle()
            .setCharactersPerLineCount(40)

        textField.position.set(0)

        this.descriptionTextField = this.addChild(textField)

        maximalWidth = 250
        maximalHeight = 100

        textField = new TextField({
            maximalWidth,
            maximalHeight,
            isDynamicCharacterSet: true
        })
            .setFontName('default')
            .setFontSize(60)
            .setFontColor(0xf8ee89)
            .setAlignLeft()
            .setAlignMiddle()

        this.itemsCountTextField = this.addChild(textField)
        textField.position.set(isLTRTextDirection ? 100 : 650, 125)

        textField = new TextField({
            maximalWidth,
            maximalHeight,
            isDynamicCharacterSet: true
        })
            .setFontName('default')
            .setFontSize(30)
            .setFontColor(0xf8ee89)
            .setAlignRight()
            .setAlignMiddle()

        this.remainingTimeTextField = this.addChild(textField)
        textField.position.set(isLTRTextDirection ? 650 : 100, 125)
    }

    initButton({assets, dictionary, audio}) {
        const view = new ButtonBonusView({assets,text: dictionary.activate, audio})
        view.position.set(500, 175)
        view.scale.set(0.75)
        view.onClick = () => {
            this.onBonusActivationRequest?.(this.descriptor)
        }
        this.buttonView = this.addChild(view)
    }

    initIcons(assets, isLTRTextDirection) {
        const iconsPoolView = new BonusIconsPoolView(assets)

        iconsPoolView.rotation = isLTRTextDirection ? -0.25 : 0.25
        iconsPoolView.position.set(isLTRTextDirection ? 50 : 950, 175)
        iconsPoolView.scale.set(0.75)

        this.bonusIconsPoolView = iconsPoolView
        this.addChild(iconsPoolView)
        this.iconsViews.push(iconsPoolView)

        const sprite = new Sprite(assets.iconWatches)
        sprite.anchor.set(0.5)
        sprite.scale.set(1)
        sprite.rotation = isLTRTextDirection ? 0.25 : -0.25
        sprite.position.set(isLTRTextDirection ? 950 : 50, 175)

        this.addChild(sprite)

        this.iconsViews.push(sprite)
    }
    
    refresh({
        id,
        description,
        type,
        count,
        bet,
        remainingMinutesCount,
        gameId,
        color
    }) {

        this.remainingMinutesCount = remainingMinutesCount
        this.descriptor = {
            id,
            type,
            bet,
            description,
            gameId
        }

        const fontColor = color ?? 0xf8ee89
        const iconsColor = color ?? 0xFFFFFF
        this.descriptionTextField.setText(description).setFontColor(fontColor)
        this.itemsCountTextField.setText('x' + count).setFontColor(fontColor)
        this.remainingTimeTextField.setFontColor(fontColor)
        this.iconsViews.forEach(view => view.tint = iconsColor)
        this.bonusIconsPoolView.setTint(iconsColor)
        this.bonusIconsPoolView.presentBonus(type)

        this.presentRemainingTime()
    }

    presentRemainingTime(elapsedMinutesCount = 0, locale = getDefaultLocale()) {
        const remainingMinutesCount = Math.trunc(Math.max(0, this.remainingMinutesCount - elapsedMinutesCount))
        const hours = Math.trunc(remainingMinutesCount / 60)
        const days = Math.trunc(hours / 24)

        const finalHours = Math.trunc(hours - days * 24)

        this.remainingTimeTextField.setText(
            new Intl.DurationFormat(locale, { style: "narrow" }).format(
                {
                    days,
                    hours: finalHours,
                    minutes: remainingMinutesCount - (days * 24 * 60 + finalHours * 60)
                },
            ) || '-'
        )

        const alpha = remainingMinutesCount ? 1 : 0.25

        this.itemsCountTextField.alpha = alpha
        this.remainingTimeTextField.alpha = alpha
        this.descriptionTextField.alpha = alpha
        this.iconsViews.forEach(view => view.alpha = alpha)
        this.buttonView.setInteractive(!!remainingMinutesCount)
    }
}