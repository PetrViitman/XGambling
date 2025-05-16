import { Container, Graphics, Sprite } from "pixi.js"
import { BaseReelsView } from "./BaseReelsView"
import { PayoutsInfoPanelView } from "./PayoutsInfoPanelView"
import { Timeline } from "../../timeline/Timeline"
import {
	CELL_HEIGHT,
	CELL_WIDTH,
	REELS_COUNT,
	REELS_HEIGHT,
	REELS_LENGTHS,
	REELS_OFFSETS,
	REELS_WIDTH,
	SCATTER_SYMBOL_ID,
	SYMBOLS_IDS,
	WILD_SYMBOL_ID,
	WIN_COEFFICIENTS,
} from "../../Constants"
import { FreeSpinsIndicatorView } from "./FreeSpinsIndicatorView"
import { getRandomLoseReels } from "../../Utils"
import { MultiplierView } from "./MultiplierView"
import { PayoutView } from "./payout/PayoutView"
import { TensionPoolView } from "./tension/TensionPoolView"


import { AdaptiveContainer } from "../adaptiveDesign/AdaptiveContainer"
import { TensionView } from "./tension/TensionView"
import { InfoBaseView } from "../GUI/indicators/infoBar/InfoBaseView"


//import { MultiplierDigitsView } from "./MultiplierDigitsView"


export class ReelsView extends BaseReelsView {
	interactiveView
	payoutsInfoPanelView
	commonFreeSpinsPayoutIndicatorView
	blackoutView
	isMobileDevice
	idleTimeline = new Timeline
	cameraTimeline = new Timeline
	camera
	assets
	delayTimeline = new Timeline
	featureTimeline = new Timeline
	freeSpinsModeViews = []
	defaultGameModeViews = []
	isFreeSpinsMode
	targetSymbolsIds
	freeSpinsIndicatorView
	fallenScattersCount
	boardMGSprite;
	boardFSSprite;
	infoBaseView;
	sprite;

	constructor({
		initialSymbolsIds,
		assets,
		infoBaseView,
		dictionary,
		coefficients,
		vfxLevel,
		isMobileDevice,
		camera,
		audio
		
	}) {
		super({
			initialSymbolsIds,
			assets,
			vfxLevel,
			audio
			
		})

		this.camera = camera
		this.isMobileDevice = isMobileDevice
		this.dictionary = dictionary
		this.coefficients = coefficients
		
		
		this.initBoardView(assets);

		
		this.initFreeSpinsIndicator(assets, dictionary)
		
		this.initIdleTimeline()
		this.initMask(assets);
		this.setupInteractivity()
		this.bringForegroundElementsToFront()
		
		
		
		this.contentContainer.addChildAt(this.maskedContainer,6)
		this.maskedContainer.position.set(0,-270)
		this.contentContainer.addChildAt(this.reelsContainer,7)
		this.contentContainer.pivot.set(this.contentContainer.width/2, this.contentContainer.height/2)
		
		this.reelsContainer.position.set(100,140)

		this.contentContainer.position.set(this.contentContainer.width/2-80, this.contentContainer.height/2+500)
		this.initInfoBaseView(assets, dictionary)
		this.setMasked()
		this.initTension(assets, vfxLevel)
		this.initPayout(assets)
		this.initMultiplier(assets)
		this.initMultiplierLampView(assets)
		this.setFreeSpinsMode()
		this.initPayoutsInfoPanel(assets, coefficients)
		
	}


	initBoardView(assets) {

		this.boardContainer = this.addChild(new Container());
		
		this.boardContainer.position.set(0,-290);
		this.boardContainer.scale.set(1)

		this.backMG1 = new Sprite(assets.backMG1);
		this.backMG2 = new Sprite(assets.backMG1);
		this.backMG2.scale.set(-1,1)
		this.backMG2.position.set(0,0)
		this.backMGscull = new Sprite(assets.backMGscull);
		this.backMGscull.position.set(-320,-70)
		this.backMGl = new Sprite(assets.backMGl);
		this.backMGl.position.set(-950,2660)
		this.backMGr = new Sprite(assets.backMGr);
		this.backMGr.position.set(570,2660)
		this.archContainer = new Container()
		
		//this.addChildAt(this.background,0)

		this.archContainer.addChild(this.backMG1)
		this.archContainer.addChild(this.backMG2)
		
		this.archContainer.addChild(this.backMGl)
		this.archContainer.addChild(this.backMGr)
		this.archContainer.addChild(this.backMGscull)
		this.archContainer.position.set(730,-920)

		const fadeSprite = new Sprite(assets.symbolsMask2)
		fadeSprite.tint = 0x000000
		this.fadeSprite = fadeSprite
		this.fadeSprite.alpha=0

		this.boardMGSprite = new Sprite(assets.board);
		this.boardFSSprite = new Sprite(assets.boardFS);

		this.backFS1 = new Sprite(assets.backFS1);
		this.backFS1.position.set(100,1220)

		this.boardMGSprite.visible = true;
		this.backMG1.visible = true;
		this.backMG2.visible = true;
		this.backMGscull.visible = true;
		this.backMGl.visible = true;
		this.backMGr.visible = true;

		//this.background.visible = true;
    	this.boardFSSprite.visible = false;
		this.backFS1.visible = false;
		
		
		this.boardContainer.addChild(this.boardMGSprite);
		this.boardContainer.addChild(this.boardFSSprite);
		this.boardContainer.addChild(this.fadeSprite)
		this.boardContainer.addChild(this.backFS1);
	  
		this.boardContainer.addChild(this.boardContainer);
	  	
		this.contentContainer.addChild(this.archContainer)  
		this.contentContainer.addChild(this.boardContainer)

	  }


	initMask(assets) {
		const container = this.contentContainer.addChild(new Container)
		this.maskedContainer = container
		const view = new Sprite(assets.symbolsMask2)
		container.mask = view
		this.maskView = container.addChild(view)
	}

	setMasked(isMasked = true) {
		const { cellsViews } = this;
	
		for (let x = 0; x < REELS_COUNT; x++) {
			cellsViews[x][0].visible = isMasked;
			cellsViews[x][cellsViews[x].length - 1].visible = isMasked;
		}
		/*if (isMasked) {
			this.maskedContainer.addChild(this.reelsContainer,5);
		} else {
			this.contentContainer.addChildAt(this.reelsContainer,8);
		}*/
	}

	initTension(assets, vfxLevel) {
		if (vfxLevel < 0.15) return

		const tensionPoolView = new TensionPoolView(assets)
		tensionPoolView.position.set(REELS_WIDTH / 2)
		this.tensionPoolView = this.contentContainer.addChild(tensionPoolView)
		this.reelsViews.forEach((view, i) => {
			view.tensionView = tensionPoolView.tensionsViews[i]
		})

	}

	initInfoBaseView(assets){
		const infoBaseView = new InfoBaseView(assets, this.dictionary)
		this.infoBaseView = infoBaseView
		this.infoBaseView.position.set(75, 1070)
		this.contentContainer.addChild(infoBaseView)	
		this.infoBaseView = infoBaseView
	}
	
	initMultiplier(assets) {
		const view = new MultiplierView(assets)
		view.position.set(750, -350)
		this.multiplierView = this.contentContainer.addChildAt(view,7)
	}
	
	initMultiplierLampView(assets) {

		this.multiplierLampContainer = this.addChild(new Container());
		this.multiplierLampContainer.position.set(720,-100);
	
		this.multiplierLamp1 = new Sprite(assets.lampFSGame);
		this.multiplierLamp1.anchor.set(0.5)
		this.multiplierLamp1.x = 510;
		this.multiplierLamp1On = new Sprite(assets.lampOnFSGame);
		//this.multiplierLamp1On.blendMode = BLEND_MODES.ADD
		this.multiplierLamp1On.anchor.set(0.5)
		this.multiplierLamp1On.x = 510;
		
		this.multiplierLamp2 = new Sprite(assets.lampFSGame);
		this.multiplierLamp2.anchor.set(0.5)
		this.multiplierLamp2.scale.set(-1, 1)
		this.multiplierLamp2.x = -510;
		this.multiplierLamp2On = new Sprite(assets.lampOnFSGame);
		//this.multiplierLamp2On.blendMode = BLEND_MODES.ADD
		this.multiplierLamp2On.anchor.set(0.5)
		this.multiplierLamp2On.scale.set(-1, 1)
		this.multiplierLamp2On.x = -510;

   
		this.multiplierLampContainer.addChild(this.multiplierLamp1);
		this.multiplierLampContainer.addChild(this.multiplierLamp2);
		this.multiplierLampContainer.addChild(this.multiplierLamp1On);
		this.multiplierLampContainer.addChild(this.multiplierLamp2On);

		
	  	this.contentContainer.addChild(this.multiplierLampContainer)
	}

	initIdleTimeline() {
		
		this.idleTimeline
			.addAnimation({
				duration: 5000,
				onProgress: progress => {
					this.reelsViews.forEach(reelView => {
						reelView.cellsViews.forEach(view => {
							view.update(progress)
						})
					})
				}
			})
			.setLoopMode()
			.play()
	}

	initPayout(assets) {
		const payoutView = this.contentContainer.addChild(new PayoutView(assets))
		payoutView.position.set(REELS_WIDTH / 2 + 150, REELS_HEIGHT)
		this.payoutView = payoutView
	}

	initPayoutsInfoPanel(assets, coefficients) {
		this.payoutsInfoPanelView = this.contentContainer.addChildAt(
			new PayoutsInfoPanelView({
				assets: this,
				reelsView: this,
				coefficients,
				camera: this.camera
			}),8)

		this.payoutsInfoPanelView.x = this.reelsContainer.x
		this.payoutsInfoPanelView.y = 0
	}

	initFreeSpinsIndicator(
		assets,
		dictionary
	) {

		const indicatorView = new FreeSpinsIndicatorView(assets, dictionary)
		indicatorView.y = 90
		this.freeSpinsIndicatorView = this.contentContainer.addChild(indicatorView)
		this.freeSpinsModeViews.push(indicatorView)
		this.freeSpinsIndicatorView.alpha = 0
	}

	setupInteractivity() {
		const { payoutsInfoPanelView } = this
		const interactiveView = this
			.reelsContainer
			.addChild(new Graphics)
			.beginFill(0xFFFFFF, 0.0001)
			.drawRect(0, 0, REELS_WIDTH, REELS_HEIGHT)
			.endFill()

		interactiveView.cursor = 'pointer'
		interactiveView.eventMode = 'static'
		interactiveView.addEventListener('pointerdown', ({global}) => {
			if (this.payoutsInfoPanelView.capturedSymbolView)
				return this.payoutsInfoPanelView.hide()

			const {x, y} = interactiveView.toLocal(global)
			const reelIndex = Math.trunc(x / CELL_WIDTH)
			const offsetY = REELS_OFFSETS[reelIndex]
			const cellX = Math.trunc(x / CELL_WIDTH)
			const cellY = Math.trunc(y / CELL_HEIGHT + 1 - offsetY)

			if (cellY <= 0 || cellY > REELS_LENGTHS[reelIndex]) return

			const cellView = this.reelsViews[cellX].cellsViews[cellY]

			this.payoutsInfoPanelView.presentPayouts({
				capturedSymbolView: cellView.getSymbolView(),
				x: cellX,
				y: cellY + offsetY - 1,
				symbolId: cellView.currentSymbolId
			})

		})
		this.interactiveView = interactiveView
		this.setInteractive(false)
	}
    updateTargetArea() {
        this.setTargetArea({x: 0, y: 0, width: 1, height: 1})
            .setSourceArea({
                width: 1290, 
                height: 2796  
            })
    }

	bringForegroundElementsToFront() {
			this.cellsViews.forEach((reel, x) => reel.forEach((cellView, y) => {
				const {winBoxView} = cellView
				if(!winBoxView) return

				this.contentContainer.addChild(winBoxView)
			}))
	}

	// API...
	setBrightness({ key, map, brightness }) {
		super.setBrightness({ key, map, brightness })
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
	}

	setInteractive(isInteractive = true) {
		this.interactiveView.visible = false//isInteractive
	}

	presentRandomSymbols() {
		getRandomLoseReels().forEach((reel, x) =>
			reel.forEach((symbolId, y) => {
				this.cellsViews[x][y + 1].presentSymbol(symbolId)
				this.cellsViews[x][y + 1].adjustDistortion()
			}))
	}

	reset() {
		super.reset()
		this.setInteractive(false)
	}

	presentIntro() {

		this.multiplierView.presentIntro()
		this.infoBaseView.presentIntro()
		return this.cameraTimeline
			.deleteAllAnimations()
			.addAnimation({
				duration: 1000,
				easing: "easeInBack",
				onProgress: (progress) => {
					this.contentContainer.scale.set(0.9 + 0.1 * progress);
				}
			})
			.play()
			
		}
		// ...CAMERA
		
	refreshPayoutsInfo(bet) {
		this.payoutsInfoPanelView.setBet(bet)
	}

	setTimeScale(scale) {
		super.setTimeScale(scale)
		this.cameraTimeline.setTimeScaleFactor({name: 'scale', value: scale})
		this.delayTimeline.setTimeScaleFactor({name: 'scale', value: scale})
		this.featureTimeline.setTimeScaleFactor({name: 'scale', value: scale})
		this.freeSpinsIndicatorView.setTimeScale(scale)
		this.multiplierView.setTimeScale(scale)
	}

	skipWinBoxes() {
		this.cellsViews.forEach(reel => reel.forEach(cellView => cellView.skipWinBoxes()))
	}

	addSubWinAnimation({
		name,
		text = ''
	}) {
		this.infoBaseView.drop()
		this.infoBaseView.setSkin(name)

		const levelMap = {
			'base1': 0,
			'base2': 1,
			'base3': 2
		};
		this.infoBaseView.presentSpineInfoBottom(levelMap[name]);
		this.infoBaseView.presentSpineInfoUp(levelMap[name]);
	}

	async presentInfoSubWinPayout(multiplier) {
		this.infoBaseView.drop()
		if (multiplier <= 4) {
			this.infoBaseView.presentInfoBaseActiveView(true)
			await this.addSubWinAnimation({ name: 'base1' });
		} else if(multiplier >= 8 && multiplier < 12) {
			this.infoBaseView.presentInfoBaseActiveView(false)
			await this.addSubWinAnimation({ name: 'base2' });
		} else if(multiplier >= 12) {
			this.infoBaseView.presentInfoBaseActiveView(false)
			await this.addSubWinAnimation({ name: 'base3' });
		
		}else {
        	this.infoBaseView.presentWinChange()
		}
	}


	
	async presentCascade({
		payout,
		currencyCode = 'FUN',
		corruptionMap = [
			[0, 1, 0],
			[1, 0, 0, 0],
			[1, 1, 0, 0, 0],
			[0, 0, 0, 0, 0],
			[0, 0, 1, 0],
			[0, 0, 0],
		],
		patchMap,
		/*
		= [
			[1],
			[1],
			[1, 1],
			[],
			[1],
			[],
		],*/
		multiplier = 1,
		coefficient
	}) {
		this.infoBaseView.drop()
		// INFO BAR MESSAGE...
		const currentSymbolsIds = this.getCurrentSymbolsIds()
		const collapses = []
		SYMBOLS_IDS.forEach(symbolId => {


			for(let x = 0; x < corruptionMap.length; x++) {
				let winSymbolsPerReelCount = 0
				for(let y = 0; y < corruptionMap[x].length; y++) {
					const isWin = corruptionMap[x][y]
					const targetSymbolId = Math.abs(currentSymbolsIds[x][y])
					if(isWin && (targetSymbolId === symbolId || targetSymbolId === WILD_SYMBOL_ID)) {
						winSymbolsPerReelCount++
					}
				}

				if(winSymbolsPerReelCount) {
					collapses.push({
						symbolId,
						symbolsCount: winSymbolsPerReelCount
					})
				} else {
					break
				}
			}
		})

		
		// ...INFO BAR MESSAGE


	

		const {featureTimeline} = this
		featureTimeline


			.deleteAllAnimations()
			.addAnimation({

				duration: 1200,
				onProgress: progress => {
					if (!multiplier) return
					this.fadeSprite.alpha = 0.4 * Math.sin(Math.PI *  progress);
					
				},
			})
			.addAnimation({

				onStart: () => {
					this.presentLampFreeSpinsOn()
				},	
				delay: 200,
				duration: 1400,
				onProgress: progress => {
					if (!multiplier) return
					
					this.payoutView.presentIntro({
						payout: payout / multiplier,
						progress
					})
					
					
				},
			})
			.addAnimation({

				delay: 200,
				duration: 2400,
				onProgress: progress => {
					if (!multiplier) return
					
			
				},
			})

			.addAnimation({
				delay: 600,
				duration: 1050,
				onProgress: progress => {
					
					if (multiplier > 1) {
						this.multiplierView.presentMultiplier({
							multiplier,
							progress
						});
						
					}
				}
			})
			.addAnimation({
				onProgress: progress => {
					multiplier > 1 &&
					this.multiplierView.presentMultiplierTransition()
				}
			})

			.addAnimation({
				delay: 2250,
				duration: 0,
				onProgress: progress => {
					
					if (!payout) return
					this.payoutView.presentMultiplier({
						payout: payout / multiplier,
						multipliedPayout: payout,
						progress
					})
				
				},
				onFinish: () => {
					if (!payout) return
					this.presentInfoSubWinPayout(multiplier)
					
				}
			})


			.addAnimation({

				delay: 2250,
				duration: 700,
				onProgress: progress => {
					if (!multiplier) return
					
					this.payoutView.presentOutro({
						multipliedPayout: payout,
						progress
					}),
					
					
					this.multiplierView
						.presentShift({
							multiplier: multiplier * 2,
							progress: Math.min(1, progress * 3),
							isIncrementing: multiplier > 1
					})
				},

				onFinish: () => {
					this.payoutView.reset()
					this.presentLampFreeSpinsOff()
				}
			})

				
		return Promise.all([
			//this.infoBaseView.reset(),
			super.presentCascade({corruptionMap, patchMap, multiplier}),
			featureTimeline.play(),
		])
		
	}

	onReelPatched(reelIndex, cellIndex) {
		const {patchMap, audio, reelsViews} = this
		if(!patchMap) return
		
		if (patchMap[reelIndex][cellIndex] === SCATTER_SYMBOL_ID) {
			audio.presentScatter()
			this.cellsViews[reelIndex][cellIndex + 1].presentScatterTeasing()
		}
		

				// reelsViews[reelIndex].presentHit(cellIndex)
	}
	
	onReelStopHit(reelIndex) {
	}

	onFinalStop(reelIndex){

		if (!this.targetSymbolsIds ) {return}
		
		const scattersViews = []

		for (let x = 0; x <= reelIndex; x++){
			for (let y = 0; y < this.targetSymbolsIds[x].length; y++){
				if (this.targetSymbolsIds[x][y] === SCATTER_SYMBOL_ID) {
					scattersViews.push (this.reelsViews[x].cellsViews[y+1].getSymbolView())

				}
			}
		}

		const scatterMap = {1: 'idle', 2: "idle_fast"}

		const animationName = scatterMap [scattersViews.length] ?? "action"
		for (let i=0; i<scattersViews.length; i++ ){
			scattersViews[i].presentScatterAnimation(animationName)
		}

		
	}

	presentWin() {
		this.reset()
		this.setMasked(false)
	}

	async setFreeSpinsMode(isFreeSpinsMode = true) {
		this.reset();
	
		this.isFreeSpinsMode = isFreeSpinsMode;
	
		this.boardMGSprite.visible = !isFreeSpinsMode;
		this.boardFSSprite.visible = isFreeSpinsMode;
		
		this.backMG1.visible = !isFreeSpinsMode;
		this.backMG2.visible = !isFreeSpinsMode;
		this.backMGscull.visible = !isFreeSpinsMode;
		
		this.backMGl.visible = !isFreeSpinsMode;
		this.backMGr.visible = !isFreeSpinsMode;

		this.multiplierLamp1.visible = isFreeSpinsMode;
		this.multiplierLamp2.visible = isFreeSpinsMode;
		this.multiplierLamp1On.visible = isFreeSpinsMode;
		this.multiplierLamp1On.alpha = 0
		this.multiplierLamp2On.visible = isFreeSpinsMode;
		this.multiplierLamp2On.alpha = 0
		this.backFS1.visible = isFreeSpinsMode;

		if (isFreeSpinsMode) {
			this.multiplierView.presentFSMultiplier();
		}
		this.infoBaseView.presentIdle()
		this.freeSpinsIndicatorView.alpha = 1
		this.freeSpinsIndicatorView.presentRemainingSpinsCount() 
		if (!isFreeSpinsMode){this.freeSpinsIndicatorView.alpha = 0}
	}

	presentLampFreeSpinsOn (){
		this.multiplierLamp2On.alpha = 1
		this.multiplierLamp1On.alpha = 1
	}

	presentLampFreeSpinsOff (){
		this.multiplierLamp2On.alpha =  0
		this.multiplierLamp1On.alpha =  0
	}

	getScattersCount() {
		/*
		let scattersCount = 0

		this.cellsViews.forEach(reel => reel.forEach(view => {
			if (view.currentSymbolId === SCATTER_SYMBOL_ID) {
				scattersCount++
			}
		}))

		return scattersCount
		*/
	}

	async presentFreeSpinsAward(freeSpinsCount) {
		this.reset()

		
		return Promise.all([
			this.presentFreeSpinsCount(freeSpinsCount),
			this.cameraTimeline
				.deleteAllAnimations()
				.addAnimation({
					duration: 700,
					onProgress: (progress) => {
						this.contentContainer.scale.set(1 + 0.15 * Math.sin(Math.PI * progress));
					}
				})

				.addAnimation({
					duration: 1250,
					onProgress: (progress) => {

						const scatterProgress = (progress * 2) % 1

						this.cellsViews.forEach(reel => reel.forEach(view => {
							if(view.currentSymbolId === SCATTER_SYMBOL_ID) {
								view.getSymbolView().presentTeasing(scatterProgress)
								//view.presentWinBox(scatterProgress)
							}
						}))
					}
				})
				.play()
				
		])
	}

	async presentBonusGameFinish() {
		this.reset()
		this.freeSpinsIndicatorView.reset ()
		this.infoBaseView.presentIdle()
		return 	this.timeline
			.deleteAllAnimations()
			.addAnimation({
				duration: 700,
				onProgress: (progress) => {
					this.contentContainer.scale.set(1 + 0.15 * Math.sin(Math.PI * progress));
				}
			})
	}

		
		// ...CAMERA


	presentFreeSpinsCount(freeSpinsCount = 0) {
		return this.freeSpinsIndicatorView.presentRemainingSpinsCount(freeSpinsCount)
	}

	async presentSpinStart({
		lockedReelsIndexes = [],
		lockedSymbolId,
		freeSpinsCount = 0,
		multiplier = 1,
	}) {
		if(this.timeline.isPlaying)
			this.reset()
		
		this.infoBaseView.reset()
		this.featureTimeline.wind(1)
		


		await this.payoutsInfoPanelView.hide()

		return Promise.all([
			super.presentSpinStart({lockedReelsIndexes, lockedSymbolId}),
			this.presentFreeSpinsCount(freeSpinsCount),
			this.featureTimeline
				.deleteAllAnimations()
				.addAnimation({
					duration: 500,
					onProgress: progress => {
						this.multiplierView.presentOutro({
							minimalMultiplier: this.isFreeSpinsMode ? 8 : 1,
							multiplier,
							progress
						})
						
					}
				})
				
				.play()
		])

	}


	async presentSpinStop({
		targetSymbols,
		isBonusPurchased
	}) {

		if(!this.isSpinning()) return
		
		this.fallenScattersCount = 0

		const targetSymbolsIds = targetSymbols.map(reel => reel.map(symbol => symbol))
		let scattersCount = 0
		let delay = 0
		let totalStopDuration = 0

		this.targetSymbolsIds = targetSymbols.map(reel => reel.map(symbol => symbol))


		const promises = this.reelsViews.map((reelView, i) => {
			let isTensionReel = false
		
			if(i) {
				if (
					!this.isFreeSpinsMode
					&& scattersCount >= 2
				) {
					isTensionReel = true
					delay += 750
				} else {
					delay += 200
				}
			}
			reelView.isTensionReel = isTensionReel

			for(let y = 0; y < targetSymbolsIds[i].length; y++)
				if(targetSymbolsIds[i][y] === SCATTER_SYMBOL_ID)
					scattersCount++

			totalStopDuration += delay

			//if(isTensionReel && !isBonusPurchased) this.infoBarView.presentTension()
			//if(isTensionReel && !isBonusPurchased) this.infoBaseView.presentTension()

		// CAMERA...
			if(isTensionReel) {
				this.timeline
				.deleteAllAnimations()
				.addAnimation({
					duration: totalStopDuration+= delay,
					onProgress: (progress) => {
						// this.contentContainer.scale.set(1 - 0.3 * progress);
						this.fadeSprite.alpha = 0.4 * Math.sin(Math.PI *  progress);
					}

				})
				.play()
			}
		// ...CAMERA

			return reelView.presentSpinStop({
				cellsViews: this.cellsViews,
				symbolsIds: targetSymbolsIds[i],
				delay,
				tensionDuration: isTensionReel ? 1500 : 0,
				isBonusPurchased
			}) 
		})
		totalStopDuration *= 0.5
		await Promise.all(promises)

	this.timeline.deleteAllAnimations()
	
	
	}

	presentSymbolsSubstitution(symbolId) {
		const currentSymbolsIds = this.getCurrentSymbolsIds()

		const substitutionMap = {
			5: 11,
			6: 12,
			7: 13,
			8: 14,
		}

		const targetSymbolId = substitutionMap[symbolId]

		return this
			.featureTimeline
			.deleteAllAnimations()
			.addAnimation({
				duration: 300,
				onProgress: progress => {
					for (let x = 0; x < currentSymbolsIds.length; x++) {
						for (let y = 0; y < currentSymbolsIds[x].length; y++) {
							if (currentSymbolsIds[x][y] === symbolId) {
								this.cellsViews[x][y + 1]
									.presentSubstitution({
										symbolId,
										targetSymbolId,
										progress
									})
							}
						}
					}
				}
			})
			.play()
	}

	hidePayoutsInfo() {
		return this.payoutsInfoPanelView.hide()
	}

	reset() {
		this.timeline.wind(1).deleteAllAnimations()
		this.cellsViews.forEach(reel => reel.forEach(view => view.reset()))
		this.setBrightness({brightness: 1})
		this.fadeSprite.alpha=0
		
		
	}

	setFlip(flipProgress) {
	}


	
}