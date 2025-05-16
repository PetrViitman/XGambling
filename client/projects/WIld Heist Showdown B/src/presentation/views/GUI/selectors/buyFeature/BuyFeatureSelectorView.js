import { Container, Sprite } from "pixi.js";
import { PopupSelectorView } from "../PopupSelectorView";
import { ButtonBarView } from "../accounts/ButtonBarView";
import { TextField } from "../../../text/TextField";
import { Timeline } from "../../../../timeline/Timeline";
import { colorToColor } from "../../../GraphicalPrimitives";
import { formatMoney } from "../../../../Utils";
import { ButtonPurchaseView } from "./ButtonPurchaseView";
import { ButtonCancelView } from "./ButtonCancelView";
import { GUIView } from "../../GUIView";

const SYMBOLS_PER_LINE_COUNT = 25

export class BuyFeatureSelectorView extends PopupSelectorView {
    scattersViews
    idleTimeline = new Timeline
    bet = 0
    currencyCode = 'FUN'
    buyFeatureBetMultiplier = 1

    backgroundContainer
    
    constructor({assets, dictionary, currencyCode, isLTRTextDirection, buyFeatureBetMultiplier, audio}) {
        super({assets, dictionary, currencyCode, isLTRTextDirection})

        this.buyFeatureBetMultiplier = buyFeatureBetMultiplier
        this.initBackground(assets)
        this.initButtons({assets, dictionary, audio})
    }

    initBackground(assets) {
        this.backgroundContainer = this.addChild(new Container)
        this.backgroundContainer.scale.set(0.75)
        const sprite = new Sprite(assets.buy_feature_popup)
        sprite.eventMode='static'
        sprite.anchor.set(0.5)
        sprite.addEventListener('pointerup', () => { GUIView.isOverlayInteraction = false })
        sprite.addEventListener('pointerleave', () => { GUIView.isOverlayInteraction = false })
        sprite.addEventListener('pointercancel', () => { GUIView.isOverlayInteraction = false })
        sprite.addEventListener('pointerout', () => { GUIView.isOverlayInteraction = false })
        sprite.addEventListener('pointerupoutside', () => { GUIView.isOverlayInteraction = false })
        this.backgroundContainer.position.set(500)
        this.backgroundContainer.addChild(sprite)
        this.addChildAt(this.backgroundContainer, 0)
    }

    initReelSelector(assets) {
    }

    initButtons({assets, dictionary, audio}) {
        const {backgroundContainer} = this
        let view = new ButtonPurchaseView({assets, text: dictionary.purchase, audio})
        view.position.set(220,325)
        view.onClick = () => this.onPurchaseRequest?.()
        view.iconView.setFontColor(0xFFFF00)
        this.buttonPurchaseView = backgroundContainer.addChild(view)

        view = new ButtonCancelView({assets, text: 'cancel', audio})
        view.position.set(-220, 325)
        view.onClick = () => this.onOverlayClick?.()
        view.iconView.setFontColor(0xFFFF00)
        this.buttonCancelView = backgroundContainer.addChild(view)


        const sprite = new Sprite(assets.buy_feature_price_panel)
        sprite.anchor.set(0.5)
        sprite.scale.set(0.325)
        sprite.position.set(0, -115)
        backgroundContainer.addChild(sprite)


        let maximalWidth = 680
        let maximalHeight = 140
        this.headerView
            .setText(dictionary.buy_bonus_game)
            .setMaximalWidth(maximalWidth)
            .setMaximalHeight(maximalHeight)
            .setFontSize(100)
            .setCharactersPerLineCount(SYMBOLS_PER_LINE_COUNT)
            
        this.headerView.pivot.set(maximalWidth / 2, maximalHeight / 2)
        this.headerView.position.set(500, 225)

        maximalWidth = 700
        maximalHeight = 150
        let textField = new TextField({maximalWidth, maximalHeight})
            .setFontName('default')
            .setCharactersPerLineCount(SYMBOLS_PER_LINE_COUNT)
            .setAlignMiddle()
            .setAlignCenter()
            .setFontColor(0x6E3A29)
            .setText(dictionary.buy_feature_instructions)
            .setFontSize(40)

        textField.pivot.set(maximalWidth / 2, maximalHeight / 2)
        textField.position.set(500, 600)
        this.instructionTextField = this.addChild(textField)



        maximalWidth = 400
        maximalHeight = 60
        textField = new TextField({maximalWidth, maximalHeight})
            .setCharactersPerLineCount(SYMBOLS_PER_LINE_COUNT)
            .setFontName('0123456789.',[
                assets.amount0,
                assets.amount1,
                assets.amount2,
                assets.amount3,
                assets.amount4,
                assets.amount5,
                assets.amount6,
                assets.amount7,
                assets.amount8,
                assets.amount9,
                assets.amountdot,
            ])
            .setAlignMiddle()
            .setAlignCenter()
            .setFontColor(0xFFFF00)
            .setText('123.00 FUN')
            .setFontSize(maximalHeight)

        textField.pivot.set(maximalWidth / 2, maximalHeight / 2)
        textField.position.set(500, 415)
        this.finalPriceTextfield = this.addChild(textField)
    }

    refresh({bet = this.bet, currencyCode = this.currencyCode}) {
        const {dictionary, isLTRTextDirection} = this

        this.instructionTextField.setText(
            dictionary
                .buy_feature_instructions
                
                .split('{BET}').join(
                    formatMoney({
                        value: bet,
                        isLTRTextDirection,
                        currencyCode
                    })
                )
        )

        this.finalPriceTextfield.setText(
            formatMoney({
                value: bet * this.buyFeatureBetMultiplier,
                isLTRTextDirection
            })
        )
    }
}