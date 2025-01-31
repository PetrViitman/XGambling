import { BlurFilter, Container, Sprite } from 'pixi.js'
import { brightnessToHexColor } from '../../../GraphicalPrimitives'

const BLUR_FILTER = new BlurFilter()
BLUR_FILTER.blurX = 0
BLUR_FILTER.blurY = 20

const NAMES = [
	'empty', // 0
	'10', // 1
	'J', // 2
	'Q', // 3
	'K', // 4
	'A', // 5
	'meat', // 6
	'horn', // 7
	'female', // 8
	'viking', // 9
	'warchief', // 10
	'scatter_background', // 11
	'wild', // 12
]

export class BaseSymbolView extends Container {
	bodyView
	blurredBodyView
	brightness = 1
	lockedBrightness

	constructor({id, resources, vfxLevel}) {
		super()

		this.initBody(NAMES[id], resources)
		this.initBlurredBody({name: NAMES[id], resources, vfxLevel})
	}

	generateBody(name, resources) {
		const sprite = new Sprite(resources['symbol_' + name])
		sprite.anchor.set(0.5)

		return sprite
	}

	initBody(name, resources) {
		if(!name) {
			this.bodyView = new Container
			return
		}

		this.bodyView = this.addChild(this.generateBody(name, resources))
		this.setVisible(false)
	}

	initBlurredBody({name, resources, vfxLevel = 0}) {
		if(!name || vfxLevel < 1) {
			this.blurredBodyView = new Container()
			return
		}

		this.blurredBodyView = this.addChild(this.generateBody(name, resources))
		this.blurredBodyView.filters = [BLUR_FILTER]

		this.blurredBodyView.cacheAsBitmap = true
	}

	setBrightness(brightness) {
		const finalBrightness = this.lockedBrightness ?? brightness

		this.brightness = Math.min(1, Math.max(0.25, finalBrightness))

		if(!this.bodyView) { return }
		this.bodyView.tint = brightnessToHexColor(this.brightness)
	}

	setLockedBrightness(brightness) {
		this.lockedBrightness = brightness
	}

	setBlur(strength = 1) {
		this.blurredBodyView.alpha = strength
	}

	setVisible(isVisible = true) {
		this.visible = isVisible
	}
}
