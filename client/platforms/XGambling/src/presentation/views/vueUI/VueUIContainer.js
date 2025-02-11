import { AdaptiveProxyHTMLContainer } from "../adaptiveDesign/AdaptiveProxyHTMLContainer";
import { AdaptiveContainer } from "../adaptiveDesign/AdaptiveContainer";

export class VueUIContainer extends AdaptiveContainer {
	vueContext
	isMobileDevice

	constructor({vueContext, isMobileDevice}) {
		super()

		this.isMobileDevice = isMobileDevice
		this.vueContext = vueContext

		this.footerContainer = this.addChild(new AdaptiveProxyHTMLContainer)
		const footerElementsIds = [
			'footer'
		].forEach(id => {
			this.footerContainer.attach({
					name: id,
					element: document.getElementById(id)
				})
		})

		this.headerContainer = this.addChild(new AdaptiveProxyHTMLContainer)
		const headerElementsIds = [
			'header'
		].forEach(id => {
			this.headerContainer.attach({
					name: id,
					element: document.getElementById(id)
				})
		})


		this.loginContainer = this.addChild(new AdaptiveProxyHTMLContainer)
		const popupIds = [
			'login',
		].forEach(id => {
			this.loginContainer.attach({
					name: id,
					element: document.getElementById(id)
				})
		})

		this.buttonsGroupContainer = this.addChild(new AdaptiveProxyHTMLContainer)
		const buttonsGroupIds = [
			'spinButton',
			'skipButton',
			'settingsButton',
			'turboButton',
			'betButton',
			'autoButton',
			'stopAutoButton',
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
			'buyButton',
			'overlay',
		].forEach(id => {

			this[id] = this
				.addChild(new AdaptiveProxyHTMLContainer)
				.attach({
					name: 'element',
					element: document.getElementById(id)
				})
		})

		this.overlay
			.setTargetArea({x: 0, y: 0, width: 1, height: 1})
			.setSourceArea({width: 100, height: 100})
			.stretchHorizontally()
			.stretchVertically()
	}

	updateTargetArea(sidesRatio) {
		const {
			footerContainer,
			headerContainer,
			loginContainer,
			isMobileDevice
		} = this

		headerContainer
			.setSourceArea({width: 400, height: 50})
			.setTargetArea({x: 0, y: 0.175, width: 1, height: 0.045})
			.stickTop()

		footerContainer
			.setSourceArea({width: 400, height: 100})
			.setTargetArea({x: 0, y: 0.85, width: 1, height: 0.1})


		if (sidesRatio > 1) {
			loginContainer
				.setSourceArea({width: 402, height: 275})
				.setTargetArea({x: 0.25, y: 0.3, width: 0.5, height: 0.4})
				.stickMiddle()
		} else {
			loginContainer
				.setSourceArea({width: 402, height: 275})
				.setTargetArea({x: 0.05, y: 0.25, width: 0.9, height: 0.5})
				.stickTop()
		}
	}
}