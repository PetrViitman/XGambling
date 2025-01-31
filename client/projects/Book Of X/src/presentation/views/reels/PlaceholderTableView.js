import { Container, Sprite } from "pixi.js";
import { CELL_HEIGHT, CELL_WIDTH } from "../../Constants";

export class PlaceholderTableView extends Container {
    placeHoldersViews
    
    constructor(resources) {
        super()

        this.placeHoldersViews = new Array(3).fill(0).map((_, x) =>
            new Array(7).fill(0).map((_, y) => {
                const sprite = new Sprite(resources.symbol_empty)
                sprite.position.set(x * CELL_WIDTH + 1, y * CELL_HEIGHT + 1)
                return this.addChild(sprite)
            }))
    }

    setVisible(visibilityMap = [0, 0, 1, 1, 1, 0, 0]) {
        this.placeHoldersViews.forEach(reel => {
            reel.forEach((view, y) =>
                view.visible = !visibilityMap[y])
        })
    }
}