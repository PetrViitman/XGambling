import {Container} from 'pixi.js'
import {CollapseView} from './CollapseView'
import {PayoutView} from './PayoutView'
import { CELL_HEIGHT, CELL_WIDTH, WILD_SYMBOL_ID } from '../../../Constants'

export class CollapsesPoolView extends Container {
    framesContainer

    framesPoolsViews = new Array(8).fill(0).map((_) => [])
    
    payoutsContainer

    payoutsViews = []

    assets

    overlayView

    constructor(assets, overlayView) {
        super()

        this.assets = assets
        this.overlayView = overlayView
        this.framesContainer = this.addChild(new Container())
        this.payoutsContainer = this.addChild(new Container())
    }

    getFramesPool(symbolId, index) {
        const {
            framesContainer,
            framesPoolsViews,
            assets,
        } = this

        if (!framesPoolsViews[symbolId][index]) {
            const textures = new Array(27).fill(0).map((_, i) => {
                return assets['symbol_' + (symbolId - 1) + '_' + i]
            })

            const view = new CollapseView(textures)

            framesPoolsViews[symbolId][index] = framesContainer.addChild(view)
        }

        return framesPoolsViews[symbolId][index]
    }

    getPayout(index) {
        const {
            payoutsContainer,
            payoutsViews,
            assets,
        } = this

        if (!payoutsViews[index]) {
            const view = new PayoutView(assets)
            payoutsViews[index] = payoutsContainer.addChild(view)
        }

        return payoutsViews[index]
    }

    present(
        descriptors,
        progress = 0.5,
        reels = [],
        cellWidth = CELL_WIDTH,
        cellHeight = CELL_HEIGHT,
    ) {
        const counts = new Array(8).fill(0)

        // this.overlayView.alpha = Math.sin(Math.PI * progress) * 0.6
        
        descriptors.forEach(({
            coordinates,
            payout,
            payoutX,
            payoutY,
            payoutWidth,
            payoutHeight,
        }, i) => {
            coordinates.forEach(([x, y]) => {
                const finalSymbolId = reels[x][y]
                counts[finalSymbolId]++
                const view = this.getFramesPool(finalSymbolId, counts[finalSymbolId])
                view.position.set(x * cellWidth, y * cellHeight)
                view.present(progress)
            })

            const payoutView = this.getPayout(i)

            payoutView.position.set(
                cellWidth * (payoutX - 0.5),
                cellHeight * (payoutY - 0.5),
            )

            payoutView.presentPayout({
                width: payoutWidth * cellWidth,
                height: payoutHeight * cellHeight,
                payout,
                progress: Math.max(0, (progress - 0.25) / 0.75),
            })
        })
    }
}
