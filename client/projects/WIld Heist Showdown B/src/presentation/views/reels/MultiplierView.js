import { BLEND_MODES, Container, Sprite } from "pixi.js";
import { TextField } from "../text/TextField";
import { EASING, Timeline } from "../../timeline/Timeline";


export class MultiplierView extends Container {
    textField1024
    textFields
    multiplierContainer

    timelineIntro = new Timeline
    timelineFSMultiplier = new Timeline
    timelineMultiplierTransition = new Timeline

    constructor(assets){
        super()
        this.initBodyParts(assets)
        this.initTextFields(assets)
        this.presentShift({})
    }

    initTextFields(assets) {
        const {plateContainer} = this
        const maximalWidth = 150;
        const maximalHeight = 80;
        // 1024 MULTIPLIER...
        const scaleMultiplier = 1.5
        const textField = new TextField({
            maximalWidth: maximalWidth * scaleMultiplier,
            maximalHeight: maximalHeight * scaleMultiplier})
            .setFontName(
                'x1024',
                [
                    assets.digits1024_x,
                    assets.digits1024_1,
                    assets.digits1024_0,
                    assets.digits1024_2,
                    assets.digits1024_4,
                ])
            .setFontSize(200)
            .setAlignCenter()
            .setAlignMiddle()
            .setLetterSpacing(-50)
            .setText('x1024')

        textField.pivot.set(
            maximalWidth * scaleMultiplier / 2,
            maximalHeight * scaleMultiplier / 2
        )
    
        plateContainer.addChild(textField)
        this.textField1024 = textField
        // ...1024 MULTIPLIER

        const flyableMultiplierView = new TextField({
                maximalWidth,
                maximalHeight
            })
            .setFontName(
                'x0123456789.,',
                [
                    assets.digitx,
                    assets.digit0,
                    assets.digit1,
                    assets.digit2,
                    assets.digit3,
                    assets.digit4,
                    assets.digit5,
                    assets.digit6,
                    assets.digit7,
                    assets.digit8,
                    assets.digit9,
                    assets.dot,
                    assets.dot,
                ])
            .setFontSize(68)
            .setAlignCenter()
            .setAlignMiddle()
            .setLetterSpacing(-maximalHeight / 8)
    
        flyableMultiplierView.pivot.set(
            maximalWidth / 2,
            maximalHeight / 2
        )
        flyableMultiplierView.y = 100
        
        this.flyableMultiplierView = this.multiplierContainer.addChild(flyableMultiplierView)
      
        // Создание основного ..
        this.textFields = new Array(5).fill(0).map(_ => {
            const textField = new TextField({
                maximalWidth,
                maximalHeight
            })
            .setFontName(
                'x0123456789.,',
                [
                    assets.digitx,
                    assets.digit0,
                    assets.digit1,
                    assets.digit2,
                    assets.digit3,
                    assets.digit4,
                    assets.digit5,
                    assets.digit6,
                    assets.digit7,
                    assets.digit8,
                    assets.digit9,
                    assets.dot,
                    assets.dot,
                ])
            .setFontSize(68)
            .setAlignCenter()
            .setAlignMiddle()
            .setLetterSpacing(-maximalHeight / 8)
    
            textField.pivot.set(
                maximalWidth / 2,
                maximalHeight / 2
            )

            return plateContainer.addChild(textField)
        })
        // ..Создание основного 
    }


    initBodyParts(assets) {
        const plateContainer = new Container();
        plateContainer.position.set(-30, 1700);
        const plateSprite = new Sprite(assets.plate);
        plateSprite.anchor.set(0.5, 0.84)
        plateContainer.addChild(plateSprite);
        this.plateContainer = plateContainer;
        this.addChild(plateContainer); 
        
        const multiplierGlow = new Container()
        multiplierGlow.y = 100
        this.multiplierGlow = multiplierGlow
        this.multiplierGlow.alpha = 0

        const multiplierLightSprite = new Sprite(assets.multiplierLight);
        multiplierLightSprite.anchor.set(0.5)
        this.multiplierLightSprite = multiplierLightSprite
        
        const rays1Sprite = new Sprite(assets.rays1)
        rays1Sprite.anchor.set(0.5) 
        this.rays1Sprite = rays1Sprite
        this.rays1Sprite.blendMode = BLEND_MODES.ADD;
        
        const rays2Sprite = new Sprite(assets.rays1);
        rays2Sprite.anchor.set(0.5) 
        this.rays2Sprite = rays2Sprite
        this.rays2Sprite.blendMode = BLEND_MODES.ADD;
       
        this.multiplierGlow.alpha = 0
        this.multiplierGlow.addChild(this.rays1Sprite);
        this.multiplierGlow.addChild(this.rays2Sprite); 
        this.multiplierGlow.addChild(this.multiplierLightSprite); 
 
        const multiplierContainer = new Container();
        
        multiplierContainer.addChild(multiplierGlow); 
        this.plateContainer.addChild(multiplierContainer);
        this.multiplierContainer = multiplierContainer
    }

    presentIntro(){
        this.timelineIntro
            .deleteAllAnimations()
            .addAnimation({
                delay:500,
                duration: 1500,
                easing: "easeOutBounce",
                onProgress: progress => {
                    this.plateContainer.y = -300 + 300 * progress
                }
            })        
            .play()
    }


    presentShift({
        multiplier = 1,
        progress = 1,
        isIncrementing = true
    }) {
        const {textField1024} = this
        const regress = 1 - progress
        const width = 1200;
        const halfWidth = width * 0.5;
        const targetProgress = 1 - progress * 0.2;
        let leftmostMultiplier = multiplier;
        let leftmostMultiplierCopy = multiplier;
    
        for (let i = 0; i < 3; i++) {
            leftmostMultiplier /= 2;
            if (leftmostMultiplier < 1) leftmostMultiplier = 1024;
        }
    
        let offsettingTextField;
        let rightmostMultiplier = 1;
        let textField1024TargetView

        this.textFields.forEach((view, i) => {
            const shiftedProgress = (targetProgress + i * 0.2 + 0.1) % 1;
            view.x = width * (shiftedProgress - 0.5)
            view.y = 100 * Math.sin(Math.PI * shiftedProgress);
            view.rotation = 0.35 * Math.cos(Math.PI * shiftedProgress)
            view.alpha = 0.5;
            view.visible = true
            
            view.setText('x' + leftmostMultiplier);

            if (i < 3 && view.x > 0) offsettingTextField = view;
            if (i >= 3 && view.x > 0) rightmostMultiplier = leftmostMultiplier;
            leftmostMultiplier *= 2;
            if (leftmostMultiplier > 1024) leftmostMultiplier = 1;
        })
    
        offsettingTextField?.setText('x' + (rightmostMultiplier * 2));


        this.textFields.forEach(view => {
            const {text} = view

            if(text === 'x1024') {
                textField1024TargetView = view
            }

            if(text === 'x2048') {
                view.setText('x1')
            }
        })
    
        const currentView = this.textFields[2];
        const targetView = this.textFields[3];

        currentView.scale.set(2  - progress)
        currentView.alpha = 1 - 0.5 * progress
        targetView.scale.set(1 + progress)
        targetView.alpha =  0.5 + 0.5 * progress
        textField1024.visible = false

        if (textField1024TargetView) {
            textField1024.x = textField1024TargetView.x
            textField1024.y = textField1024TargetView.y
            textField1024.scale.set(textField1024TargetView.scale.x * 1.1)
            textField1024.rotation = textField1024TargetView.rotation
            textField1024.visible = true
            textField1024TargetView.visible = false
        }
        
        /*
        const regress = 1 - progress;
        for (let i = 0; i < this.textFields.length; i++) {
            const shiftedProgress = (targetProgress + i * 0.2 + 0.1) % 1;
            this.textFields[i].y = Math.sin(shiftedProgress * Math.PI) * 80;
            this.textFields[i].rotation = 0.3 - 0.6 * shiftedProgress;
            this.textFields[i].alpha = (i === 3) ? 1 : 0.6; // Установка альфа-канала для всех кроме 3 (потом другой шрифт?)
        }
    
        this.textFields[3].scale.set(1 + 1.1 * progress);
        this.textFields[2].rotation = 0.2  * progress;
        
*/


/*
        for (let i = 0; i < 3; i++) {
            leftmostMultiplierCopy /= 2;
            if (leftmostMultiplierCopy < 1) leftmostMultiplierCopy = 1024;
        }
        
        this.textFieldsCopy.forEach((view, i) => {
            
            view.setText('x' + leftmostMultiplierCopy);
            if (i < 3 && view.wrapper.x > 0) offsettingTextField = view;
            if (i >= 3 && view.wrapper.x > 0) rightmostMultiplier = leftmostMultiplierCopy;
            leftmostMultiplierCopy *= 2;
            if (leftmostMultiplierCopy > 1024) leftmostMultiplierCopy = 1;
        });

        for (let i = 0; i < this.textFieldsCopy.length; i++) {
            const shiftedProgress = (targetProgress + i * 0.2 + 0.1) % 1;
            this.textFieldsCopy[i].y = Math.sin(shiftedProgress * Math.PI) * 80;
        }
        this.textFieldsCopy[3].scale.set(1 + 1.1 * progress);

        */
    }
    

    presentTransition({
        initialMultiplier = 1,
        multiplier = 8,
        progress = 0
    }) {
        let stepsCount = 0

        const isMultiplierIncreasing = initialMultiplier < multiplier
        const startMultiplier = isMultiplierIncreasing
            ? initialMultiplier
            : multiplier
        
        const targetMultiplier = isMultiplierIncreasing
            ? multiplier
            : initialMultiplier

        let currentMultiplier = startMultiplier

        while(currentMultiplier < targetMultiplier) {
            currentMultiplier *= 2
            stepsCount++
        }

        if (!isMultiplierIncreasing) progress = 1 - progress

        const finalProgress = (stepsCount * progress) % 1
        const stepIndex = Math.trunc(stepsCount * progress)

        let finalMultiplier = startMultiplier

        for (let i = 0; i < stepIndex + 1; i++) {
            finalMultiplier *= 2
        }
        
        this.presentShift({
            progress: finalProgress,
            multiplier: finalMultiplier,
            isIncrementing: false,
        

        })
     

    }

    presentOutro({
        minimalMultiplier = 1,
        multiplier = 4,
        progress = 0
    }) {
        
        let stepsCount = 0

        let currentMultiplier = minimalMultiplier
        while(currentMultiplier < multiplier) {
            currentMultiplier *= 2
            stepsCount++
        }



        const finalProgress = 1 - ((stepsCount * progress) % 1)
        const stepIndex = Math.trunc(stepsCount * progress)

        let finalMultiplier = multiplier
        for(let i = 0; i < stepIndex; i++) {
            finalMultiplier /= 2
        }

        
        this.presentShift({
            progress: finalProgress,
            multiplier: finalMultiplier,
            isIncrementing: false,
        })
        this.resetMultiplierGlow()
    }

    presentMultiplier({
        multiplier = 2,
        progress = 1
    }) {
        this.presentShift({
            multiplier,
            progress: 1,
        })
    }

    presentFSMultiplier(){
		this.timelineFSMultiplier
            .deleteAllAnimations()
            .addAnimation({
                delay:200,
                duration: 1200,
                
                onProgress: progress => {
        
                    const startY = 0; 
                    const endY = 700; 
                    
                    if (progress < 0.2) {
                        this.plateContainer.y = startY + (endY - startY) * Math.sin(progress * Math.PI / 2 / 0.2);     
                    } else if (progress < 0.8) {
                        this.plateContainer.y = endY;
                    } else {
                        this.plateContainer.y = endY - (endY - startY) * Math.sin((progress - 0.8) * Math.PI / 2 / 0.2);      
                    }
                    
                }
            })        
            .play()
    }
 
    resetMultiplierGlow() {
        this.multiplierGlow.alpha = 0
        this.multiplierContainer.y = 0
    }

    presentMultiplierTransition() {
        const {flyableMultiplierView} = this

        this.flyableMultiplierView.setText(this.textFields[3].text)

        this.timelineMultiplierTransition
            .deleteAllAnimations()   
            .addAnimation({
                duration: 500,
                onProgress: progress => {
                    this.multiplierContainer.alpha = 1 * progress;
                    this.multiplierGlow.alpha= 1 * progress
                    this.multiplierGlow.scale.set(1.2 )
                    flyableMultiplierView.scale.set(2)
                }
            })        
            .addAnimation({
                duration: 2000,
                onProgress: progress => {
                    const sinProgress = Math.sin(progress * Math.PI / 2);
                    this.rays1Sprite.rotation = 180 * (Math.PI / 180) * sinProgress; 
                    this.rays2Sprite.rotation = -180 * (Math.PI / 180) * sinProgress;
                }
            })
            .addAnimation({
                delay: 500,    
                duration: 1500,
                    onProgress: progress => {
                        const regress = 1 - progress
                        if (progress < 0.2) {
                            this.multiplierContainer.y = 700 * (progress * 5);  
                        } else if (progress < 0.8) {
                            this.multiplierContainer.y = 700; 
                        } else {
                            this.multiplierContainer.y = 700 + 1400 * ((progress - 0.8) * 2.5); 
                        }
                        const scaleFactor = 2 + 2.8 * Math.sin(progress * Math.PI);
                        flyableMultiplierView.scale.set(scaleFactor);
                        this.multiplierGlow.scale.set(0.7*scaleFactor);
                        
                }
            })
            .addAnimation({
                delay: 1800,    
                duration: 200,
                    onProgress: progress => {
                        const regress = 1 - progress
                        this.multiplierContainer.alpha = 1 * regress;
                        this.multiplierGlow.alpha = 1 * progress
                    }
            })
            .play()
        this.resetMultiplierGlow()
    }
    
    setTimeScale(scale) {
        this.timelineIntro.setTimeScaleFactor({name: 'scale', value: scale})
		this.timelineFSMultiplier.setTimeScaleFactor({name: 'scale', value: scale})
		this.timelineMultiplierTransition.setTimeScaleFactor({name: 'scale', value: scale})
    }
}
