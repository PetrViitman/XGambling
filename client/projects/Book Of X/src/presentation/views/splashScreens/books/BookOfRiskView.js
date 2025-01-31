import { CoinView } from "../../coins/CoinView";
import { SubstitutionEffectView } from "../../reels/cell/SubstitutionEffectView";
import { SymbolClubView } from "../../reels/cell/symbols/SymbolClubView";
import { SymbolHeartView } from "../../reels/cell/symbols/SymbolHeartView";
import { BookOfSymbolsView } from "./BookOfSymbolsView";

export class BookOfRiskView extends BookOfSymbolsView {
    effectView
    coinsViews

    
    constructor(resources) {
        super(resources)
        this.initCoins(resources)
        this.initEffect()
    }

    initSymbols(resources) {
        this.symbolsViews = [
            new SymbolHeartView(resources),
            new SymbolClubView(resources),
        ]

        this.symbolsViews.forEach(view => {
            this.contentContainer.addChild(view)
        })

        this.symbolsScaleFactor = 0.75
    }

    initCoins(resources) {
        this.coinsViews = new Array(10).fill(0).map(_ => {
            const view = new CoinView({
				textureFace: resources['coin_face'],
				textureRib: resources['coin_rib'],
				textureStretch: resources['coin_stretch'],
                glowColor: 0xFF9900
			})
            view.alpha = 0
			this.addChild(view)
			return view
        })
    }

    initEffect() {
        const view = new SubstitutionEffectView()
        view.y = -200
        view.scale.set(2.5)
        this.addChild(view)
        this.effectView = view
    }

    presentCoins(progress) {
        this.coinsViews.forEach((view, i) => {
			let shiftedProgress = Math.min(1, progress * (1 + 0.1 * i))

            if (i % 3 === 0) shiftedProgress = Math.min(1, progress * (1 + 0.2 * i))

            view.flip(shiftedProgress)
            view.spin(shiftedProgress * 6.5)
            view.x = i % 2 === 0
                ? -20 * i * shiftedProgress
                : 20 * i * shiftedProgress
            view.y = (400 - (10 * i)) * shiftedProgress ** 2 - 200

            view.alpha = Math.min(1, Math.sin(Math.PI * shiftedProgress) * 3)
		})
    }

    presentWin(progress) {
        const {
            currentSymbolView,
            nextSymbolView
        } = this

        const symbolView = currentSymbolView ?? nextSymbolView

        if (!symbolView) return

        symbolView.presentBookWin(progress)
        symbolView.scale.set(this.symbolsScaleFactor + 0.25 * progress)
        symbolView.y = -150 -75 * progress

        this.effectView.present(progress)

        if (progress > 0.4) {

            const scaleProgress = Math.min(1, (progress - 0.25) / 0.25)
            symbolView.scale.set(1 - scaleProgress)

            const coinsProgress = (progress - 0.4) / 0.6
            this.presentCoins(coinsProgress)
        }
    }

    presentLoose(progress) {
        const subProgress = progress ** 2
        const symbolView = this.currentSymbolView ?? this.nextSymbolView

        symbolView.flameIntensity = 1 - Math.min(1, progress * 3)
        symbolView.y = -150 + 700 * progress ** 2
        symbolView.x = -25 * Math.sin(Math.PI * progress) - 125 * progress
        symbolView.presentationSpinProgress = 1 - subProgress
        symbolView.presentationFlipProgress = 1 - subProgress * 0.5

        symbolView.alpha = 1 - Math.max(0, (subProgress - 0.5) / 0.5)
    }
}