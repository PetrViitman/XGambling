import { Container, Graphics, Sprite } from "pixi.js"
import { BaseReelsView } from "./BaseReelsView"
import { WinTabloidView } from "./WinTabloidView"
import { PayoutsInfoPanelView } from "./PayoutsInfoPanelView"
import { Timeline } from "../../timeline/Timeline"
import {
	CELL_HEIGHT,
	CELL_WIDTH,
	MINIMAL_REGULAR_REEL_LENGTH,
	REELS_COUNT,
	REELS_HEIGHT,
	REELS_WIDTH,
	SCATTER_SYMBOL_ID,
} from "../../Constants"
import { WinLinesPoolView } from "./winLine/WinLinesPoolView"
import { CounterView } from "./CounterView"
import { GearsView } from "./gears/GearsView"

export class ReelsView extends BaseReelsView {
	interactiveView
	payoutsInfoPanelView
	winLinesPoolView
	winTabloidView
	commonFreeSpinsPayoutIndicatorView
	frameView
	freeSpinsFrameView
	blackoutView
	isMobileDevice
	camera
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

		this.winLinesTopologies = winLinesTopologies
		this.isMobileDevice = isMobileDevice
		this.camera = camera
		this.initFrame(resources)
		this.initGears(resources)
		this.bringWinBoxesToFront()
		this.initWinLinesPool(resources, winLinesTopologies)
		this.initFreeSpinsCounter(resources, dictionary)
		this.initWinTabloid(resources)
		this.initPayoutsInfoPanel(resources, coefficients)
		this.setFreeSpinsMode(false)
		this.setupInteractivity()
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

		this.reelsViews[0].position.set(-80, 380)
		this.reelsViews[4].position.set(803, 380)
	}

	initGears(resources) {
		this.gearsView = new GearsView(resources)
		this.addChildAt(this.gearsView, 0)
	}

	initFrame(resources) {
		const backgroundWidth = CELL_WIDTH * 3
		const backgroundHeight = REELS_HEIGHT - 2 + 2
		const container = this.addChildAt(new Container, 0)
	
		// BACKGROUND...
		const backgroundView = this.addChildAt(new Sprite(resources.reels), 0)
		backgroundView.anchor.set(0.5)
		backgroundView.position.set(REELS_WIDTH / 2, REELS_HEIGHT / 2 + 55)
		this.frameView = backgroundView
		// ...BACKGROUND

		// FOREGROUND FREE SPINS...
		const freeSpinsFrameView = this.addChildAt(new Sprite(resources.reels_free_spins), 1)
		freeSpinsFrameView.anchor.set(0.5)
		freeSpinsFrameView.position.set(REELS_WIDTH / 2, REELS_HEIGHT / 2 + 55)
		this.freeSpinsFrameView = freeSpinsFrameView
		// ...FOREGROUND FREE SPINS


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
	}

	initWinLinesPool(resources, winLinesTopologies) {
		const poolView = new WinLinesPoolView(resources, winLinesTopologies)
		this.winLinesPoolView = this.addChild(poolView)
	}

	initFreeSpinsCounter(
		resources,
		dictionary
	) {
		const indicatorView = new CounterView({
			resources,
			headerText: dictionary.spins_left_bmp
		})
		indicatorView.position.set(22, 680)
		indicatorView.scale.set(0.91)
		this.freeSpinsCounterView = this.addChild(indicatorView)
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
			.set(REELS_WIDTH / 2, REELS_HEIGHT / 2)
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
		const { payoutsInfoPanelView } = this
		const interactiveView = this
			.addChild(new Graphics)
			.beginFill(0xFFFFFF, 0.00001)
			.drawRect(CELL_WIDTH, 0, CELL_WIDTH * 3, CELL_HEIGHT)
			.endFill()
		
		interactiveView.cursor = 'pointer'
		interactiveView.eventMode = 'static'
		interactiveView.on('pointerdown', ({global}) => {
			if (payoutsInfoPanelView.capturedSymbolView)
				return payoutsInfoPanelView.hide()

			const {x, y} = this.toLocal(global)

			const cellX = Math.trunc(x / CELL_WIDTH)
			const cellY = Math.trunc((y - interactiveView.y) / CELL_HEIGHT)
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
		this.presentExpansion({})
	}

	updateTargetArea(sidesRatio) {
		const {
			isFreeSpinsMode,
			isMobileDevice,
		} = this

		this.payoutsInfoPanelView.hide()

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
	}

	setBrightness({ key, map, brightness }) {
		super.setBrightness({ key, map, brightness })
		this.blackoutView.alpha = 1 - brightness
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
	}

	// API...
	reset() {
		super.reset()
		this.winTabloidView.reset()
		this.setInteractive(false)
	}

	async presentIntro() {
		const initialReels = this.getCurrentSymbolsIds()
		// this.placeholdersTableView.setVisible([1, 1, 1, 1, 1, 1, 1]) 
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

		await this
			.timeline
			.addAnimation({
				duration: this.timeline.duration,
				onStart: _ => this.gearsView.play(),
				onProgress: progress => {
					const subProgress = Math.sin(Math.PI * progress)

					this.camera
						.focus({
							view: this,
							offsetX: REELS_WIDTH / 2,
							offsetY: REELS_HEIGHT / 2 + 500 * subProgress,
						})
						.setZoom(1 + 0.05 * subProgress)
				},
				onFinish: _ => this.gearsView.pause(),
			})
			.play()

		this.presentExpansion({
			length: 3,
			forcePresent: true
		})
	}

	async presentExpansion({
		length = MINIMAL_REGULAR_REEL_LENGTH,
		forcePresent
	}) {
		await super.presentExpansion({length, forcePresent})

		const { interactiveView } = this
		if(!interactiveView) return

		interactiveView.scale.y = length
		interactiveView.y = this.reelsViews[1].y
		this.payoutsInfoPanelView.y = interactiveView.y
	}

	refreshPayoutsInfo(bet) {
		this.payoutsInfoPanelView.setBet(bet)
	}

	setTimeScale(scale) {
		super.setTimeScale(scale)
		this.cameraTimeline.setTimeScaleFactor({name: 'scale', value: scale})
		this.winTabloidView.setTimeScale(scale)
		this.freeSpinsCounterView.setTimeScale(scale)
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
		const {
			timeline,
			winLinesPoolView,
			winLinesTopologies,
			isFreeSpinsMode,
		} = this

		// WIN MAPS SETUP...
		const winMaps = []
		const commonWinMap = [[], [], []]
		winLines.forEach(({lineIndex, symbolId}) => {
			const topology = winLinesTopologies[lineIndex]
			const winMap = []

			for (let x = 0; x < 3; x++) {
				winMap[x] = []
				for (let y = 0; y < 7; y++) {
					const isMatchingSymbol = reels[x + 1][y] === symbolId
					const isWinPosition = topology[x] === y
					winMap[x][y] = (isWinPosition && isMatchingSymbol) ? 1 : 0
					commonWinMap[x][y] = commonWinMap[x][y] || winMap[x][y]
				}
			}

			winMaps.push(winMap)
		})
		// ...WIN MAPS SETUP

		winLinesPoolView.y = this.reelsViews[1].y
		timeline.deleteAllAnimations()

		// ALL LINES TOGETHER...
		totalPayout
		&& (isFreeSpinsMode || winLines.length > 1)
		&& timeline
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

					winLines.forEach(({lineIndex}, i) =>
						winLinesPoolView.presentWinLine({
							lineIndex: i,
							winLineIndex: lineIndex,
							progress
						}))

					this.winTabloidView.presentPayout(totalPayout, progress)
				}
			})
		// ...ALL LINES TOGETHER

		// EACH LINE SEPARATELY...
		const delay = timeline.duration
		isFreeSpinsMode
		|| winLines.forEach(({
			lineIndex,
			payout
		}, i) => {
			timeline
			.addAnimation({
				delay: i * 1000 + delay,
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

					winLinesPoolView.presentWinLine({
						lineIndex: i,
						winLineIndex: lineIndex,
						progress
					})

					this.winTabloidView.presentPayout(payout, progress)
				}
			})
		})
		// ...EACH LINE SEPARATELY

		return timeline.play()
	}

	setFreeSpinsMode(isFreeSpinsMode = true) {
		this.isFreeSpinsMode = isFreeSpinsMode
		this.frameView.visible = !isFreeSpinsMode
		this.freeSpinsFrameView.visible = isFreeSpinsMode
		this.onResize()
	}

	async presentFreeSpinsAward({
		freeSpinsCount,
		isHarvestingRequired = false
	}) {
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
							offsetX: REELS_WIDTH / 2,
							offsetY: REELS_HEIGHT / 2,
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
		return this.freeSpinsCounterView.presentRemainingSpinsCount(freeSpinsCount)
	}

	async presentSpinStart({
		lockedReelsIndexes = [],
		lockedSymbolId,
		freeSpinsCount,
	}) {
		if(this.timeline.isPlaying)
			this.timeline.wind(1)

		// CAMERA...
		this.cameraTimeline
			.deleteAllAnimations()
			.addAnimation({
				duration: 10000,
				onProgress: (progress) => {
					this.camera
						.focus({
							view: this,
							offsetX: REELS_WIDTH / 2,
							offsetY: REELS_HEIGHT / 2,
						})
						.setZoom(1 + 0.2 * progress)
				}
			})
			.play()
		// ...CAMERA

		this.gearsView.play()
		await this.payoutsInfoPanelView.hide()

		return Promise.all([
			super.presentSpinStart({lockedReelsIndexes, lockedSymbolId}),
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
							offsetX: REELS_WIDTH / 2,
							offsetY: REELS_HEIGHT / 2,
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

		this.gearsView.pause()
	}
	// ...API
}