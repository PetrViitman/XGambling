import { Container, Graphics } from "pixi.js"
import { BaseReelsView } from "./BaseReelsView"
import { WinTabloidView } from "./WinTabloidView"
import { PayoutsInfoPanelView } from "./PayoutsInfoPanelView"
import { Timeline } from "../../timeline/Timeline"
import {
	CELLS_PER_REEL_COUNT,
	CELL_HEIGHT,
	CELL_WIDTH,
	REELS_COUNT,
	REELS_HEIGHT,
	REELS_WIDTH,
	SCATTER_SYMBOL_ID,
} from "../../Constants"
import { WinLinesPoolView } from "./winLine/WinLinesPoolView"
import { FreeSpinsIndicatorView } from "./FreeSpinsIndicatorView"

export class ReelsView extends BaseReelsView {
	interactiveView
	payoutsInfoPanelView
	winLinesPoolView
	winTabloidView
	commonFreeSpinsPayoutIndicatorView
	blackoutView
	isMobileDevice
	camera
	idleTimeline = new Timeline
	cameraTimeline = new Timeline
	isFreeSpinsMode
	

	constructor({
		initialSymbolsIds,
		resources,
		dictionary,
		coefficients,
		winLinesTopologies,
		vfxLevel,
		isMobileDevice,
		camera,
	}) {
		super({
			initialSymbolsIds,
			resources,
			vfxLevel
		})

		this.setSourceArea({width: 1427, height: 1026}).stickTop()

		this.winLinesTopologies = winLinesTopologies
		this.isMobileDevice = isMobileDevice
		this.camera = camera
		this.bringWinBoxesToFront()
		this.initWinLinesPool(resources, winLinesTopologies)
		this.initFreeSpinsIndicator(resources, dictionary)
		this.initWinTabloid(resources)
		this.initPayoutsInfoPanel(resources, coefficients)
		this.setFreeSpinsMode(false)
		this.setupInteractivity()
		this.initIdleTimeline()
	}

	initIdleTimeline() {
		this.idleTimeline
			.addAnimation({
				duration: 5000,
				onProgress: progress => 
					this.cellsViews.forEach(reel =>
						reel.forEach(view =>
							view.update(progress)
						)
					)
			})
			.setLoopMode()
			.play()
	}

	initReels({
		initialSymbolsIds,
		resources,
		vfxLevel,
	}) {
		super.initReels({
			initialSymbolsIds,
			resources,
			vfxLevel,
		})

		
		this.reelsContainer.position.set(115, 453)
	}

	initFrame(resources) {
		const backgroundWidth = CELL_WIDTH * 3
		const backgroundHeight = REELS_HEIGHT - 2 + 2
		const container = this.addChildAt(new Container, 0)
	

		// BLACKOUT...
		this.blackoutView = this
			.addChildAt(new Graphics, 1)
			.beginFill(0x000000, 0.6)
			.drawRect(
				-backgroundWidth / 2,
				-backgroundHeight / 2 - 2,
				backgroundWidth,
				backgroundHeight)
			.endFill()

		this.blackoutView.position.set(REELS_WIDTH / 2, REELS_HEIGHT / 2)
		this.blackoutView.alpha = 0
		// ...BLACKOUT


		container.cacheAsBitmap = true
	}

	initPayoutsInfoPanel(resources, coefficients) {
		this.payoutsInfoPanelView = this.addChild(
			new PayoutsInfoPanelView({
				resources,
				reelsView: this,
				coefficients,
				camera: this.camera
			}))

		this.payoutsInfoPanelView.x = this.reelsContainer.x
		this.payoutsInfoPanelView.y = 115
	}

	initWinLinesPool(resources, winLinesTopologies) {
		const poolView = new WinLinesPoolView(resources, winLinesTopologies)
		poolView.y = 100
		this.winLinesPoolView = this.addChild(poolView)
	}

	initFreeSpinsIndicator(
		resources,
		dictionary
	) {
		const indicatorView = new FreeSpinsIndicatorView(resources, dictionary)
		indicatorView.position.set(200, 50)
		this.freeSpinsIndicatorView = this.addChild(indicatorView)
		
	}

	initWinTabloid(resources) {
		const { camera } = this

		this.winTabloidView = this.addChild(
			new WinTabloidView({
				resources,
				camera
			}))

		this.winTabloidView
			.position
			.set(REELS_WIDTH / 2 + 100, REELS_HEIGHT / 2 + 125)


		this.winLinesPoolView.winTabloidView = this.winTabloidView
	}

	bringWinBoxesToFront() {
		// win boxes
		// should overlap neighboring cells
		this.reelsViews.forEach((reelView, x) =>
			reelView.cellsViews.forEach((cellView, y) => {
				const { bubblesBurstView } = cellView
				bubblesBurstView
				&& this.addChild(bubblesBurstView).position.set(
					CELL_WIDTH * (x + 0.5),
					CELL_HEIGHT * (y - 0.5),
				)
			}))
	}

	setupInteractivity() {
		const { payoutsInfoPanelView, reelsContainer } = this
		const interactiveView = this
			.addChild(new Graphics)
			.beginFill(0xFFFFFF, 0.0001)
			.drawRect(0, 0, REELS_WIDTH, REELS_HEIGHT)
			.endFill()

		interactiveView.position.set(
			reelsContainer.x,
			reelsContainer.y -REELS_HEIGHT / 2
		)
		
		interactiveView.cursor = 'pointer'
		interactiveView.eventMode = 'static'
		interactiveView.on('pointerdown', ({global}) => {
			if (payoutsInfoPanelView.capturedSymbolView)
				return payoutsInfoPanelView.hide()

			const {x, y} = interactiveView.toLocal(global)

			const cellX = Math.trunc(x / CELL_WIDTH)
			const cellY = Math.trunc(y / CELL_HEIGHT)
			const cellView = this.reelsViews[cellX].cellsViews[cellY + 1]

			payoutsInfoPanelView.presentPayouts({
				capturedSymbolView: cellView.getSymbolView(),
				x: cellX,
				y: cellY,
				symbolId: cellView.currentSymbolId
			})

		})
		this.interactiveView = interactiveView
		this.setInteractive(false)
	}

	updateTargetArea(sidesRatio) {
		const {
			isFreeSpinsMode,
			isMobileDevice,
		} = this

		this.payoutsInfoPanelView.hide()

		if(sidesRatio > 1.25 && !isMobileDevice) {
			// DESKTOP LANDSCAPE...
			this.setTargetArea({x: 0, y: 0.1, width: 1, height: 0.9})
			// ...DESKTOP LANDSCAPE
		} else if (sidesRatio > 1.25 && isMobileDevice) {
			// MOBILE LANDSCAPE...
			const panelWidth = isMobileDevice ? 0.2 : 0.125
			this.setTargetArea({x: 0, y: 0.075, width: 1 - panelWidth, height: 0.9})
			// ...MOBILE LANDSCAPE
		} else if (sidesRatio > 0.8) {
			// WIDE PORTRAIT...
			this.setTargetArea({x: 0, y: 0.1, width: 1, height:  0.775})
			// ...WIDE PORTRAIT
		} else {
			// NARROW PORTRAIT...
			const hatHeight = Math.min(0.45, 0.15 / sidesRatio)
			this.setTargetArea({x: 0, y: hatHeight, width: 1, height: 1})
			// ...NARROW PORTRAIT
		}

		/*

		const offsetY = isMobileDevice ? 0.08 : 0
		
		if(sidesRatio > 1.25) {
			// WIDE LANDSCAPE...
			this.setTargetArea({
				x: 0.25,
				y: 0.1,
				width: 0.5,
				height: 0.775 - offsetY,
			})
			.stickMiddle()

			// ...WIDE LANDSCAPE
		} else if (sidesRatio >= 1) {
			// NARROW LANDSCAPE...
			this.setTargetArea({
				x: isMobileDevice ? 0.125 : 0.035,
				y: 0.1,
				width: 0.8 - (isMobileDevice ? 0.225 : 0),
				height: 0.775 - offsetY,
			})
			.stickMiddle()
			// ...NARROW LANDSCAPE
		} else {
			// PORTRAIT...
			this.setTargetArea({
					x: 0.1,
					y: 0,
					width: 0.8,
					height: 0.7,
				})
				.stickBottom()
			// ...PORTRAIT
		}
		*/
	}

	setBrightness({ key, map, brightness }) {
		super.setBrightness({ key, map, brightness })
		// this.blackoutView.alpha = 1 - brightness
	}

	presentCellsWin({ key, map, progress }) {
		for(let x = 0; x < map.length; x++)
			for(let y = 0; y < map[0].length; y++)
				if(map[x][y] === key)
					this.cellsViews[x][y + 1]
						.getSymbolView()
						.presentWin(progress)
	}


	setMasked(isMasked = true) {
		super.setMasked(isMasked)
		/*
		this.addChildAt(
			this.reelsContainer,
			isMasked ? 2 : 7
		)*/
	}

	setInteractive(isInteractive = true) {
		this.interactiveView.visible = isInteractive
		this.winLinesPoolView.setInteractive(isInteractive)
	}

	// API...
	reset() {
		super.reset()
		this.winTabloidView.reset()
		this.setInteractive(false)
	}

	async presentIntro() {
		return this.cameraTimeline
			.deleteAllAnimations()
			.addAnimation({
				duration: 400,
				onProgress: (progress) => {
					const subProgress = progress ** 2

					let i = 0
					this.cellsViews.forEach(reel => {
						reel.forEach(cellView => {
							const shiftedProgress = Math.min(1, subProgress * (1 + 1 * i))

							cellView.getSymbolView()
							.presentationFlipProgress = 0.75 + 0.25 * shiftedProgress
						})
					})


					this.camera
						.focus({
							view: this,
							offsetX: 737,
							offsetY: 500,
						})
						.setZoom(1 + 0.1 * Math.abs(Math.sin(Math.PI * 1 * progress)) )
				},
				onFinish: () => {
					this.winLinesPoolView.onWinLineClick()
				}
			})
			.play()



		// const initialReels = this.getCurrentSymbolsIds()
		// this.placeholdersTableView.setVisible([1, 1, 1, 1, 1, 1, 1]) 
		/*
		this.presentExpansion({
			length: 7,
			forcePresent: true
		})

		this.timeline.deleteAllAnimations()

		let cellIndex = 0
		for (let x = 0; x < initialReels.length; x++) {
			for (let y = 0; y < initialReels[x].length; y++) {
				const view = this.cellsViews[x][y + 1]
				cellIndex++

				const isEmptyCell = y < 2 || y > 4

				this.timeline.addAnimation({
					delay: cellIndex * 10,
					duration: 500,
					onStart: _ => {
						view.setFlip(0.5)
						view.setBrightness(1)
						view.presentSymbol(isEmptyCell ? 0 : initialReels[x][y])
					},
					onProgress: progress => {
						view.setFlip(0.5 + progress * 0.5)
					}
				})
			}
		}

		this.presentExpansion({
			length: 3,
			forcePresent: true
		})
		*/
	}

	refreshPayoutsInfo(bet) {
		this.payoutsInfoPanelView.setBet(bet)
	}

	setTimeScale(scale) {
		super.setTimeScale(scale)
		this.cameraTimeline.setTimeScaleFactor({name: 'scale', value: scale})
		this.winTabloidView.setTimeScale(scale)
		this.freeSpinsIndicatorView.setTimeScale(scale)
	}

	presentWin({
		winLines =
		[
			{
				lineIndex: 0,
				payout: 123
			},
			/*
			{
				lineIndex: 1,
				payout: 123
			},
			*/
			{
				lineIndex: 2,
				payout: 123
			},
			{
				lineIndex: 7,
				payout: 123
			},
			{
				lineIndex: 12,
				payout: 123
			},
		],
		totalPayout,
		reels = this.getCurrentSymbolsIds()
	}) {
		this.reset()

		const {
			timeline,
			winLinesPoolView,
			winLinesTopologies,
			isFreeSpinsMode,
		} = this

		const linesIndexes = winLines.map(({lineIndex}) => lineIndex)
		this.setMasked(false)

		// WIN MAPS SETUP...
		const winMaps = []
		const commonWinMap = [[], [], [], [], []]
		winLines.forEach(({lineIndex, matchesCount}) => {
			const topology = winLinesTopologies[lineIndex]
			const symbolId = reels[0][topology[0]]
			const winMap = []
			
			let elapsedMatchesCount = 0

			for (let x = 0; x < REELS_COUNT; x++) {
				winMap[x] = []
				for (let y = 0; y < CELLS_PER_REEL_COUNT; y++) {
					const isLineMapping = elapsedMatchesCount < matchesCount
					const isMatchingSymbol =
						reels[x][y] === symbolId
						|| reels[x][y] === SCATTER_SYMBOL_ID
						|| symbolId === SCATTER_SYMBOL_ID
			
					const isWinPosition = topology[x] === y
					const isWin = isLineMapping && isWinPosition && isMatchingSymbol

					winMap[x][y] = isWin ? 1 : 0
					commonWinMap[x][y] = commonWinMap[x][y] || winMap[x][y]
					elapsedMatchesCount += isWin ? 1 : 0				
				}
			}

			winMaps.push(winMap)
		})
		// ...WIN MAPS SETUP

		timeline.deleteAllAnimations()


		// ALL LINES TOGETHER...
		if (totalPayout && (winLines.length > 1 || isFreeSpinsMode)) {
			return timeline
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
						key: 0,
						map: commonWinMap,
						brightness
					})

					this.presentCellsWin({
						key: 1,
						map: commonWinMap,
						progress
					})

					winLinesPoolView.presentWinLines(linesIndexes,progress)

					this.winTabloidView.presentPayout(totalPayout, progress)
				}
			})
			.play()
		}
		// ...ALL LINES TOGETHER


		// EACH LINE SEPARATELY...
		winLines.forEach(({
			lineIndex,
			payout
		}, i) => {
			timeline
			.addAnimation({
				delay: i * 1000,
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
						key: 0,
						map: winMaps[i],
						brightness: brightness
					})

					this.presentCellsWin({
						key: 1,
						map: winMaps[i],
						progress
					})

					winLinesPoolView.presentWinLine(lineIndex, progress)
					this.winTabloidView.presentPayout(payout, progress)
				}
			})
		})

		timeline.setLoopMode().play()
		// ...EACH LINE SEPARATELY
	}

	presentSpecialWin({
		substitutionSymbolId,
		specialWinLines,
		stepSpecialPayout,
		specialWinReels,
		reels = this.getCurrentSymbolsIds(),
	}) {
		const {
			timeline,
			winLinesPoolView,
			winLinesTopologies,
			cellsViews,
		} = this

		const linesIndexes = specialWinLines.map(({lineIndex}) => lineIndex)
		this.setMasked(false)

		// WIN MAPS SETUP...
		const winMaps = []
		const commonWinMap = [[], [], [], [], []]
		specialWinLines.forEach(({lineIndex, matchesCount}) => {
			const topology = winLinesTopologies[lineIndex]
			const winMap = []
			
			let elapsedMatchesCount = 0

			for (let x = 0; x < REELS_COUNT; x++) {
				winMap[x] = []
				for (let y = 0; y < CELLS_PER_REEL_COUNT; y++) {
					const isLineMapping = elapsedMatchesCount < matchesCount
					const isMatchingSymbol = specialWinReels.includes(x)
					const isWinPosition = topology[x] === y
					const isWin = isLineMapping && isWinPosition && isMatchingSymbol

					winMap[x][y] = isWin ? 1 : 0
					commonWinMap[x][y] = commonWinMap[x][y] || winMap[x][y]
					elapsedMatchesCount += isWin ? 1 : 0				
				}
			}

			winMaps.push(winMap)
		})
		// ...WIN MAPS SETUP

		timeline.deleteAllAnimations()

		// SUBSTITUTION...
		const specialLightMap = reels.map(reel => reel.map(_ => 0))
		specialWinReels.forEach(x => {
			for(let y = 0; y < CELLS_PER_REEL_COUNT; y++)
				specialLightMap[x][y] = 1
		})

		timeline.addAnimation({
			duration: 200,
			onProgress: progress => {
				this.setBrightness({
					key: 0,
					map: specialLightMap,
					brightness: 1 - progress
				})
			}
		})

		timeline.addAnimation({
			duration: 750,
			onProgress: progress => {
				specialWinReels.forEach(x => {
					for(let y = 0; y < CELLS_PER_REEL_COUNT; y++)
						cellsViews[x][y + 1].presentSubstitution({
							progress,
							currentSymbolId: reels[x][y],
							targetSymbolId: substitutionSymbolId,
						})
				})
			}
		})
		// ...SUBSTITUTION

		// ALL LINES TOGETHER...
		timeline.addAnimation({
			delay: 750,
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
					key: 0,
					map: commonWinMap,
					brightness
				})

				this.presentCellsWin({
					key: 1,
					map: commonWinMap,
					progress
				})

				winLinesPoolView.presentWinLines(linesIndexes,progress)

				this.winTabloidView.presentPayout(stepSpecialPayout, progress)
			}
		})
		// ...ALL LINES TOGETHER

		return timeline.play()
	}

	setFreeSpinsMode(isFreeSpinsMode = true) {
		this.reset()
		this.isFreeSpinsMode = isFreeSpinsMode
		this.freeSpinsIndicatorView.visible = isFreeSpinsMode
		this.onResize()
	}

	async presentFreeSpinsAward({
		freeSpinsCount,
	}) {
		this.reset()
		this.setMasked(false)

		// CAMERA...
		this.cameraTimeline
			.deleteAllAnimations()
			.addAnimation({
				duration: 1000,
				onProgress: (progress) =>
					this.camera
						.focus({
							view: this,
							offsetX: 737,
							offsetY: 500,
						})
						.setZoom(1 + 0.1 * Math.abs(Math.sin(Math.PI * 2 * progress)))
			})
			.play()
		// ...CAMERA

		// SCATTERS SYMBOLS ANIMATION...
		await Promise.all(
			this.getAllCellsWithSymbolId(SCATTER_SYMBOL_ID)
				.map(view => view.presentScatterWin()))
		// ...SCATTERS SYMBOLS ANIMATION
		
		return this.presentFreeSpinsCount(freeSpinsCount)
	}

	presentFreeSpinsCount(freeSpinsCount) {
		return this.freeSpinsIndicatorView.presentRemainingSpinsCount(freeSpinsCount)
	}

	async presentSpinStart({
		lockedReelsIndexes = [],
		lockedSymbolId,
		freeSpinsCount,
	}) {
		if(this.timeline.isPlaying)
			this.reset()

		// CAMERA...
		this.cameraTimeline
			.deleteAllAnimations()
			.addAnimation({
				duration: 10000,
				onProgress: (progress) => {
					this.camera
						.focus({
							view: this,
							offsetX: 737,
							offsetY: 500,
						})
						.setZoom(1 + 0.2 * progress)
				}
			})
			.play()
		// ...CAMERA

		await this.payoutsInfoPanelView.hide()

		return Promise.all([
			super.presentSpinStart({lockedReelsIndexes, lockedSymbolId}),
			this.winLinesPoolView.presentLinesHide(),
			this.presentFreeSpinsCount(freeSpinsCount)
		])
	}

	async presentSpinStop(targetSymbolsIds) {
		// CAMERA...
		const { camera } = this
		const initialZoom = this.camera.zoom
		const zoomDelta = initialZoom - 1

		this.cameraTimeline
			.deleteAllAnimations()
			.addAnimation({
				duration: 1000,
				onProgress: (progress) => {
					camera
						.focus({
							view: this,
							offsetX: 737,
							offsetY: 500,
						})
						.setZoom(initialZoom - zoomDelta * progress)
						.setAngle(0.025 * (1 - progress) * Math.sin(Math.PI * 2 * ((progress * 2) % 1) ))	
				}
			})
			.play()
		// ...CAMERA

		await super.presentSpinStop({
			targetSymbolsIds,
			ignoreTension: this.isFreeSpinsMode
		})

		this.setMasked(false)
	}

	hidePayoutsInfo() {
		return this.payoutsInfoPanelView.hide()
	}

	presentLinesCount(linesCount) {
		if (this.winLinesPoolView.activeLinesCount === linesCount) return
		this.reset()
		this.winLinesPoolView.presentLinesCount(linesCount)
	}

	reset() {
		this.timeline.wind(1).deleteAllAnimations()
		this.cellsViews.forEach(reel => reel.forEach(view => view.reset()))
	}
	// ...API
}