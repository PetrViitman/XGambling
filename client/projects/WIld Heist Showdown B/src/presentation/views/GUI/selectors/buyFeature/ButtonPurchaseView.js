import { Sprite } from "pixi.js";
import { ButtonBarView } from "../accounts/ButtonBarView";

export class ButtonPurchaseView extends ButtonBarView {
    initBody(assets) {
        const sprite = new Sprite(assets.button_purchase)
        sprite.anchor.set(0.5)
        this.bodyContainer.addChild(sprite)
        this.bodyView = sprite
    }
}