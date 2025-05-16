import { Container, Sprite } from "pixi.js";
import { TextField } from "../../text/TextField";
import { formatMoney } from "../../../Utils";

const MAXIMAL_WIDTH = 925

export class PayoutView extends Container {
    backgroundView
    textFields

    constructor(assets) {
        super()

       this.initWinView(assets)
        this.initTextFields(assets)

        
    }


    initWinView(assets) {
        
        
        const winViewContainer = new Container();
        const payViewContainer = new Container();
        const contentContainer = new Container();
        this.contentContainer = contentContainer

        this.winViewSprite = new Sprite(assets.win_sprite);
        this.winViewSprite.anchor.x = 1
        this.winViewSprite.x = 50
        this.winViewSprite.y= 20;
        this.totaWinViewSprite = new Sprite(assets.total_win_sprite);
        this.totaWinViewSprite.anchor.x = 1
        this.totaWinViewSprite.x = 50
        
        winViewContainer.addChild(this.winViewSprite);
        winViewContainer.addChild(this.totaWinViewSprite);
        
        winViewContainer.y = 100
        //payViewContainer.position.set(0, 0)

        this.winViewSprite.visible = false
        this.totaWinViewSprite.visible = false

        this.winViewContainer = winViewContainer
        this.payViewContainer = payViewContainer


        this.contentContainer.addChild(this.winViewContainer);
        this.contentContainer.addChild(this.payViewContainer);
        this.addChild(this.contentContainer)
        this.contentContainer.position.set(-100, -150)
        this.contentContainer.pivot.set(this.contentContainer.width / 2, this.contentContainer.height /2) 

    }
    updatePositions() {
        
        //this.winViewContainer.x = (this.contentContainer.width - this.winViewContainer.width) / 2 - 370;
        //this.payViewContainer.x = (this.contentContainer.width - this.payViewContainer.width) / 2 + 200 ;
    }

    initTextWin(assets) {
        
    }

    initTextFields(assets) {
        const maximalWidth = 400
		const maximalHeight = 100
        const textures = [
            assets['0_white'],
            assets['1_white'],
            assets['2_white'],
            assets['3_white'],
            assets['4_white'],
            assets['5_white'],
            assets['6_white'],
            assets['7_white'],
            assets['8_white'],
            assets['9_white'],
            assets['period_white'],
        ]

        this.textFields = [
            0xfd0500
            
        ].map(color => {
            const textField = new TextField({
                    maximalWidth,
                    maximalHeight
                })
                .setFontName(
                    '0123456789.',
                    textures
                )
                .setFontSize(maximalHeight)
                .setAlignLeft()
                .setAlignMiddle()
                .setLetterSpacing(-5)
                .setText('20354')

            textField.pivot.set(
                0,
                maximalHeight / 2)

                textField.setHiddenCharacters([','])

                textField.x = 100
                textField.y = 150
                textField.visible = false
            return this.payViewContainer.addChild(textField)
        })

    }



    presentIntro({
        payout = 123,
        progress = 0
    }) {
        
        this.textFields.forEach(view => {
            view.visible = true
            view.setText(formatMoney({value: payout}))
           
            if (progress < 0.1) {
                view.alpha = progress / 0.1; 
            } else {
                view.alpha = 1; 
            }
        })
        this.winViewSprite.visible = true
        this.totaWinViewSprite.visible = false
        this.updatePositions()
    }

    presentMultiplier({
        payout = 123,
        multipliedPayout = payout,
        progress = 0
    }) {
        
        const payoutDelta = multipliedPayout - payout
        const angle = Math.PI * 2 * progress **2
        const sin = Math.sin(angle)
        const finalPayout = formatMoney({
            value: payout + payoutDelta * Math.min(1, progress * 2)
        })

        this.textFields.forEach(view => {
            view.setText(finalPayout)

        })
        this.updatePositions()
    }

    presentOutro({
        multipliedPayout = 268,
        progress = 0
    }) {

        const finalPayout = formatMoney({value: multipliedPayout})
        const alpha = 1 - Math.min(1, progress * 2)



        this.textFields.forEach(view => {
            view.setText(finalPayout)   
           if (progress > 0.95) {
            view.alpha = (1 - progress) / 0.05;
        } else {
            view.alpha = 1;
        }
        
        })
        this.winViewSprite.visible = false
        this.totaWinViewSprite.visible = true
    }

	reset() {
        this.winViewSprite.visible = false
        this.totaWinViewSprite.visible = false
        this.updatePositions()
	}

}