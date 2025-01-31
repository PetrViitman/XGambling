import { Container } from 'pixi.js'
import { ReelCellView } from './cell/ReelCellView'
import { getRandomSymbolId } from '../../Utils'
import { Timeline } from '../../timeline/Timeline'
import {
	CELL_HEIGHT,
	POSSIBLE_REELS_SYMBOLS,
	CELLS_PER_REEL_COUNT,
} from '../../Constants'

export class SingleReelView extends Container {
	index
	cellsContainer
	cellsViews = []
	maskView
	targetSymbolsIds
	spinTimeline = new Timeline
	spinAccelerationTimeline = new Timeline
	spinFinishTimeline = new Timeline
	featureTimeline = new Timeline

	constructor({
		index,
		assets,
		possibleSymbolsIds = POSSIBLE_REELS_SYMBOLS[1],
		initialSymbolsIds = new Array(length).fill(0),
	}) {
		super()
		this.index = index
		this.initCells({
			assets,
			initialSymbolsIds: [
				getRandomSymbolId(index),
				...initialSymbolsIds,
				getRandomSymbolId(index)
			],
			possibleSymbolsIds
		})
	}

	initCells({
		assets,
		initialSymbolsIds,
		possibleSymbolsIds,
	}) {
		const {cellsViews, index} = this
		const isSecurable = index === 2 || index === 3

		this.cellsContainer = this.addChild(new Container)

		for (let i = -1; i < CELLS_PER_REEL_COUNT + 1; i++) {
			const cellView = new ReelCellView({
				possibleSymbolsIds,
				assets,
				isSecurable
			})

			cellView.y = CELL_HEIGHT * i
			cellView.presentSymbol(initialSymbolsIds[i + 1])
			cellsViews.push(this.cellsContainer.addChild(cellView))
		}
	}
	
	// API...
	setTimeScale(scale) {
		const scaleDescriptor = {name: 'scale', value: scale}

		this.spinTimeline.setTimeScaleFactor(scaleDescriptor) 
		this.spinAccelerationTimeline.setTimeScaleFactor(scaleDescriptor) 
		this.spinFinishTimeline.setTimeScaleFactor(scaleDescriptor)
		this.featureTimeline.setTimeScaleFactor(scaleDescriptor)

		for(let i = 1; i <= CELLS_PER_REEL_COUNT; i++)
			this.cellsViews[i].setTimeScale(scale)
	}

	async preRenderSymbols(symbolsIds) {
        this.cellsViews.forEach((cellView) =>
            cellView.preRenderSymbols());
        this.setTimeScale(5);
        await this.presentSpinStart();
        await this.presentSpinStop({
            delay: 500,
            symbolsIds,
        });
        this.setTimeScale(1);
    }

    onPreRendered() {
        this.cellsViews.forEach((cellView) =>
            cellView.onPreRendered());
    }

	reset() {
		const {
			spinTimeline,
			spinAccelerationTimeline,
			spinFinishTimeline,
			featureTimeline
		} = this

		spinTimeline.isPlaying && spinTimeline.wind(1)
		spinAccelerationTimeline.isPlaying && spinAccelerationTimeline.wind(1)
		spinFinishTimeline.isPlaying && spinFinishTimeline.wind(1)
		featureTimeline.isPlaying && featureTimeline.wind(1)
	}

	async presentSpinStart(delay) {
		const {
			index,
			cellsViews,
			cellsContainer
		} = this

		const finalCellIndex = cellsViews.length - 1

		// DELAYED RALL BACK...
		await this
			.spinTimeline
			.deleteAllAnimations()
			.addAnimation({
				delay: delay || 1,
				duration: 300,
				onDelayFinish: () => this.targetSymbolsIds = undefined,
				onProgress: (progress) => {
					const reversedProgress = 1 - progress
					this.cellsViews[0].y = -CELL_HEIGHT - CELL_HEIGHT * reversedProgress
					this.cellsViews[finalCellIndex].y = CELLS_PER_REEL_COUNT * CELL_HEIGHT + CELL_HEIGHT * reversedProgress
					cellsContainer.pivot.y = progress ** 2 * CELL_HEIGHT * 0.5
				}
			})
			.setLoopMode(false)
			.play()
		// ...DELAYED RALL BACK

		// ACCELERATION...
		this.spinAccelerationTimeline
			.deleteAllAnimations()
			.addAnimation({
				duration: 250,
				onProgress: (progress) => {
					this.spinTimeline.setTimeScaleFactor({
						name: 'acceleration',
						value: 1 + progress * 8
					})
					this.cellsViews.forEach((view) => {
						view.setBlur(progress)
					})
				}
			})
			.windToTime(1)
			.play()
		// ...ACCELERATION

		// INFINITE SPIN...
		this.spinTimeline
			.deleteAllAnimations()
			.addAnimation({
				duration: 300,
				onProgress: (progress) => {
					cellsContainer.y = progress * CELL_HEIGHT * this.scale.y

					// ROLL BACK REVERT...
					if(cellsContainer.pivot.y > 0)
						cellsContainer.pivot.y = (1 - progress) * CELL_HEIGHT * 0.5
					// ...ROLL BACK REVERT



					// FINAL DESCENDENCE...
					if(
						this.targetSymbolsIds
						&& this.targetSymbolsIds.length <= 1
					) {
						// removing blur
						cellsViews.forEach(view => view.setBlur(1 - progress))
					}
					// ...FINAL DESCENDENCE
				},
				onFinish: () => {
					// SYMBOLS SWAP...
					cellsContainer.y = 0
					for (let i = cellsViews.length - 1; i > 0; i--) {
						cellsViews[i].presentSymbol(cellsViews[i - 1].currentSymbolId)
						cellsViews[i].scale.set(cellsViews[i - 1].scale.x)
					}
					// ...SYMBOLS SWAP

					// NEXT TOP SYMBOLS...
					cellsViews[0].presentSymbol(this.targetSymbolsIds?.pop() ?? getRandomSymbolId(index))
					// ...NEXT TOP SYMBOLS

					// STOP ON TARGET SYMBOLS...
					if(this.targetSymbolsIds && !this.targetSymbolsIds.length) 
						this.spinTimeline.setLoopMode(false)
					// ...STOP ON TARGET SYMBOLS
				}
			})
			.setLoopMode()
			.play()
		// ...INFINITE SPIN
	}

	async presentSpinStop({
		symbolsIds = [1, 2, 3, 4, 5, 6],
		delay,
	}) {
		if(!this.spinTimeline.isPlaying) return
		
		await this
			.featureTimeline
			.deleteAllAnimations()
			.addAnimation({delay})
			.play()

		// WAIT TILL STOP ON TARGET SYMBOLS... 
		this.targetSymbolsIds = [
			getRandomSymbolId(this.index),
			...symbolsIds,
			getRandomSymbolId(this.index)
		]

		const finalCellIndex = this.cellsViews.length - 1
		await this.spinTimeline.play()
		// ...WAIT TILL STOP ON TARGET SYMBOLS

		// FLEX UP-DOWN...
		await this
			.spinTimeline
			.deleteAllAnimations()
			.addAnimation({
				duration: 300,
				onProgress: (progress) => {
					const subProgress = progress > 0.5
						? 1 - (progress - 0.5) * 2
						: progress * 2

					this.cellsContainer.pivot.y = subProgress * CELL_HEIGHT * 0.5
					this.cellsViews.forEach(view => {
						view.setBlur(0)
					})


					// hiding top & bottom cells
					this.cellsViews[0].y = -CELL_HEIGHT - CELL_HEIGHT * progress
					this.cellsViews[finalCellIndex].y = CELLS_PER_REEL_COUNT * CELL_HEIGHT
						+ CELL_HEIGHT * 2 * progress
				},
			})
			.setTimeScaleFactor({
				name: 'acceleration',
				value: 1
			})
			.play()
		// ...FLEX UP-DOWN
	}

	presentSymbol(symbolId, y) {
		this.cellsViews[y + 1].presentSymbol(symbolId)
	}

	presentWin(map = [1, 1, 1, 1]) {
		const { cellsViews } = this

		return Promise.all(map.map((value, y) => {
			if (value) return cellsViews[y + 1].presentWin()
		}))
	}

	presentCascade({
		y,
		distance,
		symbolId,
		delay
	}) {
		const fallingCellView = this.cellsViews[y - distance + 1]
		const targetCellView = this.cellsViews[y + 1]

		fallingCellView?.presentSymbol(0)

		return targetCellView.presentFallIn({
			symbolId,
			distance,
			delay
		})
	}
	// ...API
}
