import { Container, Sprite } from 'pixi.js'
import { CELL_HEIGHT, POSSIBLE_REELS_SYMBOLS, SCATTER_SYMBOL_ID, SYMBOLS_IDS } from '../../../Constants'
import { Timeline } from '../../../timeline/Timeline'
import { Symbol10View } from './symbols/Symbol10View'
import { SymbolQView } from './symbols/SymbolQView'
import { SymbolJView } from './symbols/SymbolJView'
import { SymbolAView } from './symbols/SymbolAView'
import { SymbolKView } from './symbols/SymbolKView'
import { SymbolScarabView } from './symbols/SymbolScarabView'
import { SymbolAnkhView } from './symbols/SymbolAnkhView'
import { SymbolEyeView } from './symbols/SymbolEyeView'
import { SymbolPharaohView } from './symbols/SymbolPharaohView'
import { SymbolBookView } from './symbols/SymbolBookView'
import { SubstitutionEffectView } from './SubstitutionEffectView'

export class ReelCellView extends Container {
	contentContainer
	symbolsViews = []
	substitutionEffectView
	currentSymbolId
	timeline = new Timeline

	constructor({
		possibleSymbolsIds = POSSIBLE_REELS_SYMBOLS[1],
		resources,
	}) {
		super()
		this.contentContainer = this.addChild(new Container)
		this.initSymbols({possibleSymbolsIds, resources})
		this.initSubstitutionEffect()
	}

	initSymbols({possibleSymbolsIds, resources}) {
		possibleSymbolsIds.forEach(id => {
			let symbolView 

			switch (id) {
				case 0: symbolView = new Symbol10View(resources); break
				case 1: symbolView = new SymbolQView(resources); break
				case 2: symbolView = new SymbolJView(resources); break
				case 3: symbolView = new SymbolAView(resources); break
				case 4: symbolView = new SymbolKView(resources); break
				case 5: symbolView = new SymbolScarabView(resources); break
				case 6: symbolView = new SymbolEyeView(resources); break
				case 7: symbolView = new SymbolPharaohView(resources); break
				case 8: symbolView = new SymbolAnkhView(resources); break
				case 9: symbolView = new SymbolBookView(resources); break
			}
	
			symbolView.visible = false
			this.symbolsViews[id] = this.contentContainer.addChild(symbolView)
		})
	}

	initSubstitutionEffect() {
		this.substitutionEffectView = new SubstitutionEffectView()
		this.contentContainer.addChild(this.substitutionEffectView)
	}

	getSymbolView(symbolId = this.currentSymbolId) {
		const { symbolsViews } = this

		return symbolsViews[symbolId]
	}

	// API...
	reset() {
		this.symbolsViews.forEach(view => view.reset())
	}

	setTimeScale(scale) {
		for(const view of this.symbolsViews)
			view?.setTimeScale?.(scale)
	}

	getRemainingWildCapacity() {
		return this.getSymbolView(-1).remainingWildCapacity
	}

	setBlur(strength = 1) {
		this.blurStrength = strength
		
		this.getSymbolView().setBlur(strength)
	}

	setBrightness(brightness = 1) {
		this.getSymbolView()?.setBrightness(brightness)
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
	}

	presentScatterTeasing() {
		if (this.currentSymbolId !== SCATTER_SYMBOL_ID)
			return

		return this.getSymbolView(SCATTER_SYMBOL_ID).presentTeasing()
	}

	presentScatterWin() {
		return Promise.all([
			this.getSymbolView(SCATTER_SYMBOL_ID).presentSpecialWin(),
		])
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

	update(progress) {
		this.getSymbolView()?.update(progress)
	}
	// ...API
}
