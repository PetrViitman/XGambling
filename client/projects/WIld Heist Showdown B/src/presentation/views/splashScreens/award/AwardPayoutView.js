import { Container, Sprite } from "pixi.js";
import { formatMoney } from "../../../Utils";
import { TextField } from "../../text/TextField";
import { SpineView } from "../../SpineView";


export class AwardPayoutView extends Container {
    payoutTextFields
    contentContainer
    
    constructor(assets) {
        super()
        
        this.initContainers()
        this.initTextFields(assets)
        this.initCoinsSpineView(assets)
        this.presentCoinsSpineView()
        this.initGlow(assets)
        //this.presentGlow ()
    }
    
    initContainers() {
        this.contentContainer = this.addChild(new Container)
        this.digitsContainer = this.contentContainer.addChild(new Container)
        this.digitsContainer.y = 0
    }

    initTextFields(assets) {
        const maximalWidth = 800
		const maximalHeight = 200
        const textures = [
            assets.paydigit0,
            assets.paydigit1,
            assets.paydigit2,
            assets.paydigit3,
            assets.paydigit4,
            assets.paydigit5,
            assets.paydigit6,
            assets.paydigit7,
            assets.paydigit8,
            assets.paydigit9,
            assets.paydot,
            assets.paydot,
        ]

        this.payoutTextFields = new TextField({
            maximalWidth,
            maximalHeight
            })
            .setFontName(
                '0123456789.,',
                textures
            )
            .setFontSize(maximalHeight)
            .setAlignCenter()
            .setAlignMiddle()
            .setLetterSpacing(-maximalHeight / 12)

            this.payoutTextFields.pivot.set(
            maximalWidth / 2,
            maximalHeight / 2)

            this.payoutTextFields.setHiddenCharacters([','])
            this.payoutTextFields.scale.set(0.8)

            return this.digitsContainer.addChild(this.payoutTextFields)
    }

    initCoinsSpineView(assets, vfxLevel) {
        const spineCoinView = new SpineView(assets.coins); 
        this.addChild(spineCoinView); 
        spineCoinView.y = -100
        this.spineCoinView = spineCoinView; 
    }

	initGlow(assets){
		const spineView = new SpineView(assets.popup); 
		this.addChild(spineView); 
		spineView.y = -50
		this.spineView = spineView; 
  	}

    presentCoinsSpineView() {
        this.spineCoinView.playAnimation({ name: 'coins', isLoopMode: true });
    }

    setIdleProgress(progress) {
       const digitsContainer = this.digitsContainer
        digitsContainer.scale.set( 1 + 0.025 * Math.sin(Math.PI * 2 * progress))
        this.presentCoinsSpineView()
    }
    

    presentTransition(progress) {
        const subProgress = Math.sin(Math.PI * progress)
        const regress = 1 - progress
        this.digitsContainer.scale.set(1 + 0.25 * subProgress)
        this.digitsContainer.alpha = subProgress
        
    }

    presentPayout(payout = 123) {
        this.payoutTextFields.setText(formatMoney({value: payout}))
    
    }

    presentGlow (){
    this.spineView.playAnimation({ name: 'glow', isLoopMode: false });
    }
}