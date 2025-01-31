import { Sprite } from "pixi.js";
import { AdaptiveContainer } from "../../mobile/views/adaptiveDesign/AdaptiveContainer";
import { SpineView } from "../../mobile/views/SpineView";
import { Timeline } from "../../mobile/timeline/Timeline";

export class DesktopBackgroundView extends AdaptiveContainer {
    constructor(assets) {
        super()

        this.initStaticBackground(assets)
        this.initSpines(assets)

        this.setTargetArea({x: 0, y: 0, width: 1, height: 1})
            .setSourceArea({width: 1927, height: 900})

    }

    initStaticBackground(assets) {
        const sprite = new Sprite(assets.background_desktop)
        sprite.pivot.set(316, 145)
        this.addChild(sprite)
    }

    initSpines(assets) {
        const x = 965
        const y = 450

        // KING...
        const kingView = this.addChild(new SpineView(assets.king.spineData))
        kingView.playAnimation({name: 'idle', isLoopMode: true})
        kingView.position.set(x, y)
        // ...KING

        // WINDOWS & FIRES...
        const windowsView = this.addChild(new SpineView(assets.bg_fx.spineData))
        windowsView.playAnimation({name: 'idle', isLoopMode: true})
		windowsView.position.set(x, y)
        // ...WINDOWS & FIRES

        // THIEF...
        const thiefView = this.addChild(new SpineView(assets.thief.spineData))
		thiefView.position.set(x, y)
        // ...THIEF

        // MOUSE...
        const mouseView = this.addChild(new SpineView(assets.mouse_and_traps.spineData))
		mouseView.position.set(x, y)
        // ...MOUSE


        // ANIMATION...
        new Timeline()
            .addAnimation({
                duration: 24000,
                callbacks: {
                    1: () => {
                        thiefView.playAnimation({name: 'act'});
                        kingView.playAnimation({name: 'act'});
                    },
                    6000: () => {
                        kingView.playAnimation({name: 'idle', isLoopMode: true});
                    },
                    12000: () => {
                        thiefView.playAnimation({name: 'act_2'});
                    },
                },
            })
            .setLoopMode()
            .play();

        new Timeline()
            .addAnimation({
                duration: 20000,
                callbacks: {
                    20000: () => {
                        mouseView.playAnimation({name: 'idle'});
                    },
                },
            })
            .setLoopMode()
            .play();
        // ...ANIMATION
    }

}