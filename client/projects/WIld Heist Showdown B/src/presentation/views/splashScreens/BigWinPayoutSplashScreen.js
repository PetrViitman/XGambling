
import { BaseSplashScreen } from "./BaseSplashScreen";
import { Timeline } from "../../timeline/Timeline";
import { WIN_COEFFICIENTS } from "../../Constants";
import { AwardPayoutView } from "./award/AwardPayoutView";

import { SpineView } from "../SpineView";
import { AwardView } from "./award/AwardView";


export class BigWinPayoutSplashScreen extends BaseSplashScreen {
	presentationTimeline = new Timeline
	idleTimeline = new Timeline
	

	initBody() {

		const {
			assets,
			spineView,
			dictionary,
			isMobileDevice,
			renderer
		} = this

		super.initBody({
			assets,
			width: 1290,
			height: 1800,
		})

		const { bodyView } = this
		
		bodyView.setTargetArea({
			x: 0,
			y: 0,
			width: 1,
			height: 1
		})
		
		this.initPayout(assets)
		this.initSpine(assets)
    }

	initSpine(assets) { 
		const spineView = new SpineView(assets.popup); 
		//spineView.pivot.set(spineView.width / 2, spineView.height /2)
		spineView.position.set(645, 1200)
		spineView.scale.set(1)
		this.bodyView.addChild(spineView); 
		this.spineView = spineView; 
	}


	presentShineAnimation(name) {

		switch (name) {
			case 0:
				
				this.spineView.playAnimation({ name: 'big', isLoopMode: true });
				this.spineView.position.y = 1200;
				break;
			case 1:
				
				this.spineView.playAnimation({ name: 'mega',  isLoopMode: true });
				this.spineView.position.y -= 40;
				break;
			case 2:
				
				this.spineView.playAnimation({ name: 'huge',  isLoopMode: true });
				this.spineView.position.y -= 20;
				break;
				
		}
	}

	presentShineAnimationTransition(progress) {
        const subProgress = Math.sin(Math.PI * progress)

        this.spineView.scale.set(1 + 0.25 * subProgress)
        this.spineView.alpha = progress
	}
	initPayout(assets) {
		this.payoutView = this.bodyView.addChild(new AwardPayoutView(assets))
		this.payoutView.position.set(645, 900)
		//this.presentShineAnimation()
	}

	addSubWinAnimation({
		timeline,
		isFirstSubWin = false,
		isFinalSubWin = true,

		name,
		text = '',
	}) {
		const {awardView} = this
		const delay = timeline.duration || 1
		const duration = isFinalSubWin ? 3000 : 2750

		const levelMap = {
			'big': 0,
			'huge': 1,
			'mega': 2
		}

		timeline
		// WIN PRESENTATION...
			.addAnimation({
				delay,
				duration: 300,
				onDelayFinish: () => {
					isFirstSubWin
					||
					this.audio.presentBigWinTransition(levelMap[name])
					awardView.setSkin(name)
					
					this.presentShineAnimation((levelMap[name]))
				
				},
				onProgress: (progress) => {
					
					this.payoutView.presentGlow()
					awardView.presentTransition(progress)
					
					this.presentShineAnimationTransition(progress)

					if(isFirstSubWin) return

				}
			})

		// ...WIN PRESENTATION

		// FADE AWAY TO NEXT SUB WIN...
		isFinalSubWin || timeline
			.addAnimation({
				delay: delay + duration,
				duration: 250,
				onProgress: (progress) => {
					const reversedProgress = 1 - progress
					
					awardView.alfa = 0

				}
			})
		// ...FADE AWAY TO NEXT SUB WIN
	}

	async presentPayout({
		coefficient, 
		payout
	}) {
		const {
		
	
			awardView,
			spineView,
			presentationTimeline,
			idleTimeline,
			payoutView
		} = this
		this.idleTimeline.play()
		this.bodyView.addChildAt(this.awardView, 1)

		this.bodyView.addChildAt(this.spineView,2)
		this.bodyView.addChildAt(this.payoutView,3)
		
		awardView.position.set(645, 850)

		//awardView.setSkin('big')
		awardView.presentTransition(0)
		this.presentShineAnimationTransition()
		
	
		
		this.hintView.y = 1625
		this.hintView.scale.set(0.65)


		idleTimeline
			.deleteAllAnimations()
			.addAnimation({

				duration: 10000,
				onProgress: progress => {
					const subProgress = (progress * 5) % 1
					awardView.setIdleProgress(subProgress )
					//this.bodyView.scale.set( 1 + 0.025 * Math.sin(Math.PI * 2 * progress))
					payoutView.setIdleProgress(subProgress )
					this.hintView.present((progress * 20) % 1)


					
				}
			})
			.setLoopMode()

		presentationTimeline.wind(0).deleteAllAnimations()
		
		
		await this.setVisible()

		const isHugeWin = coefficient >= WIN_COEFFICIENTS.HUGE
		const isMegaWin = coefficient >= WIN_COEFFICIENTS.MEGA

		this.addSubWinAnimation({
			isFirstSubWin: true,
			timeline: presentationTimeline,
			isFinalSubWin: !isHugeWin && !isMegaWin,
			name: 'big'
		})
		

		isHugeWin
		&& this.addSubWinAnimation({
			timeline: presentationTimeline,
			isFinalSubWin: !isMegaWin,
			name: 'huge',
			
			
		})

		isMegaWin
		&& this.addSubWinAnimation({
			timeline: presentationTimeline,
			name: 'mega'
		})

		let countingDuration = 3000
		if(isHugeWin) countingDuration += 3000
		if(isMegaWin) countingDuration += 3000
		
		this.audio.presentCounting({duration: countingDuration})

		await new Promise(resolve => {

			presentationTimeline
				.addAnimation({
					duration: countingDuration,
					onProgress: (progress) => {
						const scaleProgress = Math.abs(Math.sin(Math.PI * ((progress * 10) % 1)))
						payoutView.presentPayout(payout * progress)
						
					}
				})
				.addAnimation({
					duration: 300,
					onProgress: progress => {
						payoutView.alpha = progress
					}
				})

				.addAnimation({
					duration: countingDuration + 3000,
					onFinish: () => resolve()
				})
				.play()

			this.eventMode = 'static'
			this.cursor = 'pointer'
			this.addEventListener('pointerdown', () => {
				this.removeAllListeners()
				this.eventMode = 'none'
				this.cursor = 'default'
				resolve()
				this.audio.skipSplashScreen()
			})
		})

		await this.setVisible(false)
		idleTimeline.pause()
		presentationTimeline.pause()
	}
}