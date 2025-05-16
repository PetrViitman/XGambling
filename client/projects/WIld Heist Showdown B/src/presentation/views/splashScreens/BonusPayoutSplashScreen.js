import { Graphics, Sprite } from "pixi.js";
import { formatMoney } from "../../Utils";
import { Timeline } from "../../timeline/Timeline";
import { TextField } from "../text/TextField";
import { BaseSplashScreen } from "./BaseSplashScreen";
import { AwardPayoutView } from "./award/AwardPayoutView";
import { colorToColor } from "../GraphicalPrimitives";
import { SpineView } from "../SpineView";
import { AwardView } from "./award/AwardView";

export class BonusPayoutSplashScreen extends BaseSplashScreen {
	idleTimeline = new Timeline
	presentationTimeline = new Timeline

	constructor({
		assets,

		isMobileDevice,
		camera,
		awardView,
		audio
	}) {
        super({
            assets,

            isMobileDevice,
            camera,
			awardView,
			audio
        })

        this.initSpine(assets)
		this.initPayout(assets)
		this.initIdleTimeline()
		
	}

	initBody() {
		const {
			assets,
			isMobileDevice,
		} = this

		super.initBody({
			assets,
			width: 1290,
			height: 2796,
			isMobileDevice,
		})
	}


	initSpine(assets) { 
		const spineView = new SpineView(assets.popup); 
		spineView.position.set(650, 1500)
		spineView.scale.set(1)
		this.bodyView.addChild(spineView); 
		this.spineView = spineView; 
	}

    initIdleTimeline() {
        const { awardView } = this
	
		this.spineView.playAnimation({ name: 'total',  isLoopMode: true });
        this.idleTimeline = new Timeline
        this.idleTimeline
			.addAnimation({
				duration: 10000,
				onProgress: progress => {
					const subProgress = (progress * 5) % 1
					awardView.setIdleProgress(subProgress )
					//this.payoutView.scale.x = 1 + 0.1 * Math.sin(Math.PI * 15 * progress) * (1 - progress)
					this.hintView.present((progress * 20) % 1)
				}
			})
			.setLoopMode()
    }

	initPayout(assets) {
		this.payoutView = this.bodyView.addChild(new AwardPayoutView(assets))
		this.payoutView.position.set(650, 1180)
		this.payoutView.scale.set(1.55)
	}

	async presentPayout(payout) {
		const {
			presentationTimeline,
			awardView,
			payoutView,
	
		} = this

		this.bodyView.addChildAt(awardView, 0)
		awardView.position.set(650, 1309)
		awardView.setSkin('total')
		awardView.presentTransition(0)


		this.hintView.y = 1625
		this.hintView.scale.set(0.65)
		
		this.idleTimeline.play()

		this.audio.presentCounting({duration: 2500})

		presentationTimeline
			.deleteAllAnimations()
			.addAnimation({
				duration: 2500,
				onProgress: (progress) => {
					const scaleProgress = Math.abs(Math.sin(Math.PI * ((progress * 10) % 1)))
			
					//payoutView.presentDistortion(progress)
					payoutView.presentPayout(payout * progress)
					//payoutView.scale.x = 1 - 0.05 * scaleProgress
					//payoutView.scale.y = 1 + 0.15 * scaleProgress

					const colorProgress = Math.abs(Math.sin(Math.PI * ((progress * 2) % 1)))
					const color = colorToColor(
						255,
						255,
						0,
						255,
						0,
						255,
						colorProgress
					)

					//payoutView.setColor(color)
			

					
				}
			})

		presentationTimeline
			.addAnimation({
				duration: 300,
				onProgress: progress => {
					payoutView.alpha = progress
					awardView.presentTransition(progress)
				}
			})
			.play()

		await super.setVisible()


		await new Promise(resolve => {
			this.eventMode = 'static'
			this.cursor = 'pointer'
			this.addEventListener('pointerdown', () => {
				this.removeAllListeners()
				this.eventMode = 'none'
				this.cursor = 'default'
				resolve()
				this.audio.skipSplashScreen()
			})

			presentationTimeline.addAnimation({
				delay: presentationTimeline.duration,
				duration: 5000,
				onFinish: () => resolve()
			})
		})

		await this.setVisible(false)
        this.idleTimeline.pause()
		this.presentationTimeline.pause()
	}
}