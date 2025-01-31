import { Container, Sprite } from "pixi.js";
import { AdaptiveContainer } from "./adaptiveDesign/AdaptiveContainer";

export class BackgroundView extends AdaptiveContainer {
	portraitView
	landscapeView


    constructor(assets) {
        super()

		this.portraitView = this.addChild(new Sprite(assets.background_portrait))
		this.portraitView.pivot.set(130, 15)
		this.landscapeView = this.addChild(new Sprite(assets.background_landscape))
		this.landscapeView.pivot.set(69, 125)
    }
	

    updateTargetArea(sidesRatio) {
		const { portraitView, landscapeView } = this

        if (sidesRatio > 1) {
			portraitView.visible = false
			landscapeView.visible = true
			this.setSourceArea({width: 638, height: 232})
				.setTargetArea({x: 0, y: 0, width: 1, height: 0.8})
		} else {
			portraitView.visible = true
			landscapeView.visible = false
			this.setSourceArea({width: 280, height: 462})
				.setTargetArea({x: 0, y: 0, width: 1, height: 1})
			
		}
    }
}