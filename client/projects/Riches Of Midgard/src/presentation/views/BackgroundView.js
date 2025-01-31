import { Sprite } from 'pixi.js'
import { AdaptiveContainer } from '../views/adaptiveDesign/AdaptiveContainer'
import { Timeline } from '../timeline/Timeline'

const TILE_WIDTH = 760

export class BackgroundView extends AdaptiveContainer {
	resources
	tilesCount = 0
	tileViews = []
	tilesContainer
	transitionTimeline = new Timeline
	coinsPoolView
	isFreeSpinsMode
	coinsTimeline = new Timeline
	tileTint = 0xFFFFFF

	constructor(resources) {
		super()
		this.resources = resources
		this.initTilesContainer()
		this.setFreeSpinsMode(false)
	}

	initTilesContainer() {
		this.tilesContainer = this.addChild(new AdaptiveContainer)
		this.tilesContainer
			.setSourceArea({width: 1, height: 759})
			.setTargetArea({
				x: 0,
				y: 0,
				width: 1,
				height: 1,
			})
			.stickTop()
		this.getTileView(0)
	}

	getTileView(index) {
		const {tileViews, tilesContainer} = this

		if (!tileViews[index]) {
			const sprite = new Sprite(this.resources.background_tile)      
			tilesContainer.addChild(sprite).anchor.x = 0.5
			sprite.tint = this.tileTint
			this.tileViews[index] = sprite
		}

		return tileViews[index]
	}


	onAdjustedToTargetArea() {
		const { tileViews, tilesContainer} = this
		const finalTileWidth = TILE_WIDTH * tilesContainer.scale.x
		const remainingSpace = (AdaptiveContainer.width - finalTileWidth) / 2

		const expansionLength = Math.min(20, Math.ceil(remainingSpace / finalTileWidth))

		tileViews.forEach((tileView) => {
			tileView.visible = false
		})
		this.tileViews[0].visible = true
		this.tilesCount = 1

		for (let i = 1; i <= expansionLength; i++) {
			const tileView = this.getTileView(this.tilesCount)
			tileView.x = i * TILE_WIDTH
			tileView.visible = true
			this.tilesCount++

			const tileView2 = this.getTileView(this.tilesCount)
			tileView2.x = -i * TILE_WIDTH
			tileView2.visible = true
			this.tilesCount++
		}
	}

	setFreeSpinsMode(isFreeSpinsMode = true) {
		this.isFreeSpinsMode = isFreeSpinsMode
		this.tileTint = isFreeSpinsMode ? 0x5555BB : 0xFFFFFF

		this.tileViews.forEach(view => view.tint = this.tileTint)

		this.onResize()
	}
}
