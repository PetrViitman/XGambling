import { Sprite } from "pixi.js";
import { ButtonView } from "./ButtonView";
import { TextField } from "../../text/TextField";
import { Timeline } from "../../../timeline/Timeline";


export class ButtonAudioView extends ButtonView {
    isAudioReadyToPlay = false
    isMuted = true
    
    constructor(assets, audio) {
        super(assets, audio)

        this.setMuted(this.audio.isMuted)
        audio.onCookieMuteStateRecovered = (isMuted) => {
            this.setMuted(isMuted)
        }
     //   this.presentSpinsCount(0)
    }

    initIcon(assets) {
        this.iconsViews = [
            'Unmute',
            'Loading',
            'Mute',
        ].map(name => {
            const sprite = new Sprite(assets['iconAudio' + name])
            sprite.anchor.set(0.5)
            sprite.scale.set(1.15)
            this.iconView = sprite
            this.iconView.visible = false
            return this.iconContainer.addChild(sprite)
        })

        this.iconUnmutedView = this.iconsViews[0]
        this.iconLoadingView = this.iconsViews[1]
        this.iconMutedView = this.iconsViews[2]
    }

    setMuted(isMuted = true) {
        this.iconView.visible = false

        if (isMuted) {
            this.iconView = this.iconMutedView
        } else {
            this.iconView = this.isAudioReadyToPlay
                ? this.iconUnmutedView
                : this.iconLoadingView
        }

        this.iconView.visible = true
        this.isMuted = isMuted
    }

    onAudioReady() {
        this.isAudioReadyToPlay = true
        this.setMuted(this.isMuted) 
    }
    
}