import { formatMoney } from "../../Utils";
import { Timeline } from "../../timeline/Timeline";
import { TextField } from "../text/TextField";
import { BaseSplashScreen } from "./BaseSplashScreen";
import { BookOfCoinsView } from "./books/BookOfCoinsView";

export class BonusPayoutSplashScreen extends BaseSplashScreen {
	payoutTextField
	idleTimeline = new Timeline
	presentationTimeline = new Timeline
    bookView

	constructor({
		resources,
		dictionary,
		isMobileDevice,
		camera,
	}) {
        super({
            resources,
            dictionary,
            isMobileDevice,
            camera, 
        })

		this.initBook(resources)
        this.initTexts(resources, dictionary)
        this.initIdleTimeline()
	}

	initBody() {
		super.initBody({
			width: 1600,
			height: 1200
		})
	}

	initBook(resources) {
        const bookView = new BookOfCoinsView(resources)
		this.bodyView.addChild(bookView)
		bookView.position.set(800, 550)
        bookView.scale.set(0.8)

        this.bookView = bookView
    }

	initTexts(resources, dictionary) {
        const { bodyView, isMobileDevice } = this

		bodyView.addChild(new TextField({
				maximalWidth: 1600,
				maximalHeight: 90
			}))
			.setFontName('default')
			.setText(dictionary.free_spins_over_bmp)
			.setFontColor(0xFF3300)
			.setFontSize(50)
			.setAlignCenter()
			.setAlignBottom()
			.y = 125


        bodyView.addChild(
			new TextField({
				maximalWidth: 1600,
				maximalHeight: 125
			}))
			.setFontName('default')
			.setText(dictionary.congratulations_bmp)
			.setFontColor(0xFF5500)
			.setFontSize(90)
			.setAlignCenter()
			.setAlignMiddle()
			.y = 25

		bodyView.addChild(new TextField({
				maximalWidth: 1600,
				maximalHeight: 90
			}))
			.setFontName('default')
			.setText(dictionary.you_have_won_bmp)
			.setFontColor(0xFF3300)
			.setFontSize(50)
			.setAlignCenter()
			.setAlignBottom()
			.y = 785
        
        // PAYOUT...
        this.payoutTextField = bodyView
            .addChild(new TextField({
                maximalWidth: 1600,
                maximalHeight: 125
            }))
            .setFontName(
				'0123456789.,',
				[
					resources.digit_0,
					resources.digit_1,
					resources.digit_2,
					resources.digit_3,
					resources.digit_4,
					resources.digit_5,
					resources.digit_6,
					resources.digit_7,
					resources.digit_8,
					resources.digit_9,
					resources.period,
					resources.comma,
				])
			.setFontColor(0xFF9900)
			.setFontSize(100)
			.setAlignCenter()
			.setAlignMiddle()



		this.payoutTextField.pivot.set(800, 62)
		this.payoutTextField.pivot.set(800, 62)
        this.payoutTextField.x = 800
        this.payoutTextField.y = 950
        // ...PAYOUT

		bodyView.addChild(
			new TextField({
				maximalWidth: 1600,
				maximalHeight: 90
			}))
			.setFontName('default')
			.setText(dictionary[
				(isMobileDevice ? 'tap' : 'click')
				+ '_anywhere_to_continue_bmp'
			])
			.setFontColor(0xFF9900)
			.setFontSize(35)
			.setAlignCenter()
			.setAlignMiddle()
			.y = 1050
    }

    initIdleTimeline() {
        const { bookView } = this

        this.idleTimeline = new Timeline

        this.idleTimeline
			.deleteAllAnimations()
			.addAnimation({
				duration: 10000,
				onProgress: progress => {
					bookView.presentFloating(progress)
					bookView.presentScrolling({progress: (progress * 10) % 1})
				}
			})
			.setLoopMode()
    }

	async presentPayout(payout = 0) {
		const { payoutTextField, bookView, presentationTimeline } = this
		
		this.idleTimeline.play()

		presentationTimeline
			.deleteAllAnimations()
			.addAnimation({
				duration: 3000,
				onProgress: (progress) => {
					payoutTextField.setText(formatMoney(payout * progress))

					const scaleProgress = Math.abs(Math.sin(Math.PI * ((progress * 10) % 1)))
					payoutTextField.scale.x = 1 - 0.05 * scaleProgress
					payoutTextField.scale.y = 1 + 0.15 * scaleProgress
				}
			})
			.addAnimation({
				duration: 300,
				onProgress: progress => {
					bookView.scale.set(0.8 * progress ** 2)
					payoutTextField.alpha = progress
				}
			})
			.addAnimation({
				delay: 300,
				duration: 200,
				onProgress: progress => {
					bookView.scale.set(0.8 - 0.025 * Math.sin(Math.PI * progress))
				}
			})
			.addAnimation({
				delay: 500,
				duration: 2500,
				onProgress: progress => {
					bookView.scale.set(0.8 + 0.01 * progress)
				}
			})
			.play()

		await super.setVisible()


		await new Promise(resolve => {
			this.eventMode = 'static'
			this.cursor = 'pointer'
			this.on('pointerdown', () => {
				this.removeAllListeners()
				this.eventMode = 'none'
				this.cursor = 'default'
				resolve()
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

	updateTargetArea(sidesRatio) {
		const {
			bodyView,
			isMobileDevice
		} = this

		if(sidesRatio > 1.25) {
			 // WIDE LANDSCAPE...
			bodyView
				.setTargetArea({x: 0, y: 0, width: 1, height: isMobileDevice ? 0.8 : 0.9})
				.stickMiddle()
			// ...WIDE LANSCAPE
		} else if (sidesRatio >= 0.8) {
			// NARROW LANDSCAPE...
			bodyView.setTargetArea({
				x: -0.4,
				y: 0.1,
				width: 1.8,
				height: 0.7,
			})
			.stickMiddle()
			// ...NARROW LANDSCAPE
		} else {
			// PORTRAIT...
			bodyView.setTargetArea({
				x: -0.25,
				y: 0.1,
				width: 1.5,
				height: 0.575,
			})
			.stickBottom()
			// ...PORTRAIT
		}
	}
}