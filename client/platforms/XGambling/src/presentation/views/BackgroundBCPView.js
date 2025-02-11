import { Timeline } from "../timeline/Timeline";
import { CoinView } from "./3DViews/CoinView";
import { AdaptiveContainer } from "./adaptiveDesign/AdaptiveContainer";


const COINS = new Array(0).fill(0).map(_ => {
    const startX = Math.random() * 1000
    const startY = Math.random() * 1000

    const angle = Math.atan2(startY - 500, startX - 500)
    const distanceFactor = Math.hypot(startX - 500, startY - 500) / 500

    const distance = distanceFactor * 500

    const FinalX = startX + distance * Math.cos(angle)
    const FinalY = startY + distance * Math.sin(angle)

    const deltaX = FinalX - startX
    const deltaY = FinalY - startY
    
    return {
        startX,
        startY,
        deltaX,
        deltaY 
    }
})

export class BackgroundBCPView extends AdaptiveContainer {
    coinsViews = []
    
    constructor(assets) {
        super()


        this.initCoins(assets)

        this.setSourceArea({width: 1000, height: 1000})
            .setTargetArea({x: 0, y: 0, width: 1, height: 1})
            .stretchHorizontally()
            .stretchVertically()

        
        new Timeline()
            .addAnimation({
                duration: 5000,
                onProgress: progress => {
                    this.setProgress(progress)
                }
            })
            .setLoopMode()
            .play()
    }


    initCoins(assets) {
        this.coinsViews = COINS.map( _ => {
            const view = new CoinView(assets)
            this.addChild(view)
            this.coinsViews.push(view)

            return view
        })
    }

    onAdjustedToTargetArea() {
        const scaleFactorX = AdaptiveContainer.width / 1000
        const scaleFactorY = AdaptiveContainer.height / 1000
        const zoomFactor = Math.min(
            AdaptiveContainer.width,
            AdaptiveContainer.height
        ) / Math.min(
            this.sourceArea.width,
            this.sourceArea.height
        )

        this.coinsViews.forEach(view => {
            view.scale.set(
                0.5 / scaleFactorX * zoomFactor,
                0.5 / scaleFactorY * zoomFactor
            )
        })

    }


    setProgress(progress) {
        COINS.forEach(({startX, startY, deltaX, deltaY}, i) => {         
            const shiftedProgress = (progress + i * 0.375) % 1
            
            const view = this.coinsViews[i]

            view.x = startX + deltaX * shiftedProgress
            view.y = startY + deltaY * shiftedProgress

            view.setFlip(shiftedProgress)
            view.setSpin(shiftedProgress)

            view.alpha = Math.min(1, 2* Math.sin(Math.PI * shiftedProgress))

            view.contentContainer.scale.set(0.25 + 0.75 * shiftedProgress)
        }) 
    }
}