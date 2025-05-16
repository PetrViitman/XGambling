import { Spine } from '@pixi-spine/runtime-4.1';

import { brightnessToHexColor } from './GraphicalPrimitives';

export class SpineView extends Spine {
    timeScale = 1;
    animationsNames = [];
    currentAnimationName;
    isLoopMode;
    entry;

    constructor(spineData) {
        super(spineData);

        spineData.animations.forEach(({ name }) => {
            this.animationsNames.push(name);
        });
    }

    setDefaultAnimationsMix(duration = 250) {
        this.state.data.defaultMix = duration / 1000;

        return this;
    }

    mixAnimations({
        animationName1,
        animationName2,
        duration = 250
    }) {
        if (!this.animationsNames.includes(animationName1)
            || !this.animationsNames.includes(animationName2))
            return this;

        this.stateData.setMix(
            animationName1,
            animationName2,
            duration / 1000
        );

        return this;
    }

    async playAnimation({
        name,
        isLoopMode = false
    }) {
        const { state } = this;

        if (!this.animationsNames.includes(name)) return;

        if (this.currentAnimationName === name && this.isLoopMode) return;

        this.currentAnimationName = name;
        this.isLoopMode = isLoopMode;
        this.entry = state.setAnimation(0, name, isLoopMode);

        state.clearListeners();

        return new Promise(resolve => {
            state.addListener({ complete: resolve });
        });
    }

    setTimeScale({
        timeScale = this.timeScale,
        ignoreInversion = false
    }) {
        this.timeScale = timeScale;
        let finalTimeScale = timeScale;

        let inversionMultiplier = this.state.timeScale < 0 ? -1 : 1;
        if (!ignoreInversion)
            inversionMultiplier = 1;

        finalTimeScale *= inversionMultiplier;
        this.state.timeScale = finalTimeScale;
    }

    wind(progress) {
        const { entry } = this;

        if (!entry) return this;

        const targetFrame = entry.animationEnd * progress;

        entry.trackTime = targetFrame;
        this.previousFrameProgress = progress;
        this.update(targetFrame);
    }

    setBrightness(brightness) {
        this.brightness = Math.min(1, Math.max(0.25, brightness))
       
        this.tint = brightnessToHexColor(this.brightness)
        
    }

}
