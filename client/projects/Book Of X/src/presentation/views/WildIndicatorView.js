import { Container } from "pixi.js";
import { Symbol10View } from "./reels/cell/symbols/Symbol10View";
import { SymbolQView } from "./reels/cell/symbols/SymbolQView";
import { SymbolJView } from "./reels/cell/symbols/SymbolJView";
import { SymbolKView } from "./reels/cell/symbols/SymbolKView";
import { SymbolAView } from "./reels/cell/symbols/SymbolAView";
import { SymbolScarabView } from "./reels/cell/symbols/SymbolScarabView";
import { SymbolEyeView } from "./reels/cell/symbols/SymbolEyeView";
import { SymbolPharaohView } from "./reels/cell/symbols/SymbolPharaohView";
import { SymbolAnkhView } from "./reels/cell/symbols/SymbolAnkhView";
import { AdaptiveContainer } from "./adaptiveDesign/AdaptiveContainer";
import { Timeline } from "../timeline/Timeline";

export class WildIndicatorView extends AdaptiveContainer {
    symbolsContainer
    symbolsViews
    symbolView
    isMobileDevice

    idleTimeline = new Timeline
    timeline = new Timeline

    constructor(resources, isMobileDevice) {
        super()
        this.isMobileDevice = isMobileDevice

        this.initSymbols(resources)
        this.initIdleTimeline()

        this.setSourceArea({width: 256, height: 256})
            .stickRight()
    }

    initSymbols(resources) {
        this.symbolsContainer = this.addChild(new Container)

        this.symbolsViews = [
            new Symbol10View(resources),
            new SymbolQView(resources),
            new SymbolJView(resources),
            new SymbolAView(resources),
            new SymbolKView(resources),
            new SymbolScarabView(resources),
            new SymbolEyeView(resources),
            new SymbolPharaohView(resources),
            new SymbolAnkhView(resources),
        ]

        this.symbolsViews.forEach(view => {
            this.symbolsContainer.addChild(view)
            view.visible = false
        })

        this.symbolsContainer.position.set(100, 100)
    }

    initIdleTimeline() {
        this.idleTimeline
            .addAnimation({
                duration: 5000,
                onProgress: progress => {
                    const { symbolView } = this

                    if (!symbolView) return

                    symbolView.update(progress)

                }
            })
            .addAnimation({
                delay: 2000,
                duration: 1000,
                onProgress: progress => {
                    const { symbolView } = this

                    if (!symbolView) return

                    const subProgress = Math.abs(Math.sin(Math.PI * 3 * progress)) * (1 - progress)
                    symbolView.presentationFlipProgress = 0.2 * subProgress
                }
            })
            .setLoopMode()
    }

    updateTargetArea(sidesRatio) {
        const {
            symbolsContainer,
            isMobileDevice
        } = this



        if (sidesRatio > 1.25 && !isMobileDevice) {
			// DESKTOP LANDSCAPE...
            this.setTargetArea({x: 0.5, y: 0.5, width: 0.5, height: 0.4})
                .stickBottom()
            symbolsContainer.position.set(200, 225)
            symbolsContainer.scale.set(0.75)
            symbolsContainer.rotation = -0.6
			// ...DESKTOP LANDSCAPE
		} else if (sidesRatio > 1.25 && isMobileDevice) {
			// MOBILE LANDSCAPE...
			const panelHeight = isMobileDevice ? 0.2 : 0.1

			// ...MOBILE LANDSCAPE
		} else if (sidesRatio > 0.8) {
			// WIDE PORTRAIT...
            this.setTargetArea({x: 0, y: 0.1, width: 1, height:  0.775})
                .stickTop()
            symbolsContainer.position.set(225, 240)
            symbolsContainer.rotation = -0.75
            symbolsContainer.scale.set(0.5)
			// ...WIDE PORTRAIT
		} else {
            // NARROW PORTRAIT...
            const hatHeight = Math.min(0.45, 0.15 / sidesRatio)
            symbolsContainer.position.set(235, 200)
            symbolsContainer.rotation = -0.75
            symbolsContainer.scale.set(0.5)
            this.setTargetArea({x: 0, y: hatHeight, width: 1, height: 1})
                .stickTop()

			//this.setTargetArea({x: 0, y: hatHeight, width: 1, height: 1})
			// ...NARROW PORTRAIT
        }
    }

    presentSymbol(symbolId) {
        const symbolView = this.symbolsViews[symbolId]
        const { idleTimeline, timeline } = this

        if(!symbolView) {
            const {symbolView} = this
            if(!symbolView) return

            timeline
                .deleteAllAnimations()
                .addAnimation({
                    duration: 300,
                    onProgress: progress => {
                        const subProgress = progress ** 2
                        symbolView.y = 150 * subProgress
                        symbolView.alpha = 1 - subProgress
                    },
                    onFinish: () => {
                        symbolView.visible = false
                        idleTimeline.pause()
                    }
                })
                .windToTime(1)
                .play()


            return
        }

        this.symbolView = symbolView
        symbolView.visible = true
        idleTimeline.wind(0).play()

        timeline.deleteAllAnimations()
                .addAnimation({
                    duration: 300,
                    onProgress: progress => {
                        const subProgress = progress ** 2
                        symbolView.y = 150 * (1 - subProgress)
                        symbolView.alpha = subProgress
                    }
                })
                .windToTime(1)
                .play()
    }
}