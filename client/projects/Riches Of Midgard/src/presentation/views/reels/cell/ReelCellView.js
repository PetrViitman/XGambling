import { Container, Sprite } from 'pixi.js'
import { BaseSymbolView } from './symbols/BaseSymbolView'
import { CELL_HEIGHT, POSSIBLE_REELS_SYMBOLS, SCATTER_SYMBOL_ID } from '../../../Constants'
import { ScatterSymbolView } from './symbols/ScatterSymbolView'
import { brightnessToHexColor } from '../../GraphicalPrimitives'

export class ReelCellView extends Container {
	contentContainer
	borderView
	symbolsViews = []
	currentSymbolId
	blurStrength = 0

	constructor({
		possibleSymbolsIds = POSSIBLE_REELS_SYMBOLS[1],
		resources, 
		vfxLevel
	}) {
		super()
		this.contentContainer = this.addChild(new Container)
		this.initSymbols({possibleSymbolsIds, resources, vfxLevel})
		this.initBorder(resources)
		this.setFlip()
	}

	initSymbols({possibleSymbolsIds, resources, vfxLevel}) {
		possibleSymbolsIds.forEach(id => {
			let symbolView 

			if (id === SCATTER_SYMBOL_ID)
				symbolView = this.addChild(new ScatterSymbolView({id, resources}))
			else
				symbolView = new BaseSymbolView({id, resources, vfxLevel})
	
			this.symbolsViews[id] = this.contentContainer.addChild(symbolView)
		})
	}

	initBorder(resources) {
		this.borderView = this.contentContainer.addChild(new Sprite(resources.frame_border))
		this.borderView.anchor.set(0.5, 0.5)
		this.borderView.y = CELL_HEIGHT / 2
	}

	// API...
	getSymbolView(symbolId = this.currentSymbolId) {
		const { symbolsViews } = this

		return symbolsViews[symbolId]
	}

	setFlip(progress = 0) {
		const shiftedProgress = (progress + 0.5) % 1
		const finalProgress = Math.sin(Math.PI * shiftedProgress)
		this.contentContainer.scale.y = finalProgress
		this.contentContainer.scale.x = 0.95 + 0.05 * finalProgress
		this.setBrightness(finalProgress)
		this.contentContainer.y = Math.sin(Math.PI * 2 * shiftedProgress) * 20

		this.borderView.scale.y = 1 / finalProgress - finalProgress
		this.borderView.tint = brightnessToHexColor(Math.max(0.5, 1 - finalProgress))

		if(shiftedProgress < 0.5) {
			this.borderView.y = -CELL_HEIGHT / 2
			this.borderView.anchor.y = 1
		} else {
			this.borderView.y = CELL_HEIGHT / 2
			this.borderView.anchor.y = 0
			this.contentContainer.y -= 37 * ((shiftedProgress - 0.5) / 0.5)
		}
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
		return this.getSymbolView(SCATTER_SYMBOL_ID).presentSpecialWin()
	}
	// ...API
}
