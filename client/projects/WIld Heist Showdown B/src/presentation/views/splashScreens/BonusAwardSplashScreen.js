import { Timeline } from "../../timeline/Timeline";
import { colorToColor } from "../GraphicalPrimitives";
import { SpineView } from "../SpineView";
import { TextField } from "../text/TextField";
import { BaseSplashScreen } from "./BaseSplashScreen";

export class BonusAwardSplashScreen extends BaseSplashScreen {
	presentationTimeline = new Timeline
	idleTimeline
	spinsCountTextField
	spinsWonTextField
	dictionary

	constructor({
		assets,
		dictionary,
		renderer,
		isMobileDevice,
		camera,
		awardView,
		audio
	}) {
        super({
            assets,
            dictionary,
            isMobileDevice,
            camera, 
			awardView,
			audio
        })

		this.dictionary = dictionary
		this.initSpine(assets)
        this.initTexts({
			assets,
			dictionary,
			renderer,
			isMobileDevice
		})

		this.initIdleTimeline()
    }
	

	initTexts({
		dictionary,
		assets,
		renderer,
		isMobileDevice
	}) {
        const { bodyView } = this

		let maximalWidth = 1000
		let maximalHeight = 400
        


		// FS COUNT TEXT LINE...
		maximalWidth = 400
		maximalHeight = 400
        this.spinsCountTextField = bodyView
            .addChild(new TextField({
                maximalWidth,
                maximalHeight
            }))
            .setFontName(
			'0123456789.,',
			[
				assets.paydigit0,
				assets.paydigit1,
				assets.paydigit2,
				assets.paydigit3,
				assets.paydigit4,
				assets.paydigit5,
				assets.paydigit6,
				assets.paydigit7,
				assets.paydigit8,
				assets.paydigit9,
				assets.paydot,
				assets.paydot,
			])

			.setFontSize(maximalHeight)
			.setAlignCenter()
			.setAlignMiddle()
			.setLetterSpacing(5)

		this.spinsCountTextField.pivot.set(maximalWidth / 2, maximalHeight / 2)

        this.spinsCountTextField.position.set(650, 500)
        // ...FS COUNT TEXT LINE


    }


	initSpine(assets) { 
		const spineView = new SpineView(assets.popup); 
		spineView.position.set(650,1200)
		this.bodyView.addChild(spineView); 
		spineView.scale.set(1)
		this.spineView = spineView; 
	}




	initIdleTimeline() {
        this.idleTimeline = new Timeline

        this.idleTimeline
			.deleteAllAnimations()
			.addAnimation({
				duration: 10000,
				onProgress: progress => {
					const subProgress = (progress * 5) % 1
					this.awardView.setIdleProgress(subProgress)
					this.spineView.playAnimation({ name: 'bonus',  isLoopMode: true });
					const spinsCountProgress = (subProgress * 4) % 1

					this.hintView.present(spinsCountProgress)
				}
			})
			.setLoopMode()
    }

	async presentAward({awardedFreeSpinsCount, awardedKeysCount = 0}) {
		const pageSymbolsIds = []
		const { awardView, dictionary } = this

		this.bodyView.addChildAt(this.awardView, 0)
		awardView.position.set(645, 1309)
		awardView.setSkin('bonus')
		awardView.presentFSTransition(0)



		this.idleTimeline.play()
		this.spinsCountTextField.setText(awardedFreeSpinsCount)

		await super.setVisible()

		await new Promise(resolve => {
			this.presentationTimeline
				.deleteAllAnimations()
				.addAnimation({
					duration: 300,
					onProgress: progress => {
						awardView.presentFSTransition(progress)
					},
				})
				.addAnimation({
					duration: 5000,
					onProgress: progress => {
						const multiplier = 1 + 0.75 * Math.sin(Math.PI * progress)
						const scrollProgress = progress ** 2 * multiplier * pageSymbolsIds.length
						const currentSymbolIndex = Math.trunc(scrollProgress)
					},
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
		this.idleTimeline.pause()
		this.presentationTimeline.pause()
	}
}