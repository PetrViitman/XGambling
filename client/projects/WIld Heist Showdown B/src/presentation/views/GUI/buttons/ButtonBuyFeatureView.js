import { Sprite } from "pixi.js";
import { ButtonView } from "./ButtonView";
import { Timeline } from "../../../timeline/Timeline";
import { colorToColor } from "../../GraphicalPrimitives";

export class ButtonBuyFeatureView extends ButtonView {
    initBody(assets) {
        const sprite = new Sprite(assets.button_buy_feature)
        sprite.anchor.set(0.5)
        this.bodyContainer.addChild(sprite)
        this.bodyView = sprite
    }

    initIcon(assets) {
        const sprite = new Sprite(assets.buy_bonus)
        sprite.anchor.set(0.5)
        sprite.scale.set(1)
        this.iconView = sprite
        this.iconContainer.addChild(sprite)
    }

    setInteractive(isInteractive = true) {
        this.eventMode = 'static'// isInteractive ? 'static' : 'none'
        // this.cursor = isInteractive ? 'pointer' : 'default'
        this.iconContainer.alpha = isInteractive ? 1 : 0.25

        this.isResponsive = isInteractive
    }
}