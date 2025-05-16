import { Container, Graphics, Sprite } from "pixi.js";
import { SpineView } from "../../../SpineView";
import { TextField } from "../../../text/TextField";
import { Timeline } from "../../../../timeline/Timeline";
import { formatMoney } from "../../../../Utils";
import { SCATTER_SYMBOL_ID, WILD_SYMBOL_ID, WIN_COEFFICIENTS } from "../../../../Constants";

import { InfoBarSymbolsPoolView } from "./InfoBarSymbolsPoolView";

const MAXIMAL_WIDTH = 925
const DELAY_BEFORE_IDLE_MESSAGES = 5000

const TEXT_COLOR_MAP = [

]


export class InfoBaseView extends Container {
    visibilityTimeline = new Timeline
    fadeTimeline = new Timeline
    timeline = new Timeline
    textField
    isLTRTextDirection = true
    idleTimeline = new Timeline
    contentContainer
    textFields = []
    symbolsPoolsViews = []
    
    assets
    dictionary

    idleMessageIndex = 0


    constructor(
        assets, 
        dictionary, 
        
        isLTRTextDirection
    )  {
        super();
        this.dictionary = dictionary;
        this.isLTRTextDirection = isLTRTextDirection;
        this.assets = assets;
        
        this.initBaseContainer()
        this.initSpineBottom(this.assets)
        this.initInfoBaseView(this.assets);
        this.initInfoBaseActiveView(this.assets)
        
        this.initTextField(this.assets)
        this.initTextContainer();
        this.initMask ()

        this.initSpineUp(this.assets)
        this.setSkin('base1')
        this.presentIdle()

    }

    initBaseContainer() {
        
        this.infoBaseContainer = this.addChild(new Container());
    }
    initTextContainer() {
        this.contentContainer = this.addChild(new Container());
        this.contentContainer.position.set(200,175)
        this.hintsContainer = this.contentContainer.addChild(new Container)

        this.hintsViews = [
            'подсказка_0',
            'подсказка_1',
            'подсказка_2',
        ].map(name => {
            const sprite = new Sprite(this.assets[name])
            sprite.anchor.set(0, 0.5)
            sprite.y = 25

            sprite.visible = false

            return this.hintsContainer.addChild(sprite)
        })


        this.idleTimeline
            .deleteAllAnimations()

        const {hintsViews} = this

        let timestamp = 0
        hintsViews.forEach((view, i) => {

            this.idleTimeline
                .addAnimation({
                    delay: timestamp,
                    duration: 1000,
                    onProgress: progress => {
                        hintsViews.forEach((view, j) => view.visible = i === j)
                    },
                })
                .addAnimation({
                    delay: timestamp + 1000,
                    duration: 3000,
                    onProgress: progress => {
                        view.x = - Math.max(0, (view.width - 950)) * progress
                    },
                })
                .addAnimation({
                    delay: timestamp + 4000,
                    duration: 1000,
                })

            timestamp += 5000
        })
        

        this.idleTimeline.setLoopMode(true)
            .play()



        /*
        this.infoWinUp = new Sprite(this.assets.infoWinUp);
		this.doublesAft = new Sprite(this.assets.doublesAft);

        this.scatterTriggered = new Sprite(this.assets.scatterTriggered);
        
        this.infoWinUp.visible = false
        this.doublesAft.visible = false
        this.scatterTriggered.visible = false
        this.contentContainer.addChild(this.infoWinUp)
        this.contentContainer.addChild(this.doublesAft)
        this.contentContainer.addChild(this.scatterTriggered)
        */
        
    }

    initInfoBaseView(assets) {
        this.infoBaseMap = {};
        this.infoBaseViews = [
            'base1',
            'base2',
            'base3',
        ].map((name) => {
            const infoBasesprite = new Sprite(this.assets['info' + name]);

            this.infoBaseMap[name] = infoBasesprite;
            return this.infoBaseContainer.addChild(infoBasesprite);
        });
    }



    initMask (){
        this.view = this.addChild(new Graphics())
        this.view.pivot.set(this.view.width/2, this.view.height/2)
        this.view

            .beginFill(0x1e100c, 0.75)
            .drawRect(0, 0, 1050, 95)
            .endFill()
            this.view.position.set(120,160)
        this.infoBaseContainer.addChild(this.view);
        this.contentContainer.mask = this.view
    }



    initInfoBaseActiveView(assets){
        const infoBaseActivesprite = new Sprite(this.assets.infoActivebase1);
        this.infoBaseContainer.addChild(infoBaseActivesprite)
        this.infoBaseActivesprite = infoBaseActivesprite

        this.infoBaseActivesprite.visible = false
    }


	initSpineUp(assets) { 
		const spineInfoUp = new SpineView(this.assets.info_up); 

		spineInfoUp.position.set(630, 220)
		spineInfoUp.scale.set(1)
		this.infoBaseContainer.addChild(spineInfoUp); 
		this.spineInfoUp = spineInfoUp; 
	}

	initSpineBottom(assets) { 
		const spineInfoBottom = new SpineView(this.assets.info_bottom); 

		spineInfoBottom.position.set(630, 220)
		spineInfoBottom.scale.set(1)
		this.infoBaseContainer.addChild(spineInfoBottom); 
		this.spineInfoBottom = spineInfoBottom; 
	}




    presentInfoBaseActiveView(visible) {
        this.infoBaseActivesprite.visible = visible;
    }

	presentSpineInfoUp(name) {

		switch (name) {
			case 0:
				this.spineInfoUp.playAnimation({ name: 'base1', isLoopMode: false });
				break;
			case 1:
				this.spineInfoUp.playAnimation({ name: 'base2',  isLoopMode: false });
				break;
			case 2:
				this.spineInfoUp.playAnimation({ name: 'base3',  isLoopMode: false });
				break;
				
		}
	}

	presentSpineInfoBottom(name) {

		switch (name) {
			case 0:
				this.spineInfoBottom.playAnimation({ name: 'base1', isLoopMode: false });
				break;
			case 1:
				this.spineInfoBottom.playAnimation({ name: 'base2',  isLoopMode: false });
				break;
			case 2:
				this.spineInfoBottom.playAnimation({ name: 'base3',  isLoopMode: false });
				break;
				
		}
	}

    presentTextChange(assets) {

        const sprite = new SpineView(this.assets.info_up);
        sprite.position.set(680, 220)
        sprite.scale.set(1)
        this.infoBaseContainer.addChild(sprite);
        sprite.playAnimation({name:'text_in', isLoopeMode:false})
    }

    presentWinChange(assets) {

        const sprite = new SpineView(this.assets.infoBottom);
        sprite.position.set(600, 220)
        sprite.scale.set(1)
        this.infoBaseContainer.addChildAt(sprite,0);
        sprite.playAnimation({name:'text_change', isLoopeMode:false})
   
}

    async setSkin(name) {
        this.infoBaseViews.forEach(view => view.visible = false)
        this.infoBaseMap[name].visible = true

    }

    reset() {
        this.setSkin('base1')
        this.presentIdle()
        this.infoBaseActivesprite.visible = false
    }

    initTextField() {
    }

    getTextField(index) {

    }

    getSymbolsPool(index) {
    }

    presentMessage(text) {
    }

    presentFade() {
    }

    adjustContentContainer(width) {
    }

    drop() {
   /*     
        this.textFields.forEach(textField => {
            textField.visible = false
            textField.x = 0

        })
        */
        this.contentContainer.visible = false

    }

    async presentPayout({
        collapses = [
            {symbolId: 1, symbolsCount: 3},
            {symbolId: 2, symbolsCount: 3},
            {symbolId: 3, symbolsCount: 3},
            {symbolId: 4, symbolsCount: 3},
            {symbolId: 5, symbolsCount: 3},
        ],
        multiplier = 2,
        payout = 123,
        currencyCode = 'FUN'
    }) {
      
        this.drop()

    }



    async presentIdle() {
        this.contentContainer.visible = true
        this.hintsContainer.visible = true

        /*
        
            .addAnimation({
                duration: 3000,
                onProgress: progress => {
                    this.infoWinUp.visible = true;
                    this.doublesAft.visible = false; 
                },

            })

            .addAnimation({

                delay: 3000,
                duration: 3000,
                onProgress: progress => {
                    this.infoWinUp.visible = true;
                    this.doublesAft.visible = false; 
                    this.infoWinUp.x = -this.infoWinUp.width * progress - 55;
                },

            })
            .addAnimation({

                delay: 6500, 
                duration: 3000,
                onProgress: progress => {
                    this.doublesAft.visible = true;
                    this.infoWinUp.visible = false;
                },

            })
            .addAnimation({

                delay: 9500, 
                duration: 3000,
                onProgress: progress => {
                    this.doublesAft.visible = true;
                    this.infoWinUp.visible = false;
                    this.doublesAft.x = -this.doublesAft.width * progress - 55;
                },

            })
            .setLoopMode()
            .play();
        */

    }

    async presentFreeSpinsAward({
    }) {
    }

    async presentTension() {
        this.drop()
        this.scatterTriggered.visible = true
    }

    async presentCommonPayout({

    }) {
            this.drop()
          
    }

    async presentIntro() {
        this.presentIdle()
    }

    setVisible(isVisible) {
        this.visibilityTimeline
            .deleteAllAnimations()
            .addAnimation({
                duration: 100,
                onProgress: progress => {
                    this.alpha = isVisible
                        ? Math.max(this.alpha, progress)
                        : Math.min(this.alpha, 1 - progress)
                    this.visible = this.alpha > 0
                }
            })
            .play()
    }
}
