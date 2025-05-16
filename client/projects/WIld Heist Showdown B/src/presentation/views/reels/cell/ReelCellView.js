import { Container, Sprite } from 'pixi.js'
import { CELL_HEIGHT, CELL_WIDTH, POSSIBLE_REELS_SYMBOLS, REELS_LENGTHS, REELS_OFFSETS, SCATTER_SYMBOL_ID } from '../../../Constants'
import { Timeline } from '../../../timeline/Timeline'
import { SafeView } from './safe/SafeView'

import { colorToColor } from '../../GraphicalPrimitives'
import { Base2DSymbolView } from './symbols/Base2DsymbolView'
import { SpineView } from '../../SpineView'

export class ReelCellView extends Container {
	contentContainer

	symbolsViews = []
	safeView
	currentSymbolId

	timeline = new Timeline
	corruptionTimeline = new Timeline
	cascadeTimeline = new Timeline
	featureTimeline = new Timeline
	isSecured = false
	reelIndex
	blurProgress = 0

	constructor({
		possibleSymbolsIds = POSSIBLE_REELS_SYMBOLS[1],
		assets,
		vfxLevel,
		isSecurable = false,
		reelIndex = 0,
		isPayable = true
	}) {
		super()

		this.reelIndex = reelIndex
		this.contentContainer = this.addChild(new Container)
		this.initSymbols({possibleSymbolsIds, assets, vfxLevel})
		isPayable && this.initWinBox(assets)
		isSecurable && this.initSafe(assets, vfxLevel)
		this.setSecured(false)
		this.initSpine(assets)
	}

	initSymbols({possibleSymbolsIds, assets, vfxLevel}) {
		
		possibleSymbolsIds.forEach(id => {
			let symbolView

			switch (id) {
				case 0:
					symbolView = new Container()
					symbolView.setVisible = () => {}
					symbolView.setBlur = () => {}
					symbolView.setUnblur = () => {}
					symbolView.setSymbolFall = () => {}
					symbolView.reset = () => {}
					symbolView.setBrightness = () => {}
					symbolView.update = () => {}
				break
				default:
					symbolView = new Base2DSymbolView(id, assets);
				break
			}

			this.symbolsViews[id] = this.contentContainer.addChild(symbolView)
		})
		
	}

	initSpine(assets) {
		const explosionBottomSpineView = new SpineView (assets.explosion_bottom);
		this.explosionBottomSpineView = explosionBottomSpineView;
		this.addChild(explosionBottomSpineView)

		this.addChildAt(explosionBottomSpineView, 0)

		const explosionUpSpineView = new SpineView (assets.explosion_up);
		this.explosionUpSpineView = explosionUpSpineView;
		this.addChildAt(explosionUpSpineView, 2)
	}

	playAnimation() {
		const scaleDescriptor = {timeScale: 1}
		this.explosionBottomSpineView?.setTimeScale(scaleDescriptor)
		this.explosionUpSpineView?.setTimeScale(scaleDescriptor)

		this.explosionUpSpineView.playAnimation({
			name: "boom",isLoopMode: false})

		this.explosionBottomSpineView.playAnimation({
			name: "boom",isLoopMode: false})

	}

	initWinBox(assets) {
		const view = new Sprite(assets.win_box)
		view.anchor.set(0.5)
		view.alpha = 0

		this.winBoxView = view

		this.contentContainer.addChild(view)
	}

	

	initSafe(assets, vfxLevel) {
		this.safeView = this.addChild(new SafeView(assets, vfxLevel))
		this.safeView.pivot.set(CELL_WIDTH / 2, CELL_HEIGHT / 2)
		this.safeView.attach(this)
	}

	getSymbolView(symbolId = this.currentSymbolId) {
		const { symbolsViews } = this

		return symbolsViews[Math.abs(symbolId)]
	}

	onPreRendered() {
		this.symbolsViews.forEach((view) => view.setVisible(false))
        this.presentSymbol(this.currentSymbolId)
	}

	// API...
	reset() {
		this.symbolsViews.forEach(view => view.reset())
	}


	adjustDistortion(offsetY = 0) {
	}

	adjustLowVFXDistortion(offsetY = 0) {
		const {reelIndex} = this
		const view = this.safeView ?? this.getSymbolView()

		const rollProgress = (
			this.y
			+ view.y
			+ CELL_HEIGHT
			+ offsetY
		) / ((REELS_LENGTHS[reelIndex] + 1.5) * CELL_HEIGHT)

		// view.visible = rollProgress > 0.05 && rollProgress < 0.95
	}

	preRenderSymbols() {
        this.symbolsViews.forEach((view) => view.setVisible(true));
    }

	setTimeScale(scale) {
		const scaleDescriptor = {name: 'scale', value: scale}
		this.corruptionTimeline.setTimeScaleFactor(scaleDescriptor)
		this.cascadeTimeline.setTimeScaleFactor(scaleDescriptor)
		this.featureTimeline.setTimeScaleFactor(scaleDescriptor)

		for(const view of this.symbolsViews)
			view?.setTimeScale?.(scale)
	}

	skipWinBoxes() {
		const scaleDescriptor = {timeScale: 5}
		this.explosionBottomSpineView?.setTimeScale(scaleDescriptor)
		this.explosionUpSpineView?.setTimeScale(scaleDescriptor)
	}

	setBlur(progress) {
		this.blurProgress = progress
		this.getSymbolView().setBlur()
	}

	setUnblur() {

		//this.getSymbolView().setUnblur()
	}
	setSymbolFall() {

		this.getSymbolView().setSymbolFall()
	}

	randomizeIdleOffset() {
		this.getSymbolView().randomizeIdleOffset?.()
	}

	getBrightness() {
		return this.getSymbolView()?.brightness ?? 1
	}

	setBrightness(brightness = 1) {
		this.symbolsViews.forEach(view => view.setBrightness(brightness))
		
		// this.getSymbolView()?.setBrightness(brightness)
		this.safeView?.setBrightness(brightness)
	}

	setGlowIntensity(progress) {
		this.symbolsViews.forEach(view => view.flameIntensity = progress)
	}

	setIdleFactor(idleFactor = 1) {
		this.symbolsViews.forEach(view => view.idleFactor = idleFactor)
	}

	presentSymbol(symbolId) {
		const previousSymbolView = this.getSymbolView()
		previousSymbolView?.setVisible(false)

		const nextSymbolView = this.getSymbolView(symbolId)
		nextSymbolView.wind
		nextSymbolView.setVisible()
		//nextSymbolView?.setBlur()
		this.currentSymbolId = symbolId
		this.alpha = 1
		nextSymbolView.scale.set(1)
		nextSymbolView.y = 0
		nextSymbolView.alpha = 1
		nextSymbolView.featureSpinProgress = 0
		if(this.winBoxView) {
			this.winBoxView.alpha = 0
		}

		this.setSecured(symbolId < 0)
	}

	presentScatterTeasing() {
	/*	if (this.currentSymbolId !== SCATTER_SYMBOL_ID)
			return

		const symbolView = this.getSymbolView(SCATTER_SYMBOL_ID)
		
		return this
			.featureTimeline
			.deleteAllAnimations()
			.addAnimation({
				duration: 500,
				onProgress: (progress) => {
					symbolView.presentTeasing(progress)
				}
			})
			.play()
			*/
	}

	presentScatterWin() {
		const symbolView = this.getSymbolView(SCATTER_SYMBOL_ID)

		return this
			.featureTimeline
			.deleteAllAnimations()
			.addAnimation({
				duration: 500,
				onProgress: (progress) => {
					symbolView.presentSpecialWin(progress)
				}
			})
			.play()
	}

	presentWinBox() {
		if(!this.winBoxView) return
		
		this.winBoxView.position.set(
			this.y + REELS_OFFSETS[this.reelIndex] * CELL_HEIGHT + 25
		)
		this.x + this.reelIndex * CELL_WIDTH,
		this.playAnimation()

	}

	presentCorruption({isSecured = this.isSecured, isPaying = true}) {
		this.reset()

		if(isSecured) {
			return this
				.corruptionTimeline
				.deleteAllAnimations()
				.addAnimation({
					duration: 1000,
					onProgress: progress => {
						this.safeView.presentSubstitution(progress)
					}
				})
				.play()
		}

		return this
			.corruptionTimeline
			.deleteAllAnimations()

			.addAnimation({
				duration: 1500,
				
				onProgress: (progress) => {
					const regress = 1 - progress
					const symbolView = this.getSymbolView()
					symbolView.presentWin(progress)
					
					const spinProgress = (Math.max(0, (progress - 0.75)) / 0.25) ** 2

					symbolView.featureSpinProgress = 
					(
						this.reelIndex % 2
							? -spinProgress
							: spinProgress
					) * 0.5

				}
			})
			.addAnimation({
				delay: 1000,
				onStart: () => {
					this.presentWinBox()
				},
				duration: 300,
				onProgress: (progress) => {
					this.getSymbolView().y = 10 * progress ** 3
					this.getSymbolView().alpha = 1 - progress ** 3
				},
				// onFinish: this.getSymbolView().setVisible(false)
				
			})
			.play()
	}

	update(progress) {
		this.symbolsViews.forEach(view => view.update?.(progress))
		this.getSymbolView()?.update(progress)
		this.safeView?.update(progress)
	}

	presentSubstitution({ 
		progress, 
		symbolId,
		targetSymbolId
	}) {
		this.presentSymbol(symbolId)

		const symbolView = this.getSymbolView(symbolId)
		const targetSymbolView = this.getSymbolView(targetSymbolId)

		symbolView.setVisible(false)
		symbolView.alpha = 1
		symbolView.presentWin(progress)

		targetSymbolView.setVisible(true)
		targetSymbolView.alpha = progress
		targetSymbolView.setSymbolFall() 
		targetSymbolView.presentWin(progress)

		if (progress >= 1) {
			symbolView.setVisible(false)
			this.presentSymbol(targetSymbolId)
		}
	}

	presentFallIn({
		symbolId = 0,
		distance = 0,
		idleProgressOffset = 0,
		delay = 1,
	}) {

		if(!distance) return

		const symbolView =  this.getSymbolView(symbolId)
		const fallingView = this.safeView ?? symbolView
		const finalDistance = distance * CELL_HEIGHT
		const fallDuration = Math.min(350, distance * 100)
		symbolView.idleProgressOffset = idleProgressOffset

		this.presentSymbol(symbolId)
		fallingView.y = -finalDistance
		//this.setBlur()	
		this.update()
		
		this.adjustDistortion()
		

		return this
			.cascadeTimeline
			.deleteAllAnimations()
			.addAnimation({
				delay,
				duration: fallDuration,
				onProgress: (progress) => {
					
					fallingView.y = -finalDistance * (1 - progress ** 2)
					this.update()
						
					this.adjustDistortion()

				}
			})
			.addAnimation({
				delay: fallDuration + delay,
				duration: 350,
				onDelayFinish: () => {
					this.onFallIn?.()
					// this.getSymbolView().presentIdle()
				},
				onProgress: (progress) => {
					const subProgress = Math.sin(Math.PI * progress)
					
					fallingView.y = subProgress * -CELL_HEIGHT * 0.25
					this.setUnblur()	
					this.setSymbolFall(progress)
					this.adjustDistortion()
				}
			})
			.play()
	}

	setSecured(isSecured = true) {
		this.isSecured = isSecured
		this.safeView?.setVisible(isSecured)
		this.safeView?.reset()
	}

	isIdling() {
		//return this.getSymbolView().isIdling()
	}
	// ...API
}
