import { AdaptiveProxyHTMLContainer } from "../adaptiveDesign/AdaptiveProxyHTMLContainer";
import { AdaptiveContainer } from "../adaptiveDesign/AdaptiveContainer";

export class VueUIContainer extends AdaptiveContainer {
	vueContext
	isMobileDevice

	constructor({vueContext, isMobileDevice}) {
		super()

		this.isMobileDevice = isMobileDevice
		this.vueContext = vueContext

		this.popupsContainer = this.addChild(new AdaptiveProxyHTMLContainer)
			.setSourceArea({width: 300, height: 250})
		const popupIds = [
			'errorPopup',
			'autoplayPopup',
			'popupBetSelector',
			'cheats'
		].forEach(id => {
			this.popupsContainer.attach({
					name: id,
					element: document.getElementById(id)
				})
		})

		this.buttonsGroupContainer = this.addChild(new AdaptiveProxyHTMLContainer)
		this.buttonsGroupContainer.eventMode = 'none'
		const buttonsGroupIds = [
			'spinButton',
			'skipButton',
			'settingsButton',
			'turboButton',
			'betButton',
			'autoButton',
			'stopAutoButton',
			'riskButton'
		].forEach(id => {
			this.buttonsGroupContainer.attach({
					name: id,
					element: document.getElementById(id)
				})
		})

		const ids = [
			'panelBackground',
			'winIndicator',
			'balanceIndicator',
			'betSelector',
			'lineSelector',
			'overlay',
		].forEach(id => {

			this[id] = this
				.addChild(new AdaptiveProxyHTMLContainer)
				.attach({
					name: 'element',
					element: document.getElementById(id)
				})

			this[id].eventMode = 'none'
		})

		this.overlay
			.setTargetArea({x: 0, y: 0, width: 1, height: 1})
			.setSourceArea({width: 100, height: 100})
			.stretchHorizontally()
			.stretchVertically()
	}

	updateTargetArea(sidesRatio) {
		const {
			panelBackground,
			winIndicator,
			balanceIndicator,
			betSelector,
			lineSelector,
			buttonsGroupContainer,
			popupsContainer,
			isMobileDevice
		} = this

		if (sidesRatio > 1.25 && !isMobileDevice) {
			// DESKTOP LANDSCAPE...
			this.vueContext.isSimplifiedMode.value = false
			panelBackground
				.setSourceArea({width: 200, height: 60})
				.setTargetArea({x: 0, y: 0.9, width: 1, height: 0.1})
				.stretchVertically()
				.stretchHorizontally()
			
			buttonsGroupContainer
				.stickCenter()
				.stickTop()
				.setSourceArea({width: 1000, height: 60})
				.setTargetArea({x: 0, y: 0.9, width: 1, height: 0.1})
				.translateElement({name: 'settingsButton', x: 20, y: 5})
				.translateElement({name: 'spinButton', x: 465, y: -20})
				.translateElement({name: 'skipButton', x: 465, y: -20})
				.translateElement({name: 'turboButton', x: 410, y: 5})
				.translateElement({name: 'autoButton', x: 540, y: 5})
				.translateElement({name: 'stopAutoButton', x: 540, y: 5})
				.translateElement({name: 'riskButton', x: 1090, y: -75})
				.scaleElement({name: 'riskButton', scaleFactor: 0.6})

			winIndicator
				.stickCenter()
				.stickTop()
				.setSourceArea({width: 1000, height: 60})
				.setTargetArea({x: 0, y: 0.9, width: 1, height: 0.1})
				.translateElement({name: 'element', x: 625, y: 5})

			balanceIndicator
				.stickCenter()
				.stickTop()
				.setSourceArea({width: 1000, height: 60})
				.setTargetArea({x: 0, y: 0.9, width: 1, height: 0.1})
				.translateElement({name: 'element', x: 815, y: 5})

			betSelector
				.stickCenter()
				.stickTop()
				.setSourceArea({width: 1000, height: 60})
				.setTargetArea({x: 0, y: 0.9, width: 1, height: 0.1})
				.translateElement({name: 'element', x: 250, y: 5})
			
			lineSelector
				.stickCenter()
				.stickTop()
				.setSourceArea({width: 1000, height: 60})
				.setTargetArea({x: 0, y: 0.9, width: 1, height: 0.1})
				.translateElement({name: 'element', x: 90, y: 5})
				.setElementVisible()
			
			popupsContainer
				.setTargetArea({x: 0.3, y: 0.25, width: 0.4, height: 0.5})
			// ...DESKTOP LANDSCAPE
		} else if (sidesRatio > 1.25 && isMobileDevice) {
			// MOBILE LANDSCAPE...
			const panelHeight = isMobileDevice ? 0.2 : 0.1

			this.vueContext.isSimplifiedMode.value = true
			panelBackground
				.setSourceArea({width: 200, height: 60})
				.setTargetArea({x: 0, y: 1 - panelHeight, width: 1, height: panelHeight})
				.stretchVertically()
				.stretchHorizontally()

			buttonsGroupContainer
				.stickRight()
				.stickMiddle()
				.setSourceArea({width: 75, height: 700})
				.setTargetArea(
					isMobileDevice
					? {x: 0.75, y: -0.555, width: 0.25, height: 2}
					: {x: 0.75, y: 0, width: 0.25, height: 1})
				.translateElement({name: 'betButton', x: 20, y: 197})
				.translateElement({name: 'autoButton', x: 20, y: 250})
				.translateElement({name: 'stopAutoButton', x: 20, y: 250})
				.translateElement({name: 'spinButton', x: -10, y: 300})
				.translateElement({name: 'skipButton', x: -10, y: 300})
				.translateElement({name: 'turboButton', x: 20, y: 370})
				.translateElement({name: 'settingsButton', x: 20, y: 423})
				.translateElement({name: 'riskButton', x: -150, y: 335})
					.scaleElement({name: 'riskButton', scaleFactor: 0.6})

			lineSelector.setElementVisible('element', false)
			betSelector
				.stickLeft()
				.stickMiddle()
				.setSourceArea({width: 600, height: 60})
				.setTargetArea({x: 0, y: 1 - panelHeight, width: 1, height: panelHeight})
				.translateElement({name: 'element', x: 20, y: 5})

			winIndicator
				.stickCenter()
				.stickMiddle()
				.setSourceArea({width: 600, height: 60})
				.setTargetArea({x: 0, y: 1 - panelHeight, width: 1, height: panelHeight})
				.translateElement({name: 'element', x: 225, y: 5})

			balanceIndicator
				.stickRight()
				.stickMiddle()
				.setSourceArea({width: 600, height: 60})
				.setTargetArea({x: 0, y: 1 - panelHeight, width: 1, height: panelHeight})
				.translateElement({name: 'element', x: 430, y: 5})

			this.popupsContainer
				.setTargetArea({x: 0.2, y: 0.025, width: 0.6, height: 0.825})
			// ...MOBILE LANDSCAPE
		} else {
			// PORTRAIT...
			this.vueContext.isSimplifiedMode.value = true
			panelBackground
				.setSourceArea({width: 200, height: 60})
				.setTargetArea({x: 0, y: 0.9, width: 1, height: 0.1})
				.stretchVertically()
				.stretchHorizontally()
	
			buttonsGroupContainer
				.stickCenter()
				.stickBottom()
				.setSourceArea({width: 400, height: 150})
				.setTargetArea({x: 0, y: 0.65, width: 1, height: 0.25})
				.translateElement({name: 'settingsButton', x: 25, y: 95})
				.translateElement({name: 'turboButton', x: 95, y: 95})
				.translateElement({name: 'spinButton', x: 166, y: 75})
				.translateElement({name: 'skipButton', x: 166, y: 75})
				.translateElement({name: 'autoButton', x: 255, y: 95})
				.translateElement({name: 'stopAutoButton', x: 255, y: 95})
				.translateElement({name: 'betButton', x: 325, y: 95})
				.translateElement({name: 'riskButton', x: 257, y: 60})
				.scaleElement({name: 'riskButton', scaleFactor: 0.6})

			lineSelector.setElementVisible('element', false)
			betSelector
				.stickLeft()
				.stickTop()
				.setSourceArea({width: 400, height: 60})
				.setTargetArea({x: 0, y: 0.9, width: 1, height: 0.1})
				.translateElement({name: 'element', x: 0, y: 5})

			winIndicator
				.stickCenter()
				.stickTop()
				.setSourceArea({width: 400, height: 60})
				.setTargetArea({x: 0, y: 0.9, width: 1, height: 0.1})
				.translateElement({name: 'element', x: 125, y: 5})

			balanceIndicator
				.stickRight()
				.stickTop()
				.setSourceArea({width: 400, height: 60})
				.setTargetArea({x: 0, y: 0.9, width: 1, height: 0.1})
				.translateElement({name: 'element', x: 250, y: 5})

			this.popupsContainer
				.setTargetArea({x: 0.05, y: 0, width: 0.9, height: 1})
			// ...PORTRAIT
		}
	}
}