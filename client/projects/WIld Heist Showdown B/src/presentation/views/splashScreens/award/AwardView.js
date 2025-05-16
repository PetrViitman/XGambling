import { Container, Sprite } from "pixi.js";
import { SpineView } from "../../SpineView";


export class AwardView extends Container {
    contentContainer
    popupsViews
    audio
    progress
   
    constructor({assets, audio}) {
        super()
        this.audio = audio
        this.initContainers()
        this.initPopups(assets)


    }
    
    initContainers() {
        this.contentContainer = this.addChild(new Container)
        this.popupsContainer = this
            .contentContainer
            .addChild(new Container)
        this.popupsContainer = this
        .contentContainer
        .addChild(new Container)
        this.popupsContainer.y = 0
        this.popupsContainer.scale.set(1)

    }



    initPopups(assets) {
        this.popupsMap = {}
        this.popupsViews = [
            'big',
            'huge',
            'mega',
            'bonus',
            'total',
        ].map((name) => {
            const sprite = new Sprite(assets['popup' + name])
            sprite.anchor.set(0.5, 0.5)
            this.popupsMap[name] = sprite
            return this.popupsContainer.addChild(sprite)
        })

        if (this.popupsMap['huge']) {
            this.popupsMap['huge'].position.y -= 10
        }
        if (this.popupsMap['mega']) {
            this.popupsMap['mega'].position.y -= 180
        }

    }

    setIdleProgress(progress) {
        const popupsContainer = this.popupsContainer
    }

    presentTransition(progress) {
        const subProgress = Math.sin(Math.PI * progress)
        this.contentContainer.scale.set(1 + 0.25 * subProgress)
        this.popupsContainer.alpha = progress
           
    }

    presentFSTransition(progress) {
        this.popupsContainer.alpha = progress
           
    }

    setSkin(name) {
        
        this.presentTransition(1);
        this.popupsViews.forEach(view => view.visible = false);
        this.popupsMap[name].visible = true;
        
    }


}