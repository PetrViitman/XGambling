import { Container, Graphics } from 'pixi.js'
import { ReelCellView } from './cell/ReelCellView'
import { getRandomSymbolId } from '../../Utils'
import { Timeline } from '../../timeline/Timeline'
import { TensionView } from './TensionView'
import {
	CELLS_PER_REEL_COUNT,
	CELL_HEIGHT,
	CELL_WIDTH,
	POSSIBLE_REELS_SYMBOLS,
	REELS_HEIGHT,
	SCATTER_SYMBOL_ID
} from '../../Constants'
import { ReelHitEffect } from './ReelHitEffectView'

export class SingleReelView extends Container {
	index
	cellsContainer
	cellsViews = []
	maskView
	hitEffectView
	targetSymbols
	spinTimeline = new Timeline
	spinAccelerationTimeline = new Timeline
	spinFinishTimeline = new Timeline

	constructor({
		index,
		resources,
		vfxLevel,
		possibleSymbolsIds = POSSIBLE_REELS_SYMBOLS[1],
		initialSymbolsIds = new Array(length).fill(0),
	}) {
		super()
		this.index = index
		this.initCells({
			resources,
			initialSymbolsIds: [
				getRandomSymbolId(index),
				...initialSymbolsIds
			],
			possibleSymbolsIds,
		})
		this.initTension(resources)
		this.initHitEffect(resources, vfxLevel)
		this.adjustScales()
	}

	initCells({
		resources,
		initialSymbolsIds,
		possibleSymbolsIds
	}) {
		const {cellsViews} = this
		const offsetY = CELL_HEIGHT / 2

		this.cellsContainer = this.addChild(new Container)

		for (let i = -1; i < CELLS_PER_REEL_COUNT; i++) {
			const cellView = new ReelCellView({
				possibleSymbolsIds,
				resources,
			})
			cellView.x = CELL_WIDTH / 2
			cellView.y = CELL_HEIGHT * i + offsetY
			cellView.presentSymbol(initialSymbolsIds[i + 1])
			cellsViews.push(this.cellsContainer.addChild(cellView))
		}

		cellsViews[0].visible = false
	}

	initTension(resources) {
		const { index } = this
		if (index < 1) return

		this.tensionView = this.addChild(new TensionView(resources, index))
		this.tensionView.x = CELL_WIDTH / 2
		this.tensionView.y = REELS_HEIGHT + 120
		this.tensionView.alpha = 0
	}

	initHitEffect(resources, vfxLevel) {
		if(vfxLevel < 0.5) return

		this.hitEffectView = new ReelHitEffect(resources)
		this.hitEffectView.position.set(100, CELL_HEIGHT * 3)
		this.addChild(this.hitEffectView)
	}

	adjustScales() {
		this.cellsViews.forEach(view => {
			const halfHeight = REELS_HEIGHT / 2
			const distanceX = 25 * Math.abs(this.index - 2.5) / 2.5 * (this.index < 2 ? -1 : 1)
			const distanceY = Math.abs(view.y + this.cellsContainer.y - this.cellsContainer.pivot.y - halfHeight) 
			const distortionFactor =  Math.min(1, (1 - distanceY / halfHeight) * 2)
			view.x = CELL_WIDTH / 2 + distanceX * distortionFactor
			view.scale.set(0.5 + 0.5 * distortionFactor)
		})
	}
	
	// API...
	setMasked(isMasked = true) {
		const {
			cellsViews,
		} = this
	
		cellsViews[0].visible = isMasked
	}

	setTimeScale(scale) {
		const scaleDescriptor = {name: 'scale', value: scale}

		this.spinTimeline.setTimeScaleFactor(scaleDescriptor) 
		this.spinAccelerationTimeline.setTimeScaleFactor(scaleDescriptor) 
		this.spinFinishTimeline.setTimeScaleFactor(scaleDescriptor)
		this.tensionView?.setTimeScale(scale)

		for(let i = 1; i <= CELLS_PER_REEL_COUNT; i++)
			this.cellsViews[i].setTimeScale(scale)
	}

	reset() {
		const {
			spinTimeline,
			spinAccelerationTimeline,
			spinFinishTimeline,
		} = this

		spinTimeline.isPlaying && spinTimeline.wind(1)
		spinAccelerationTimeline.isPlaying && spinAccelerationTimeline.wind(1)
		spinFinishTimeline.isPlaying && spinFinishTimeline.wind(1)

		this.cellsViews.forEach((view, i) => {
			view.reset()
			view.visible = !!i
		})
	}

	async presentSpinStart(delay) {
		const {
			index,
			cellsViews,
			cellsContainer
		} = this

		// DELAYED RALL BACK...
		await this
			.spinTimeline
			.deleteAllAnimations()
			.addAnimation({
				delay: delay || 1,
				duration: 300,
				onDelayFinish: () => this.targetSymbols = undefined,
				onProgress: (progress) => {
					cellsContainer.pivot.y = progress ** 2 * CELL_HEIGHT * 0.5
					this.adjustScales()
				},
				onFinish: () => cellsViews[0].visible = true
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
						value: 1 + progress * 4
					})
					this.cellsViews.forEach((view) =>
						view.setIdleFactor(1 - progress))
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

					// RALL BACK REVERT...
					if(cellsContainer.pivot.y > 0)
						cellsContainer.pivot.y = (1 - progress) * CELL_HEIGHT * 0.5
					// ...RALL BACK REVERT

					this.targetSymbols
					&& this.targetSymbols.length <= 1
					&& cellsViews.forEach(view => view.setBlur(1 - progress))

					this.adjustScales()
				},
				onFinish: () => {
					// SYMBOLS SWAP...
					cellsContainer.y = 0
					for (let i = cellsViews.length - 1; i >= 1; i--)
						cellsViews[i].presentSymbol(cellsViews[i - 1].currentSymbolId)
					// ...SYMBOLS SWAP

					// NEXT TOP SYMBOL...
					cellsViews[0].presentSymbol(this.targetSymbols?.pop() ?? getRandomSymbolId(index))
					// ...NEXT TOP SYMBOL

					// STOP ON TARGET SYMBOLS...
					if(this.targetSymbols && !this.targetSymbols.length) 
						this.spinTimeline.setLoopMode(false)
					// ...STOP ON TARGET SYMBOLS
				}
			})
			.setLoopMode()
			.play()
		// ...INFINITE SPIN
	}

	async presentSpinStop({
		symbolsIds = [0, 0, 0, 0, 0, 0, 0],
		delay,
		tensionDuration
	}) {
		if(!this.spinTimeline.isPlaying) return
		
		// TENSION...
		delay && await this.tensionView?.present({
			delay: delay - tensionDuration,
			duration: tensionDuration
		})
		// ...TENSION

		// WAIT TILL STOP ON TARGET SYMBOLS... 
		this.targetSymbols = [getRandomSymbolId(this.index), ...symbolsIds]
		const bottomSymbolId = this.targetSymbols[this.targetSymbols.length - 1]
		await this.spinTimeline.play()
		this.hitEffectView?.presentHit(bottomSymbolId)
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
					this.cellsViews.forEach(view => view.setIdleFactor(progress))
					this.adjustScales()
				},
			})
			.setTimeScaleFactor({
				name: 'acceleration',
				value: 1
			})
			.play()
		// ...FLEX UP-DOWN

		delay && this.tensionView?.hide()

		// SCATTER TEASING...
		this.setMasked(false)
		return Promise.all(symbolsIds.map((id, y) => {
			if(id === SCATTER_SYMBOL_ID)
				return this.cellsViews[y + 1].presentScatterTeasing()
		}))
		// ...SCATTER TEASING
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
	// ...API
}
