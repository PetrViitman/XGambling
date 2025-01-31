import { Container } from "pixi.js";
import { BookOfXView } from "./BookOfXView";
import { Symbol10View } from "../../reels/cell/symbols/Symbol10View";
import { SymbolQView } from "../../reels/cell/symbols/SymbolQView";
import { SymbolJView } from "../../reels/cell/symbols/SymbolJView";
import { SymbolKView } from "../../reels/cell/symbols/SymbolKView";
import { SymbolAView } from "../../reels/cell/symbols/SymbolAView";
import { SymbolScarabView } from "../../reels/cell/symbols/SymbolScarabView";
import { SymbolEyeView } from "../../reels/cell/symbols/SymbolEyeView";
import { SymbolPharaohView } from "../../reels/cell/symbols/SymbolPharaohView";
import { SymbolAnkhView } from "../../reels/cell/symbols/SymbolAnkhView";

export class BookOfSymbolsView extends BookOfXView {
    symbolsViews
    targetSymbolId
    symbolsScaleFactor = 1
    currentSymbolView
    nextSymbolView

    constructor(resources) {
        super(resources)

        this.initSymbols(resources)
        this.presentScrolling({})
    }

    initSymbols(resources) {
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
            this.contentContainer.addChild(view)
        })
    }

    presentFloating(progress) {
        super.presentFloating(progress)
        const symbolsIdleProgress = progress * 3 % 1

        this.currentSymbolView?.update(symbolsIdleProgress)
        this.nextSymbolView?.update(symbolsIdleProgress)
    }

    presentScrolling({
        progress = 0,
        currentSymbolId = -1,
        nextSymbolId = -1,
    }) {
        super.presentScrolling({progress})

        const {symbolsViews, symbolsScaleFactor} = this

        symbolsViews.forEach(view => view.visible = false)
        const currentSymbolView = symbolsViews[currentSymbolId]
        const nextSymbolView = symbolsViews[nextSymbolId]

        if (currentSymbolView) {
            currentSymbolView.visible = true
            currentSymbolView.zIndex = progress < 0.5 ? 2 : 0
            currentSymbolView.x = -175 * progress
            currentSymbolView.y = -150 + 100 * progress
            currentSymbolView.scale.set(1.25 - 0.25 * progress)
            currentSymbolView.setBrightness(1 - progress)
            currentSymbolView.scale.set(symbolsScaleFactor)
            currentSymbolView.presentationFlipProgress = 0.5 - progress * 0.5
        }

        if (nextSymbolView) {
            nextSymbolView.visible = true
            nextSymbolView.zIndex = progress > 0.5 ? 2 : 0
            nextSymbolView.alpha = Math.min(1, progress * 3)
            nextSymbolView.x = 175 * (1 - progress)
            nextSymbolView.y = -50 - 100 * progress
            nextSymbolView.scale.set(1 + 0.25 * progress)
            nextSymbolView.setBrightness(1)
            nextSymbolView.scale.set(symbolsScaleFactor)
            nextSymbolView.presentationFlipProgress = 0.5 - progress * 0.5
        }

        this.currentSymbolView = currentSymbolView
        this.nextSymbolView = nextSymbolView
    }

    presentWin(progress) {
        const {
            currentSymbolView,
            nextSymbolView
        } = this

        const symbolView = currentSymbolView ?? nextSymbolView

        if (!symbolView) return

        symbolView.presentBookWin(progress)
        symbolView.scale.set(this.symbolsScaleFactor + 0.5 * progress)
        symbolView.y = -150 -75 * progress
    }
}