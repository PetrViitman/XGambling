import { Sprite } from "pixi.js";
import { ButtonBarView } from "../accounts/ButtonBarView";

export class ButtonCancelView extends ButtonBarView {
    initBody(assets) {
        const sprite = new Sprite(assets.button_cancel)
        sprite.anchor.set(0.5)
        this.bodyContainer.addChild(sprite)
        this.bodyView = sprite
    }
}