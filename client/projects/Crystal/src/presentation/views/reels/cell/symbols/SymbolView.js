import { Container, Sprite } from "pixi.js";
import { brightnessToHexColor } from "../../../GraphicalPrimitives";

export class SymbolView extends Container {
    bodyView
    blurredBodyView

	constructor(symbolId, assets) {
		super()
        
		this.initBody(symbolId, assets)
		this.initBlurredBody(symbolId, assets)
	}

	initBody(symbolId, assets) {
        const sprite = new Sprite(assets['symbol_' + (symbolId - 1) + '_0'])
        sprite.anchor.set(0.5)

        this.bodyView = this.addChild(sprite)
	}

    initBlurredBody(symbolId, assets) {
        const sprite = new Sprite(assets['symbol_' + (symbolId - 1) + '_blur'])
        sprite.anchor.set(0.5)

        this.blurredBodyView = this.addChild(sprite)
    }

	setVisible(isVisible = true) {
		this.visible = isVisible
	}

	setBlur(progress) {
        this.blurredBodyView.alpha = progress
		this.bodyView.alpha = 1 - progress
	}

	setBrightness(brightness = 1) {
		const finalBrightness = Math.min(1, Math.max(0.05, brightness))

		if (this.brightness === finalBrightness) return
		this.brightness = finalBrightness


		this.bodyView.tint = brightnessToHexColor(Math.max(0.25, this.brightness))
	}

	copyMetrics(symbolView) {
		this.setBrightness(symbolView.brightness)
	}

	presentWin(progress) {
		const subProgress = Math.sin(Math.PI * progress)

		this.scale.set(1 + 0.15 * subProgress)
	}

	presentCoefficients(progress) {
		this.scale.set(1 + 0.35 * Math.abs(Math.sin(Math.PI * progress)))
	}

	reset() {

	}

	presentCorruption() {

    }

    presentTeasing() {

    }
}