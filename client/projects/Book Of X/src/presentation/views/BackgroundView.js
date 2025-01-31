import { Container, Sprite } from 'pixi.js'
import { AdaptiveContainer } from '../views/adaptiveDesign/AdaptiveContainer'
import { Timeline } from '../timeline/Timeline'
import { getRectangleSpot } from './GraphicalPrimitives'
import { SymbolOsirisView } from './reels/cell/symbols/SymbolOsirisView'



export class BackgroundView extends AdaptiveContainer {
	resources

	isMobileDevice
	skyView
	hatContainer
	hatView
	bodyContainer
	defaultModeContainer
	bonusModeContainer
	osirisContainer
	osirisView

	transitionTimeline = new Timeline
	coinsPoolView
	// decorationsViews
	isFreeSpinsMode
	timeline = new Timeline

	constructor({resources, vfxLevel, isMobileDevice}) {
		super()

		this.isMobileDevice = isMobileDevice
	
		this.initSky()
		this.initHatHat(resources)
		this.initOsiris(resources)
		this.initBodyContainer()
		this.initDefaultModeDecorations(resources)
		this.setFreeSpinsMode(false)
	}

	initSky() {
		this.skyView = this
			.addChild(new AdaptiveContainer)
			.setSourceArea({width: 100, height: 100})
			.highlight(0x000000, 1)
			.stretchHorizontally()
			.stretchVertically()
	}

	initHatHat(resources) {
		const container = this
			.addChild(new AdaptiveContainer)
			.setSourceArea({width: 2314, height: 220})
			.stickBottom()

		this.hatContainer = container


		this.hatView = new Sprite(resources.background_hat)
		// this.hatView.position.set(-462, -187)
		container.addChild(this.hatView).y = -980

		const sunLightView = getRectangleSpot({
			width: 125,
			height: 30,
			color: 0xFFCC00,
		})
		sunLightView.position.set(1600, 130)

		container.addChild(sunLightView)

		new Timeline()
			.addAnimation({
				duration: 10000,
				onProgress: progress => {
					const subProgress =  Math.sin(Math.PI * progress)

					sunLightView.scale.x = 1 + 1.5 * subProgress
					sunLightView.scale.y = 0.75 + 0.25 * subProgress
					sunLightView.alpha = subProgress
				}
			})
			.setLoopMode()
			.play()
	}

	initOsiris(resources) {
		this.osirisContainer = this
			.addChild(new AdaptiveContainer)
			.setSourceArea({width: 500, height: 500})
			.stickCenter()
			.stickMiddle()

		const view = new SymbolOsirisView(resources)

		view.position.set(250, 200)
		view.scale.set(0.85)

		this.osirisContainer.addChild(view)
		new Timeline()
			.addAnimation({
				duration: 7000,
				onProgress: progress => {
					view.update(progress)
				}
			})
			.setLoopMode()
			.play()

	}

	initBodyContainer() {
		this.bodyContainer = this
			.addChild(new AdaptiveContainer)
			.setSourceArea({width: 1427, height: 1026})
			.stickTop()
	}

	initDefaultModeDecorations(resources) {
		const container = this.bodyContainer.addChild(new Container)
		const sprite = new Sprite(resources.background_default_game)

		sprite.position.set(-462, 0)
		container.addChild(sprite)

		this.defaultModeContainer = container
	}

	setFreeSpinsMode(isFreeSpinsMode = true) {
		this.isFreeSpinsMode = isFreeSpinsMode

		if (isFreeSpinsMode) {
			// this.bonusModeContainer.addChild(this.hatView)
		} else {
			// this.defaultModeContainer.addChild(this.hatView)
		}


		// this.tilesContainer.visible = !isFreeSpinsMode
		// this.decorationsViews.forEach(view => view.visible = !isFreeSpinsMode)
/*
		if(this.coinsPoolView)
			this.coinsPoolView.visible = !isFreeSpinsMode
*/
		this.onResize()
	}

	updateTargetArea(sidesRatio) {
		const {
			skyView,
			hatContainer,
			osirisContainer,
			bodyContainer,
			isMobileDevice
		} = this
		
		if (sidesRatio > 1.25 && !isMobileDevice) {
			// DESKTOP LANDSCAPE...
			skyView.setTargetArea({x: 0, y: 0, width: 1, height: 0.2})
			hatContainer.setTargetArea({x: 0, y: 0, width: 1, height: 0.1})
			bodyContainer.setTargetArea({x: 0, y: 0.1, width: 1, height: 0.9})
			// ...DESKTOP LANDSCAPE
		} else if (sidesRatio > 1.25 && isMobileDevice) {
			// MOBILE LANDSCAPE...
			const panelWidth = isMobileDevice ? 0.2 : 0.125
			skyView.setTargetArea({x: 0, y: 0, width: 1, height: 0.075})
			hatContainer.setTargetArea({x: 0, y: 0, width: 1 - panelWidth, height: 0.075})
			bodyContainer.setTargetArea({x: 0, y: 0.075, width: 1 - panelWidth, height: 0.9})
			// ...MOBILE LANDSCAPE
		} else if (sidesRatio > 0.8) {
			// PORTRAIT...
			skyView.setTargetArea({x: 0, y: 0, width: 1, height: 0.2})
			hatContainer.setTargetArea({x: 0, y: 0, width: 1, height: 0.1})
			bodyContainer.setTargetArea({x: 0, y: 0.1, width: 1, height: 0.775})
			// ...PORTRAIT
			
		} else {
			// NARROW PORTRAIT...
			const hatHeight = Math.min(0.45, 0.15 / sidesRatio)

			osirisContainer.setTargetArea({x: 0, y: 0, width: 1, height:hatHeight})
			skyView.setTargetArea({x: 0, y: 0, width: 1, height:hatHeight})
			hatContainer.setTargetArea({x: 0, y: 0, width: 1, height: hatHeight})
			bodyContainer.setTargetArea({x: 0, y: hatHeight, width: 1, height: 1})
			// ...NARROW PORTRAIT
		}

		osirisContainer.visible = sidesRatio < 0.7
	}
}
