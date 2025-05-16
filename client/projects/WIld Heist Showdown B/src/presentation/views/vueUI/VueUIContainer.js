import { AdaptiveProxyHTMLContainer } from "../adaptiveDesign/AdaptiveProxyHTMLContainer";
import { AdaptiveContainer } from "../adaptiveDesign/AdaptiveContainer";

export class VueUIContainer extends AdaptiveContainer {
	vueContext
	isMobileDevice
	isFreeSpinsMode

	constructor({vueContext, isMobileDevice}) {
		super()

		this.isMobileDevice = isMobileDevice
		this.vueContext = vueContext

		this.bottomContainer = this.addChild(new AdaptiveProxyHTMLContainer)
		this.bottomContainer.attach({
			name: 'bottom',
			element: document.getElementById('bottom')
		})

		this.betContainer = this.addChild(new AdaptiveProxyHTMLContainer)
		this.betContainer.attach({
			name: 'bet',
			element: document.getElementById('bet'),
			scaleFactor: 0.645
		})

		this.autoplayContainer = this.addChild(new AdaptiveProxyHTMLContainer)
		this.autoplayContainer.attach({
			name: 'auto',
			element: document.getElementById('auto')
		})

		this.balanceContainer = this.addChild(new AdaptiveProxyHTMLContainer)
		this.balanceContainer.attach({
			name: 'balance',
			element: document.getElementById('balance')
		})


		this.overlay = this.addChild(new AdaptiveProxyHTMLContainer)
		this.overlay.attach({
			name: 'overlay',
			element: document.getElementById('overlay')
		})

		this.paytableContainer = this.addChild(new AdaptiveProxyHTMLContainer)
		this.paytableContainer.attach({
			name: 'paytable',
			element: document.getElementById('paytable')
		})

		this.popupsContainer = this.addChild(new AdaptiveProxyHTMLContainer)
		
		const popupIds = [
			'errorPopup',
			'autoplayPopup',
			'betPopup',
			'buyPopup',
			'cheats'
		].forEach(id => {
			this.popupsContainer.attach({
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


		this.overlay
			.setTargetArea({x: 0, y: 0, width: 1, height: 1})
			.setSourceArea({width: 100, height: 100})
			.stretchHorizontally()
			.stretchVertically()
	}

	updateTargetArea(sidesRatio) {
		const {
			buttonsGroupContainer,
			popupsContainer,
			isMobileDevice,
			bottomContainer,
			betContainer,
			autoplayContainer,
			balanceContainer,
			paytableContainer,
			betOptionsContainer,
			isFreeSpinsMode
		} = this

		if(isFreeSpinsMode) {
			bottomContainer
				.setSourceArea({width: 1290, height: 2796})
				.setTargetArea({x: 0, y: 0, width: 1, height: 1})
				.translateElement({name: 'bottom', x: 20, y: 1875})
				.stickMiddle()
				
		} else {
			
			bottomContainer
				.setSourceArea({width: 1290, height: 2796})
				.setTargetArea({x: 0, y: 0, width: 1, height: 1})
				.translateElement({name: 'bottom', x: 20, y: 1865})
				.stickMiddle()

			betContainer
				.setSourceArea({width: 1290, height: 1000})
				.setTargetArea({x: 0, y: 0, width: 1, height: 1})
				.translateElement({name: 'bet', x: 0, y: 1550})
				.stickBottom()

			autoplayContainer
				.setSourceArea({width: 1300, height: 1500})
				.setTargetArea({x: 0, y: 0, width: 1, height: 1})
				.translateElement({name: 'auto', x: 0, y: 1500})
				.stickBottom()

			balanceContainer
				.setSourceArea({width: 1300, height: 1500})
				.setTargetArea({x: 0, y: 0, width: 1, height: 1})
				.translateElement({name: 'balance', x: 0, y: 1500})
				.stickBottom()

			paytableContainer
				.setSourceArea({width: 1200, height: 2000})
				.setTargetArea({x: 0, y: 0, width: 1, height: 1})
				.translateElement({name: 'paytable', x: 0, y: 0})
				.stickMiddle()
		}
		
		if (sidesRatio >= 1) {
			// MOBILE OR NARROW DESKTOP LANDSCAPE...
			const panelHeight = isMobileDevice ? 0.2 : 0.1

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

			this.popupsContainer
				.setTargetArea({x: 0.3, y: 0.25, width: 0.4, height: 0.5})
				.setSourceArea({width: 300, height: 200})
			// ...MOBILE OR NARROW DESKTOP LANDSCAPE
		} else {
			// PORTRAIT...
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

			this.popupsContainer
				.setTargetArea({x: 0.05, y: 0, width: 0.9, height: 1})
				.setSourceArea({width: 300, height: 200})
			// ...PORTRAIT
		}
	}


	setFreeSpinsMode(isFreeSpinsMode = true) {
		this.isFreeSpinsMode = isFreeSpinsMode
		
		AdaptiveProxyHTMLContainer.onResize()
	}
}