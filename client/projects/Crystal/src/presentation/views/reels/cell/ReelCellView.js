import { Container } from 'pixi.js'
import { CELL_HEIGHT, CELL_WIDTH, POSSIBLE_REELS_SYMBOLS } from '../../../Constants'
import { Timeline } from '../../../timeline/Timeline'
import { SymbolView } from './symbols/SymbolView'

export class ReelCellView extends Container {
	symbolsViews = []
	symbolsMap = {}
	substitutionEffectView
	currentSymbolId
	blurStrength
	timeline = new Timeline
	corruptionTimeline = new Timeline
	cascadeTimeline = new Timeline
	featureTimeline = new Timeline
	isSecured = false

	constructor({
		possibleSymbolsIds = POSSIBLE_REELS_SYMBOLS[1],
		assets,
	}) {
		super()
		this.initSymbols({possibleSymbolsIds, assets})
	}

	initSymbols({possibleSymbolsIds, assets}) {
		possibleSymbolsIds.forEach(id => {
			const symbolView = new SymbolView(id, assets)
			symbolView.visible = false
			symbolView.position.set(CELL_WIDTH / 2, CELL_HEIGHT / 2)

			this.symbolsViews.push(symbolView)
			this.symbolsMap[id] = symbolView
			this.addChild(symbolView)
		})
	}

	getSymbolView(symbolId = this.currentSymbolId) {
		const { symbolsMap } = this

		return symbolsMap[symbolId]
	}

	onPreRendered() {
		this.symbolsViews.forEach((view) => view.setVisible(false))
        this.presentSymbol(this.currentSymbolId)
	}

	// API...
	reset() {
		this.symbolsViews.forEach(view => view.reset())
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

	setBlur(strength = 1) {
		this.blurStrength = strength
		
		this.getSymbolView().setBlur(strength)
	}

	randomizeIdleOffset() {
		this.getSymbolView().randomizeIdleOffset?.()
	}

	setBrightness(brightness = 1) {
		this.getSymbolView()?.setBrightness(brightness)
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
		nextSymbolView.setVisible()
		nextSymbolView?.setBlur(this.blurStrength)
		this.currentSymbolId = symbolId
		this.alpha = 1
	}

	presentSubstitution({
		progress = 1,
		currentSymbolId,
		targetSymbolId,
	}) {
		if (currentSymbolId === targetSymbolId) return
		const floatingProgress = Math.sin(Math.PI * progress)
		const symbolView = this.getSymbolView(currentSymbolId)
		const targetSymbolView = this.getSymbolView(targetSymbolId)

		const idleFactor = (1 - Math.min(1, floatingProgress * 2))
		symbolView.idleFactor = idleFactor
		targetSymbolView.idleFactor = idleFactor

		if(progress < 0.5) {
			const subProgress = progress / 0.5
			this.presentSymbol(currentSymbolId)
			symbolView.presentationFlipProgress = ((subProgress * 1.25) ** 2) % 1
		} else {
			const subProgress = (progress - 0.5) / 0.5
			this.presentSymbol(targetSymbolId)
			targetSymbolView.presentationFlipProgress = 0.25 + subProgress * 0.75
		}

		this.substitutionEffectView.present(Math.max(0, (progress - 0.25) / 0.75))
	}

	presentCorruption() {
		this.reset()

		const symbolView = this.getSymbolView()

		const scaleOffset = 0.05 + 0.1 * Math.random()
		const skew = 0.1 + 0.15 * Math.random() * (Math.random() > 0.5 ? -1: 1)
		const pivotXOffset = 5 + 20 * Math.random() * (Math.random() > 0.5 ? -1: 1)
		const pivotYOffset = 10 + 20 * Math.random() * (Math.random() > 0.5 ? -1: 1)
		

		this.bubblesBurstView?.presentSymbolCorruption(this.currentSymbolId)
		symbolView?.presentCorruption()
		
		return this
			.corruptionTimeline
			.deleteAllAnimations()
			.addAnimation({
				duration: 1000,
				onProgress: (progress) => {
					const reversedProgress = (1 - progress)
					const symbolView = this.getSymbolView()

					const skewProgress = Math.sin(Math.PI * 2 * ((progress * 3) % 1)) * reversedProgress
					const scaleProgress = Math.sin(Math.PI * 2 * ((progress * 2) % 1)) * reversedProgress
					const pivotXProgress = Math.abs(Math.sin(Math.PI * 2 * ((progress * 2) % 1))) * reversedProgress
					const pivotYProgress = Math.abs(Math.sin(Math.PI * 2 * progress)) * reversedProgress

					symbolView.skew.x = skew * skewProgress
					symbolView.scale.y = 1 + scaleOffset * scaleProgress
					symbolView.pivot.x = pivotXOffset * pivotXProgress
					symbolView.pivot.y = pivotYOffset * pivotYProgress
				}
			})
			.addAnimation({
				delay: 700,
				duration: 300,
				onProgress: (progress) => {
					const reversedProgress = (1 - progress)
					this.alpha = reversedProgress
				}
			})
			.play()
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
		symbolView.setBlur(0)
		symbolView.alpha = 1
		symbolView.presentWin(progress)

		targetSymbolView.setVisible(true)
		targetSymbolView.setBlur(0)
		targetSymbolView.alpha = progress
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
		idleProgress = 0,
		delay = 1
	}) {
		this.reset()

		this.presentSymbol(0)

		if(!distance) return

		const symbolView =  this.getSymbolView(symbolId)
		const fallingView = symbolView
		const finalDistance = distance * CELL_HEIGHT
		const fallDuration = Math.min(350, distance * 100)
		const offsetY = CELL_HEIGHT / 2
		symbolView.idleProgressOffset = idleProgressOffset
		symbolView.idleProgress = idleProgress

		return this
			.cascadeTimeline
			.deleteAllAnimations()
			.addAnimation({
				delay,
				duration: fallDuration,
				onDelayFinish: () => {
					this.presentSymbol(symbolId)
				},
				onProgress: (progress) => {
					fallingView.y = -finalDistance * (1 - progress ** 2) + offsetY
				}
			})
			.addAnimation({
				delay: fallDuration + delay,
				duration: 250,
				onProgress: (progress) => {
					const subProgress = Math.sin(Math.PI * progress)

					fallingView.y = subProgress * -CELL_HEIGHT * 0.25 + offsetY
				}
			})
			.windToTime(2)
			.play()
	}
	// ...API
}
