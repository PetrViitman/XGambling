import { Container } from 'pixi.js'
import { SingleReelView } from './SingleReelView'
import { AdaptiveContainer } from '../adaptiveDesign/AdaptiveContainer'
import { Timeline } from '../../timeline/Timeline'
import { generateMatrix, getRandomSymbolId } from '../../Utils'
import {
	CELL_HEIGHT,
	CELL_WIDTH,
	MAXIMAL_REGULAR_REEL_LENGTH,
	MINIMAL_REGULAR_REEL_LENGTH,
	POSSIBLE_REELS_SYMBOLS,
	REELS_COUNT,
	REELS_HEIGHT,
	REELS_LENGTHS,
	REELS_WIDTH,
	SCATTER_SYMBOL_ID
} from '../../Constants'
import { PlaceholderTableView } from './PlaceholderTableView'

const VISIBILITY_EXPANSION_MAP = {
	3: [0, 0, 1, 1, 1, 0, 0],
	4: [0, 0, 1, 1, 1, 1, 0],
	5: [0, 1, 1, 1, 1, 1, 0],
	6: [0, 1, 1, 1, 1, 1, 1],
	7: [1, 1, 1, 1, 1, 1, 1],
}

export class BaseReelsView extends AdaptiveContainer {
	reelsContainer
	reelsViews = []
	cellsViews = []
	placeholdersTableView
	timeline = new Timeline
	expandedReelsLength = MINIMAL_REGULAR_REEL_LENGTH

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

		this.initPlaceholders(resources)

		this.initReels({
			initialSymbolsIds,
			resources,
			vfxLevel,
		})
		this.presentExpansion({
			length: this.expandedReelsLength,
			forcePresent: true
		})
		this.reelsViews[0].setVisibleCellsCount(1)
		this.reelsViews[4].setVisibleCellsCount(1)

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

	initPlaceholders(resources) {
		this.placeholdersTableView = new PlaceholderTableView(resources)
		this.placeholdersTableView.x = CELL_WIDTH
		this.addChild(this.placeholdersTableView)
	}

	// API...
	async presentExpansion({
		length = MINIMAL_REGULAR_REEL_LENGTH,
		forcePresent = false
	}) {
		if (this.expandedReelsLength === length && !forcePresent) return
		const { cellsViews } = this
		const oldVisibilityMap = VISIBILITY_EXPANSION_MAP[this.expandedReelsLength]
		const visibilityMap = VISIBILITY_EXPANSION_MAP[length]

		let oldOffsetY = 0
		for (let y = 0; y < this.expandedReelsLength; y++)
			if (!oldVisibilityMap[y])
				oldOffsetY++
			else
				break

		let offsetY = 0
		for (let y = 0; y < length; y++)
			if (!visibilityMap[y])
				offsetY++
			else
				break

		const offsetDelta = offsetY - oldOffsetY
		const isReveal = length > this.expandedReelsLength//  || forcePresent
		const reels = this.getCurrentSymbolsIds()
		let revealedCellsCount = 0

		this.timeline.deleteAllAnimations()

		for (let x = 1; x <= 3; x++) {
			if (isReveal) {
				this.reelsViews[x].setVisibleCellsCount(length)
				this.reelsViews[x].y = offsetY * CELL_HEIGHT
			}

			for (let y = 0; y < MAXIMAL_REGULAR_REEL_LENGTH; y++) {
				isReveal && cellsViews[x][y + 1].presentSymbol(reels[x][y + offsetDelta] ?? reels[x][y])

				if (visibilityMap[y] !== oldVisibilityMap[y]) {
					const delay = revealedCellsCount * 100
					const cellView = isReveal
						? cellsViews[x][y + 1 - offsetY]
						: cellsViews[x][y + 1 - oldOffsetY]
					
					isReveal && cellView.presentSymbol(0)


					const targetSymbolId = isReveal ? getRandomSymbolId(x) : 0

					this.timeline
						.addAnimation({
							delay,
							duration: 300,
							onProgress: progress => cellView.setFlip(0.5 * progress),
							onFinish: () => {
								cellView.setBrightness(1)
								cellView.presentSymbol(targetSymbolId)
							}
						})
						.addAnimation({
							delay: delay + 300,
							duration: 300,
							onProgress: progress => cellView.setFlip(0.5 + 0.5 * progress),
						})

					revealedCellsCount++
				}
			}
		}

		this.expandedReelsLength = length
		this.setMasked()
		
		isReveal && this.placeholdersTableView.setVisible(visibilityMap)
		forcePresent || await this.timeline.play()

		if (!isReveal) {
			for (let x = 1; x <= 3; x++) {
				this.reelsViews[x].setVisibleCellsCount(length)
				this.reelsViews[x].y = offsetY * CELL_HEIGHT
				for (let y = 0; y < 7; y++) {
					cellsViews[x][y + 1].presentSymbol(reels[x][y + offsetDelta] ?? reels[x][y])
				}
			}
			this.placeholdersTableView.setVisible(visibilityMap)
		}
	}

	reset() {
		this.timeline
			.wind(0, false)
			.pause()
			.deleteAllAnimations()

		this.reelsViews.forEach((view) => view.reset())
	}

	getCurrentSymbolsIds() {
		return REELS_LENGTHS
			.map((length, x) => new Array(length).fill(0)
				.map((_, y) => this.cellsViews[x][y + 1].currentSymbolId)) 
	}

	getAllCellsWithSymbolId(symbolId) {
		const { reelsViews } = this
		const cellsViews = []

		for(let x = 0; x < reelsViews.length; x++) {
			const length = Math.min(this.expandedReelsLength, REELS_LENGTHS[x])
			for(let y = 0; y < length; y++) {
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
			[1, 1, 1, 1, 1, 1, 1],
			[1, 1, 1, 1, 1, 1, 1],
			[1, 1, 1, 1, 1, 1, 1],
		],
		brightness = 0.25
	}) {
		for(let x = 0; x < map.length; x++)
			for(let y = 0; y < map[0].length; y++)
				if(map[x][y] === key)
					this.cellsViews[x + 1][y + 1]
						.setBrightness(brightness)
	}

	setMasked(isMasked = true) {
		this.reelsViews.forEach(reelView => reelView.setMasked(isMasked))
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
			const reelLength = Math.min(
				REELS_LENGTHS[reelIndex],
				this.expandedReelsLength)

			for(let y = 0; y < reelLength; y++) {
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
