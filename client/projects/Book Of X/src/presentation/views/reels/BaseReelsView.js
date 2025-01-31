import { Container, Graphics } from 'pixi.js'
import { SingleReelView } from './SingleReelView'
import { AdaptiveContainer } from '../adaptiveDesign/AdaptiveContainer'
import { Timeline } from '../../timeline/Timeline'
import { generateMatrix, getRandomSymbolId } from '../../Utils'
import {
	CELLS_PER_REEL_COUNT,
	CELL_WIDTH,
	POSSIBLE_REELS_SYMBOLS,
	REELS_COUNT,
	REELS_HEIGHT,
	REELS_WIDTH,
	SCATTER_SYMBOL_ID
} from '../../Constants'


export class BaseReelsView extends AdaptiveContainer {
	reelsContainer
	maskView
	reelsViews = []
	cellsViews = []
	timeline = new Timeline

	constructor({
		initialSymbolsIds,
		resources,
		vfxLevel,
	}) {
		super()
		this.setSourceArea({
			width: REELS_WIDTH,
			height: REELS_HEIGHT,
		})
		this.setTargetArea({
			x: 0, y: 0, width: 1, height: 1,
		})


		this.initReels({
			initialSymbolsIds,
			resources,
			vfxLevel,
		})

		this.initMask()

		this.setMasked()
	}

	initReels({
		initialSymbolsIds,
		resources,
		vfxLevel,
	}) {
		const container = new Container()

		container.pivot.y = REELS_HEIGHT / 2
		container.y = REELS_HEIGHT / 2

		for (let i = 0; i < REELS_COUNT; i++) {
			const reelView = new SingleReelView({
				index: i,
				initialSymbolsIds: initialSymbolsIds[i],
				resources,
				vfxLevel,
				possibleSymbolsIds: POSSIBLE_REELS_SYMBOLS[i],
			})

			reelView.x = i * CELL_WIDTH
			this.reelsViews.push(container.addChildAt(reelView, 0))
			this.cellsViews.push(reelView.cellsViews)
		}
	
		this.reelsContainer = this.addChild(container)
	}

	initMask() {
		this.maskView = this
			.reelsContainer
			.addChild(new Graphics)
			.beginFill(0xFF00FF)
			.drawRect(0 - 250, 0, REELS_WIDTH + 500, REELS_HEIGHT)
			.endFill()
	}

	// API...
	reset() {
		this.timeline
			.wind(0, false)
			.pause()
			.deleteAllAnimations()

		this.reelsViews.forEach((view) => view.reset())
	}

	getCurrentSymbolsIds() {
		const reels = []

		for(let x = 0; x < REELS_COUNT; x++) {
			const reel = []
			for(let y = 0; y < CELLS_PER_REEL_COUNT; y++) {
				reel[y] = this.cellsViews[x][y + 1].currentSymbolId
			}

			reels.push(reel)
		}

		return reels
	}

	getAllCellsWithSymbolId(symbolId) {
		const { reelsViews } = this
		const cellsViews = []

		for(let x = 0; x < reelsViews.length; x++) {
			for(let y = 0; y < CELLS_PER_REEL_COUNT; y++) {
				const cellView = this.cellsViews[x][y + 1]
				if (cellView.currentSymbolId === symbolId)
					cellsViews.push(cellView)
			}
		}

		return cellsViews
	}

	setBrightness({
		key = 1,
		map = [
			[1, 1, 1],
			[1, 1, 1],
			[1, 1, 1],
			[1, 1, 1],
			[1, 1, 1],
		],
		brightness = 0.25
	}) {
		for(let x = 0; x < map.length; x++)
			for(let y = 0; y < map[0].length; y++)
				if(map[x][y] === key)
					this.cellsViews[x][y + 1]
						.setBrightness(brightness)
	}

	setMasked(isMasked = true) {
		this.reelsViews.forEach(reelView => reelView.setMasked(isMasked))

		this.maskView.visible = isMasked
		this.reelsContainer.mask = isMasked ? this.maskView : undefined
	}

	async presentSpinStart({
		lockedReelsIndexes = [],
		lockedSymbolId,
	}) {
		this.reset()
		this.setMasked()

		const { timeline, cellsViews } = this
		const reels = this.getCurrentSymbolsIds()

		this.timeline.deleteAllAnimations()
		
		let lockedCellsCount = 0
		lockedReelsIndexes.forEach(reelIndex => {
			for(let y = 0; y < CELLS_PER_REEL_COUNT; y++) {
				if(reels[reelIndex][y] !== lockedSymbolId) {
					const cellView = cellsViews[reelIndex][y + 1]
					const delay = lockedCellsCount * 100
					lockedCellsCount++

					timeline
						.addAnimation({
							delay,
							duration: 300,
							onProgress: progress => cellView.setFlip(progress * 0.5),
							onFinish: () => {
								cellView.setBrightness(1)
								cellView.presentSymbol(lockedSymbolId)
							}
						})
						.addAnimation({
							delay: delay + 300,
							duration: 300,
							onProgress: progress => cellView.setFlip(0.5 + progress * 0.5),
						})
				}
			}
		})

		await timeline.play()

		return Promise.all(
			this.reelsViews.map((view, i) =>
				lockedReelsIndexes.includes(i)
				|| view.presentSpinStart(i * 100)))        
	}

	presentSpinStop({
		targetSymbolsIds = generateMatrix(),
		ignoreTension = false
	}) {
		let scattersCount = 0
		let tensionReelsCount = 0
		
		return Promise.all(
			this.reelsViews.map((reel, i) => {
				if (scattersCount > 1) tensionReelsCount++
				
				for(let y = 0; y < targetSymbolsIds[i].length; y++)
					if(targetSymbolsIds[i][y] === SCATTER_SYMBOL_ID)
						scattersCount++

				return reel.presentSpinStop({
					symbolsIds: targetSymbolsIds[i],
					delay: ignoreTension ? 0 : tensionReelsCount * 1500,
					tensionDuration: 1000
				}) 
			}))
	}

	setTimeScale(scale) {
		for(const reelView of this.reelsViews)
			reelView.setTimeScale(scale)

		this.timeline.setTimeScaleFactor({name: 'scale', value: scale})
	}
	// ...API
}
