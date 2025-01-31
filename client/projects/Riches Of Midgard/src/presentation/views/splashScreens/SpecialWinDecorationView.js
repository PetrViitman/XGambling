import { BLEND_MODES, Container, Graphics, Sprite } from 'pixi.js';
import { Timeline } from '../../timeline/Timeline';
import { CoinView } from '../coins/CoinView';
import { brightnessToHexColor, getLightSpot, getRectangleSpot } from '../GraphicalPrimitives';

export class SpecialWinDecorationView extends Container {
	anvilView
	hummerView
	sparklesContainer
	wavesViews
	glowView
	hitGlowView
	coinsContainer
	timeline

	constructor(resources, isFreeSpinsMode = false) {
		super()


		const container = this.addChild(new Container)
		this.contentContainer = container

		// GLOW...
		const glowContainer = container.addChild(new Container)
		// this.glowView = getLightSpot({color: 0x990099, radius: 150})

		for(let i = 0; i < 5; i++) {
			const glowView = getRectangleSpot({color: 0xFF5500, width: 100, height: 25})
			glowView.rotation = i + Math.PI * 2 / 5
			glowContainer.addChild(glowView)
		}

		this.glowView = glowContainer
		// ...GLOW

		// ANVIL
		let sprite = new Sprite(resources.special_win_anvil)
		sprite.anchor.set(0.5)
		sprite.y = 115
		this.anvilView = container.addChild(sprite)
		// ANVIL

		// WAVES...
		this.sparklesContainer = container.addChild(new Container)
		this.wavesViews = [0, 0, 0, 0, 0].map(_ => {
			const sprite = new Sprite(resources.special_win_wave)
			sprite.anchor.set(0.5)
			sprite.x = 15
			sprite.blendMode = BLEND_MODES.ADD
			this.sparklesContainer.addChildAt(sprite,0)


			return sprite
		})
		// ...WAVES

		// HIT GLOW...
		this.hitGlowView = getRectangleSpot({color: 0xFF5500, width: 100, height: 25})
		this.hitGlowView.y = -15
		container.addChild(this.hitGlowView)
		// ...HIT GLOW


		// COINS...
		this.coinsContainer = container.addChild(new Container)
		const prefix = isFreeSpinsMode ? 'chip_' : 'coin_'
		this.coinsViews = [0, 0, 0, 0, 0].map(_ => {
			const view = new CoinView({
				textureFace: resources[prefix + 'face'],
				textureRib: resources[prefix + 'rib'],
				textureStretch: resources[prefix + 'stretch'],
			})
			this.coinsContainer.addChildAt(view, 0)
			return view
		})
		// ...COINS

		// HUMMER...
		sprite = new Sprite(resources.special_win_hummer)
		sprite.anchor.set(0.75, 0.6)
		sprite.y = -100
		this.hummerView = container.addChild(sprite)
		// ...HUMMER


		this.initTimeline()
	}

	initTimeline() {
		const {
			anvilView,
			hummerView,
			sparklesContainer,
			wavesViews,
			glowView,
			hitGlowView
		} = this

		this.timeline =new Timeline()
			.addAnimation({
				delay: 1000,
				duration: 750,
				onProgress: progress => {
					const subProgress = Math.abs(Math.sin(Math.PI * 4 * progress)) * (1 - progress)

					anvilView.scale.y = 1 - 0.05 * subProgress
					anvilView.y = 115 + 25 * subProgress
					anvilView.tint = brightnessToHexColor(1 - subProgress)

					hummerView.y = -25 * subProgress -100
					hummerView.rotation = -0.3 + 0.5 * subProgress
					hummerView.tint = anvilView.tint
					// anvilView.rotation =  subProgress
					// logoView.alpha = Math.min(1, subProgress * 2)
					
					glowView.scale.set(2.25 + subProgress, 2.5 + subProgress)
					sparklesContainer.scale.x = 1 - 0.5 * progress
					sparklesContainer.scale.y = 1 - 0.25 * progress
					sparklesContainer.y = 10 * progress       
					
					
					hitGlowView.scale.x = Math.max(0.5, subProgress * 4.5)
					hitGlowView.scale.y = 0.5 + 0.5 * subProgress
					hitGlowView.alpha = Math.min(1, subProgress * 2)

					wavesViews.forEach((view, i) => {
						const shiftedProgress = (progress + i * 0.2) % 1
						const shiftedSubProgress = Math.sin(Math.PI * shiftedProgress)
						view.y = -25 + 50 * ( 0.5 + (1 - progress)) * shiftedProgress  * (1 - Math.sin(Math.PI * shiftedProgress)) ** 2
					   //view.y = -25

					   if(i % 2 === 0)
							view.skew.y = shiftedProgress * 0.1
						else 
							view.skew.y = -shiftedProgress * 0.1

						view.scale.set(shiftedProgress * 3, 0.1 + shiftedProgress * 1.25)
						if(i % 2 === 0)
							view.scale.x *= -1
						view.alpha = Math.min(1, shiftedSubProgress *  Math.sin(Math.PI * progress) * 2)

					})

					for(let i = 0; i < 5; i++) {
						const coinView = this.coinsViews[i]

						const shiftedProgress = (progress + i * 0.2) % 1
						const shiftedSubProgress = Math.sin(Math.PI * shiftedProgress)
						coinView.x = (-150 + 100  * i) * shiftedProgress
						coinView.y = -25 + 300 * shiftedProgress * progress ** 2
						coinView.flip((0.25 + shiftedProgress) % 1)
						coinView.spin(shiftedProgress * Math.PI * 2)
						coinView.scale.set(1 - shiftedProgress * 0.25)
						coinView.alpha = Math.min(1, shiftedSubProgress *  Math.sin(Math.PI * progress) * 2)
					}

					
				}
			})
			.addAnimation({
				duration: 1000,
				onProgress: progress => {
					const subProgress = Math.sin(Math.PI * progress)
					this.sparklesContainer
					hummerView.rotation = Math.PI * subProgress - 0.3
					hummerView.y = -subProgress * 200 -100
					hummerView.x = subProgress * 150 + 150
					hummerView.scale.set(0.75 + 0.25 * (1 - subProgress))

					glowView.alpha = 0.75 + 0.25 * subProgress
				}
			})
			.wind(1)
			.setLoopMode()
	}

	play() {
		this.timeline.play()
	}

	pause() {
		this.timeline.pause()
	}
}