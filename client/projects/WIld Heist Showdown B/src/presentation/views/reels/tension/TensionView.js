import { BLEND_MODES, Container, Filter, Graphics, Sprite } from "pixi.js";
import { CELL_HEIGHT, CELL_WIDTH, REELS_HEIGHT, REELS_LENGTHS } from "../../../Constants";
import { colorToColor } from "../../GraphicalPrimitives";
import { SpineView } from "../../SpineView";

export class TensionView extends Container {
	reelIndex

	constructor(assets, reelIndex) {
		super()

		this.reelIndex = reelIndex
		this.initSpine(assets)
        this.presentTentionAnimation(reelIndex)
		this.alpha = 0
	}


	initSpine(assets) { 
		const spineView = new SpineView(assets.glow); 
		this.addChild(spineView); 
		this.spineView = spineView; 
	}


	presentTentionAnimation(reelIndex) {

		switch (reelIndex) {
			case 0:
				this.spineView.playAnimation({ name: 'small', isLoopMode: true });
				this.spineView.scale.set(-1,1)
				break;
			case 1:
				this.spineView.playAnimation({ name: 'medium',  isLoopMode: true });
				this.spineView.scale.set(-1,1)
				break;
			case 2:
				this.spineView.playAnimation({ name: 'big',  isLoopMode: true });
				break;
			case 3:
				this.spineView.playAnimation({ name: 'big', isLoopMode: true });
				break;
			case 4:
				this.spineView.playAnimation({ name: 'medium', isLoopMode: true });
				break;
			case 5:
				this.spineView.playAnimation({ name: 'small', isLoopMode: true });
				break;
		}
	}

	/*initSymbols(assets) {
		this.symbolsViews = new Array(5).fill(0).map(_ => {
			const sprite = new Sprite(assets.symbol_tension)
			sprite.scale.set(3)
			sprite.anchor.set(0.5)
			sprite.tint= 0xFFFF00

			return this.addChild(sprite)
		})
	
}
*/
	setProgress(progress) {
		const motionProgress = (progress * 3) % 1
		const {reelIndex} = this
		const finalProgress = (motionProgress + reelIndex * 0.1) % 1

		//const offsetX = reelIndex - 2.5

		this.presentTentionAnimation(reelIndex)


		this.alpha = Math.min(1, Math.sin(Math.PI * progress) * 3)
	}
}