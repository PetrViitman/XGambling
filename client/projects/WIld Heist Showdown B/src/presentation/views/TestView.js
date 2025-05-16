import { Container } from "pixi.js";
import { SpineView } from "./SpineView";


export class TestView extends Container {

    constructor(assets) {
        super();
        this.contentContainer = this.addChild(new Container)

        this.initPopupSpine(assets)
        this.playAnimation()


//document.addEventListener('keyup', () => {
//this.playAnimation('super_mega_win/idle')
//})

    }
        
   
    initPopupSpine(assets) {


        const popupBottomView = new SpineView (assets.popup);
        popupBottomView.pivot.set(popupBottomView.width / 2, popupBottomView.height /2)
        this.popupBottomView = popupBottomView;
        this.addChild(this.popupBottomView)

        const popupUpView = new SpineView (assets.popupUp);
        popupUpView.pivot.set(popupUpView.width / 2, popupUpView.height /2)
        this.popupUpView = popupUpView;
        this.addChild(this.popupUpView)
        
        
        this.contentContainer.addChildAt(popupBottomView,1)
        this.contentContainer.addChildAt(popupUpView,2)
        this.contentContainer.scale.set(0.1)
        this.contentContainer.position.set(500, 500)
    }



    playAnimation (animationName,isLoopMode ){
            this.popupBottomView.playAnimation({name: animationName, isLoopMode:true})
            this.popupUpView.playAnimation({name: animationName, isLoopMode:true})
    }
    

}
