import { AssetsClass, Container, Sprite } from "pixi.js";
import { CELL_HEIGHT, CELL_WIDTH, REELS_COUNT, REELS_HEIGHT, REELS_OFFSETS } from "../../../Constants";
import { TensionView } from "./TensionView";
import { getRandomLoseReels } from "../../../Utils";
import { Timeline } from "../../../timeline/Timeline";
import { SpineView } from "../../SpineView";

export class TensionPoolView extends Container {
    tensionsViews
	timeline = new Timeline

    constructor(assets) {
        super()
        this.initTensions(assets)
        this.initSpine(assets)
        //this.presentTensionsMultplier()
	}
    initTensions(assets) {
        this.tensionsViews = REELS_OFFSETS.map((offsetY, i) => {
            const view  = new TensionView(assets, i)
        	view.x = i * 208 - 400
            view.y = CELL_HEIGHT /2 - 220
			view.scale.set(0.9, 1.1)
            return this.addChild(view)
        })
    }

    initSpine(assets) { 
		const spineView = new SpineView(assets.glow); 
		this.addChild(spineView); 
		this.spineView = spineView; 
        this.spineView.scale.set(1.6)
        this.spineView.position.set(80,-70)
	}

    presentTensionsMultplier(){
        this.spineView.alpha = 1
        this.spineView.playAnimation({ name: 'up', isLoopMode: true })
    }

    reset (){
        this.spineView.alpha = 0
    }
	
	drop() {
		this.timeline.wind(1)
	}
}
