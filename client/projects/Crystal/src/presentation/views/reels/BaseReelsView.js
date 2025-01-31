import { Container, Graphics } from 'pixi.js'
import { SingleReelView } from './SingleReelView'
import { AdaptiveContainer } from '../adaptiveDesign/AdaptiveContainer'
import { Timeline } from '../../timeline/Timeline'
import { generateMatrix, getRandomLoseReels } from '../../Utils'
import {
	CELL_HEIGHT,
	CELL_WIDTH,
	POSSIBLE_REELS_SYMBOLS,
	REELS_COUNT,
	REELS_HEIGHT,
	CELLS_PER_REEL_COUNT,
	REELS_WIDTH,
} from '../../Constants'

import { CollapsesPoolView } from "./collapses/CollapsesPoolView"

export class BaseReelsView extends AdaptiveContainer {
	reelsContainer
	maskView
	reelsViews = []
	cellsViews = []
	timeline = new Timeline
	highlightTimeline = new Timeline
	corruptionTimeline = new Timeline

	constructor({
		initialSymbolsIds,
		assets,
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
			assets,
			vfxLevel,
		})

		this.initCollapsesPool(assets)

		this.initMask(assets)
		this.setMasked()
	}

	initReels({
		initialSymbolsIds,
		assets,
		vfxLevel,
	}) {
		const container = new Container()

		for (let i = 0; i < REELS_COUNT; i++) {
			const reelView = new SingleReelView({
				index: i,
				initialSymbolsIds: initialSymbolsIds[i],
				assets,
				vfxLevel,
				possibleSymbolsIds: POSSIBLE_REELS_SYMBOLS[i],
			})

			reelView.x = i * CELL_WIDTH
			this.reelsViews.push(container.addChildAt(reelView, 0))
			this.cellsViews.push(reelView.cellsViews)
		}
	
		this.reelsContainer = this.addChild(container)
	}

	initCollapsesPool(assets) {
		const view = new CollapsesPoolView(assets)
		view.position.set(CELL_WIDTH / 2, CELL_HEIGHT / 2)
		this.collapsesPoolView = view
		this.reelsContainer.addChild(view)
	}

	initMask(assets) {
		const view = new Graphics()
			.beginFill(0xFFFFFF)
			.drawRect(0, 0, REELS_WIDTH, REELS_HEIGHT)
			.endFill()

		this.maskView = this
			.reelsContainer
			.addChild(view)
	}

	// API...
	reset() {
		this.timeline
			.wind(0, false)
			.pause()
			.deleteAllAnimations()

		this.reelsViews.forEach((view) => view.reset())
	}

	async preRenderSymbols(symbolsIds = getRandomLoseReels()) {
        await Promise.all(
            this.reelsViews.map((reelView, i) => {
                return reelView.preRenderSymbols(symbolsIds[i]);
            }),
        );

        this.reelsViews.forEach((reelView) =>
            reelView.onPreRendered());
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
		map = new Array(REELS_COUNT).fill(0).map((_, i) => new Array(CELLS_PER_REEL_COUNT).fill(1)),
		brightness = 0.25,
	}) {
		const {cellsViews} = this

		for(let x = 0; x < map.length; x++) {
			cellsViews[x][0].setBrightness(brightness)
					
					
			for(let y = 0; y < map[x].length; y++)
				if(map[x][y] === key) {
					const cellView = cellsViews[x][y + 1]
					cellView.setBrightness(brightness)
				}
		}
	}

	setMasked(isMasked = true) {
		const { cellsViews } = this

		for(let x = 0; x < REELS_COUNT; x++) {
			cellsViews[x][0].visible = isMasked
			cellsViews[x][cellsViews[x].length - 1].visible = isMasked
		}

		this.maskView.visible = isMasked
		this.reelsContainer.mask = isMasked ? this.maskView : undefined
	}

	async presentSpinStart() {
		this.reset()
		this.setMasked()
		this.timeline.deleteAllAnimations()
		
		return Promise.all(
			this.reelsViews.map((view, i) =>
				view.presentSpinStart(i * 100)))        
   
	}

	async presentSpinStop({
		targetSymbolsIds = getRandomLoseReels(),
	}) {
		await Promise.all(
			this.reelsViews.map((reel, i) => {
				return reel.presentSpinStop({
					symbolsIds: targetSymbolsIds[i],
					delay: i * 100,
				}) 
			}))
	}

	setupPayoutDescriptors(collapses, corruptionMap) {
		const payoutMap = corruptionMap.map(row => row.map(value => value)) 

		collapses.forEach(collapse => {
			collapse.payoutWidth = 1
			collapse.payoutHeight = 1
			const [x, y] = collapse.coordinates[0]
			collapse.payoutX = x
			collapse.payoutY = y
		})


		// ИЩЕМ НАИБОЛЕЕ ШИРОКИЕ РЯДЫ В ДЕСКРИПТОРАХ...

		for (let y = 0; y < CELLS_PER_REEL_COUNT; y++) {
			let descriptorIndex
			let width = 0
			let payoutX = 0
			for (let x = 0; x < REELS_COUNT; x++) {
				const descriptorIndexByCell = payoutMap[x][y]

				if (
					descriptorIndex !== undefined
					&& descriptorIndexByCell !== undefined
					&& descriptorIndex === descriptorIndexByCell
				) {
					const descriptor = collapses[descriptorIndex]
					width++

					if (descriptor.payoutWidth < width) {
						descriptor.payoutWidth = width
						descriptor.payoutX = payoutX
						descriptor.payoutY = y
					}
				} else {
					width = 1
					payoutX = x
					descriptorIndex = descriptorIndexByCell
				}

			}
		}
		// ...ИЩЕМ НАИБОЛЕЕ ШИРОКИЕ РЯДЫ В ДЕСКРИПТОРАХ

		// ИЩЕМ ГРУППЫ ВЕРТИКАЛЬНЫХ ВЫПЛАТ-СОСЕДЕЙ ШИРИНОЙ В ОДНУ ЯЧЕЙКУ...
		// (к таким группам выплат у художников есть особые пожелания)
		const specialVerticalSiblingGroups = [];

		// на всякий случай учитывается, что дескрипторы могут быть не отсортированы на сервере
		collapses.forEach((descriptor) => {
			if (descriptor.payoutWidth > 1) { return; }


			const {payoutY} = descriptor;
			const group = [descriptor];

			collapses.forEach((descriptor) => {
				if (descriptor.payoutWidth > 1) { return; }
				if (payoutY !== descriptor.payoutY) { return; }

				const lastDescriptorInGroup = group[group.length - 1];
				const payoutDeltaX = descriptor.payoutX - lastDescriptorInGroup.payoutX;
				if (payoutDeltaX === 1) {
					group.push(descriptor);

					// по замыслу художников у каждой чётной выплаты
					// в такой группе сдвигаем центр на одну ячейку вниз
					// если это возможно
					if (
						group.length % 2 === 0
						&& descriptor.payoutY < 7
					) {
						descriptor.payoutY++;
					} else if (
						group.length % 3 === 0
						&& descriptor.payoutY > 0
					) {
						descriptor.payoutY--;
					}
				}
			});

			if (group.length > 1) {
				specialVerticalSiblingGroups.push(group);
				group.forEach((descriptor) => {
					descriptor.isSpecialVerticalSiblingDescriptor = true;
				});
			}
		});
		// ...ИЩЕМ ГРУППЫ ВЕРТИКАЛЬНЫХ ВЫПЛАТ-СОСЕДЕЙ ШИРИНОЙ В ОДНУ ЯЧЕЙКУ

		// РАСШИРЯЕМ ВЕРТИКАЛЬНЫЕ УЗКИЕ ВЫПЛАТЫ...
		collapses.forEach((descriptor, i) => {
			const {
				payoutX,
				payoutY,
				payoutWidth,
			} = descriptor

			if (payoutWidth >= 2) {
				return
			}

			const leftMostX = Math.max(0, payoutX - 1)
			const rightMostX = Math.min(REELS_COUNT - 1, payoutX + payoutWidth)
			const leftMostDescriptor = collapses[payoutMap[leftMostX][payoutY]]
			const rightMostDescriptor = collapses[payoutMap[rightMostX][payoutY]]

			if (
				!leftMostDescriptor
				|| leftMostDescriptor.isSpecialVerticalSiblingDescriptor
			) {
				payoutMap[leftMostX][payoutY] = i
				descriptor.payoutX--
				descriptor.payoutWidth++
			}

			if (
				!rightMostDescriptor
				|| rightMostDescriptor.isSpecialVerticalSiblingDescriptor
			) {
				payoutMap[rightMostX][payoutY] = i
				descriptor.payoutWidth++
			}
		})
		// ...РАСШИРЯЕМ ВЕРТИКАЛЬНЫЕ УЗКИЕ ВЫПЛАТЫ

		// РАСТЯГИВАЕМ ВЫПЛАТЫ ПО ВСЕЙ ВОЗМОЖНОЙ ВЫСОТЕ...
		collapses.forEach((descriptor, i) => {
			// для специальных узких вертикальных соседних выплат это заведомо не актуально
			if (descriptor.isSpecialVerticalSiblingDescriptor) {
				return
			}

			const {
				payoutX,
				payoutY,
				payoutWidth,
			} = descriptor

			for (let y = payoutY + 1; y < 7; y++) {
				for (let x = payoutX; x < payoutX + payoutWidth; x++) {
					if (payoutMap[x][y] !== i) {
						return
					}
				}

				descriptor.payoutHeight++
			}

		})
		// ...РАСТЯГИВАЕМ ВЫПЛАТЫ ПО ВСЕЙ ВОЗМОЖНОЙ ВЫСОТЕ
	}

	async presentCascade({
		patchMap = [
			[1],
			[1],
			[1, 2],
			[3],
			[5],
			[],
		],
		collapses = [
			{
				coordinates: [[0, 0], [1, 0], [2, 0], [2, 1], [3, 0], [4, 0]],
				coefficient: 2.5
			}
		]
	}) {
		this.setMasked()
		const currentSymbolsIds = this.getCurrentSymbolsIds()

		// CORRUPTION MAP SETUP...
		const corruptionMap = generateMatrix()
		collapses.forEach(({coordinates}, i) => {
			coordinates.forEach(([x, y]) => {
				corruptionMap[x][y] = i // backing in collapse index
			})
		})
		// ...CORRUPTION MAP SETUP

		this.setupPayoutDescriptors(collapses, corruptionMap)

		// MAPPING CASCADE...
		const cascadeMap = generateMatrix(0)
		for (let x = 0; x < REELS_COUNT; x++) {
			let distance = 0
			for (let y = CELLS_PER_REEL_COUNT - 1; y >= 0; y--) {    
				if(corruptionMap[x][y] !== undefined) {
					distance++
					cascadeMap[x][y] = 0
				} else {
					cascadeMap[x][y + distance] = distance
				}
			}
		}
		// ...MAPPING CASCADE


		let promises = []
		// CORRUPTION...
		this.setMasked(false)
		await this
			.corruptionTimeline
			.deleteAllAnimations()
			.addAnimation({
				duration: 1000,
				onStart: () => {
					for (let x = 0; x < cascadeMap.length; x++)
						for(let y = CELLS_PER_REEL_COUNT - 1; y >= 0; y--)
							corruptionMap[x][y] !== undefined
								&& this.cellsViews[x][y + 1].presentSymbol(0)
				},
				onProgress: progress => {
					this.collapsesPoolView.present(collapses, progress, currentSymbolsIds)
				}
			})
		

		promises.push(this.corruptionTimeline.play())

		// CELLS HIGHLIGHT...
		// WIN MAPS SETUP...
		// DEBUG...
		const highlightMap = corruptionMap.map(reel => reel.map(symbolId => {
			if (symbolId === undefined) return 1
			return 0
		}))
		// ...DEBUG
		// ...WIN MAPS SETUP

		promises.push(
			this.highlightTimeline
				.deleteAllAnimations()
				.addAnimation({
					duration: 1000,
					onProgress: progress => {
						let brightness = 1

						if (progress < 0.25) {
							brightness = 1 - progress / 0.25
						} else if (progress > 0.75) {
							brightness = (progress - 0.75) / 0.25
						} else {
							brightness = 0
						}

						this.setBrightness({
							map: highlightMap,
							key: 1,
							brightness
						})
					}
				})
				.play()
			)
			
		// ...CELLS HIGHLIGHT

	
		await Promise.all(promises)

		this.setMasked()
		// ...CORRUPTION


		
		// FALL...
		promises = []
		for (let x = 0; x < cascadeMap.length; x++) {
			for(let y = CELLS_PER_REEL_COUNT - 1; y >= 0; y--) {
				const offsetY = y - cascadeMap[x][y]
				const symbolId = currentSymbolsIds[x][offsetY]
				cascadeMap[x][y]
				&& promises.push(
					this.reelsViews[x]
						.presentCascade({
							y,
							distance: cascadeMap[x][y],
							symbolId
						}))

			}
		}

		await Promise.all(promises)
		// ...FALL

		// PATCH FALL...
		promises = []
		for (let x = 0; x < patchMap.length; x++)
			for(let y = patchMap[x].length - 1; y >= 0; y--)
				promises.push(
					this.reelsViews[x]
						.presentCascade({
								y,
								distance: CELLS_PER_REEL_COUNT,
								symbolId: patchMap[x][y],
								delay: x * 50 || 1
						}))
		
		await Promise.all(promises)
		// ...PATCH FALL
	}

	setTimeScale(scale) {
		for(const reelView of this.reelsViews)
			reelView.setTimeScale(scale)

		this.timeline.setTimeScaleFactor({name: 'scale', value: scale})
		this.corruptionTimeline.setTimeScaleFactor({name: 'scale', value: scale})
		this.highlightTimeline.setTimeScaleFactor({name: 'scale', value: scale})
	}


	presentRandomLoseSymbols() {
		let symbolsIds = getRandomLoseReels()
		
		for(let x = 0; x < REELS_COUNT; x++) {
			for(let y = 0; y < CELLS_PER_REEL_COUNT; y++) {
				this.cellsViews[x][y + 1]
					.presentSymbol(symbolsIds[x][y])
			}
		}
	}
	// ...API
}
