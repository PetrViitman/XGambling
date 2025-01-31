import { Sprite } from "pixi.js"
import { CoinView } from "../../coins/CoinView"
import { BookOfXView } from "./BookOfXView"

const POSITIONS = [
    {x: 90, y: 0},
    {x: 50, y: 0},
    {x: 65, y: 0},
    {x: 100, y: 0},
    {x: 80, y: 0},
    {x: 85, y: 0},
    {x: 10, y: 0},
    {x: 70, y: 0},
    {x: 40, y: 0},
]


export class BookOfCoinsView extends BookOfXView {
    coinsFlashView
    coinsViews

    constructor(resources) {
        super(resources)

        this.initCoins({resources})
    }

    initCoins({
        resources,
        texture_prefix = 'coin_',
        glowColor = 0xFF9900
    }) {
        const { contentContainer } = this

        this.coinsFlashView = new Sprite(resources.book_flash)
        this.coinsFlashView.scale.set(2)
        this.coinsFlashView.position.set(-10, -350)
        this.coinsFlashView.tint = glowColor
        contentContainer.addChild(this.coinsFlashView)

		this.coinsViews = POSITIONS.map(_ => {
			const view = new CoinView({
				textureFace: resources[texture_prefix + 'face'],
				textureRib: resources[texture_prefix + 'rib'],
				textureStretch: resources[texture_prefix + 'stretch'],
                glowColor
			})
			contentContainer.addChild(view)
			return view
		})
    }

    presentScrolling({progress = 0}) {
        super.presentScrolling({progress})

        const {coinsViews, coinsFlashView} = this

        coinsFlashView.skew.y = -0.5 * progress
        coinsFlashView.alpha = Math.sin(Math.PI * Math.min(1, progress * 3))


        this.flamesContainer.rotation = -this.contentContainer.rotation
		const progressShiftStep = 0.065

		coinsViews.forEach((view, i) => {
			const shiftedProgress = Math.min(1, (progress + progressShiftStep * i))

            view.flip((0.25 + shiftedProgress ) % 1)
            view.spin(shiftedProgress * 6.5)
            view.x = POSITIONS[i].x + 50
            view.y = POSITIONS[i].y + 500 * shiftedProgress ** 2 - 200

            if(shiftedProgress > 0.9) {
                view.alpha = 1 - (shiftedProgress - 0.9) / 0.1
            } else {
                view.alpha = 1
            }
		})
    }
}