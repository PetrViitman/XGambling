import { Container, Graphics, Sprite } from "pixi.js";
import { Timeline } from "../../timeline/Timeline";
import { TextField } from "../text/TextField";
import { colorToColor } from "../GraphicalPrimitives";

export class FreeSpinsIndicatorView extends Container {
    textFields
    timeline = new Timeline
    spinsCount = 0

    constructor(assets) {
        super()

        this.initTextPanel (assets)
        this.initTextFields(assets)
        this.initText (assets)
        this.presentShift({
            targetNumber: 0,
            progress: 1,
        })
    }

    initTextPanel (assets) {

        this.freeSpinPanel = this.addChild(new Graphics())
        this.freeSpinPanel.pivot.set(this.freeSpinPanel.width/2, this.freeSpinPanel.height/2)
        this.freeSpinPanel
            //.clear()
            .beginFill(0x1e100c, 0.75)
            .drawRect(0, 0, 1290, 273)
            .endFill()
            this.freeSpinPanel.position.set(80, 1400)
    }

    initTextFields(assets) {
        const width = 200;
        const height = 149;
    
        this.textFields = [0, 0].map(_ => {
            const textField = new TextField({
                maximalWidth: width,
                maximalHeight: height
            })
                .setFontName(
                    '0123456789',
                    [
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
                    ])
                .setText('1')
                .setFontSize(height)
                .setLetterSpacing(5)
                .setAlignMiddle()
                .setAlignCenter();
    
            textField.pivot.set(width / 2, height / 2);
            textField.position.set(1100, 1530);
            
            return this.addChild(textField);
        });

    }
    

    initText (assets) {
        this.textContainer = this.addChild(new Container());
		this.textContainer.position.set(1000,900);
		this.remainingFreeSpin = new Sprite(assets.remaining_free_spin);
		this.lastFreeSpin = new Sprite(assets.last_free_spin);

        this.remainingFreeSpin.position.set(-800,500);
        this.lastFreeSpin.position.set(-770,600);
        this.textContainer.addChild(this.remainingFreeSpin);
        this.textContainer.addChild(this.lastFreeSpin);

        this.remainingFreeSpin.visible = false;
		this.lastFreeSpin.visible = false;
    }

    
    presentShift({
        targetNumber = 1,
        progress = 1,
    }) {
        const targetProgress = 1 - progress * 0.5
        
        //const distance = 133
        const {textFields} = this
        textFields[1].setText(
            '' + (targetNumber - 1)
        )

        textFields[0].setText(
            '' + targetNumber
        )

        textFields.forEach((view, i) => {
            const shiftedProgress = (targetProgress +  i * 0.5) % 1
            const angle = Math.PI * (shiftedProgress - 0.5)
            const sin = Math.sin(angle)
            const cos = Math.abs(Math.cos(angle))
            //view.x = distance * sin
            view.scale.x = cos
            view.visible = view.scale.x > 0.005
        })
    }

    presentRemainingSpinsCount(targetSpinsCount = 0) {
       
        const currentSpinsCount = this.spinsCount;
    
        if (currentSpinsCount > 1) {
            this.remainingFreeSpin.visible = true;
            this.lastFreeSpin.visible = false;
            this.textFields.forEach(textField => {
                textField.alpha = 1;
            });
        } else if (currentSpinsCount === 1) {
            this.remainingFreeSpin.visible = false;
            this.lastFreeSpin.visible = true;
            this.textFields.forEach(textField => {
                textField.alpha = 0;
            });
        }
    
   
        if (currentSpinsCount === targetSpinsCount) return;
    
        const spinsCountDelta = targetSpinsCount - currentSpinsCount;
        const stepsCount = Math.abs(spinsCountDelta);
        this.spinsCount = targetSpinsCount;
    
        return this
            .timeline
            .deleteAllAnimations()
            .addAnimation({
                duration: Math.min(1000, 350 * stepsCount),
                onProgress: progress => {

                    const totalProgress = Math.max(0, progress * stepsCount - (spinsCountDelta < 0 ? 0.0001 : 0));
                    const subProgress = totalProgress % 1;
                    const finalSpinsCount = Math.trunc((currentSpinsCount + 1) + spinsCountDelta * progress);
                    this.presentShift({
                        targetNumber: finalSpinsCount,
                        progress: spinsCountDelta > 0 ? subProgress : (1 - subProgress),
                    });
                }
            })
            .play();        
    }

    setTimeScale(scale) {
		this.timeline.setTimeScaleFactor({name: 'scale', value: scale})
	}
}