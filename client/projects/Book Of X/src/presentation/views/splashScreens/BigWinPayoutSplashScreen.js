import { TextField } from "../text/TextField";
import { BaseSplashScreen } from "./BaseSplashScreen";
import { Timeline } from "../../timeline/Timeline";
import { formatMoney } from "../../Utils";
import { WIN_COEFFICIENTS } from "../../Constants";
import { BookOfCoinsView } from "./books/BookOfCoinsView";

export class BigWinPayoutSplashScreen extends BaseSplashScreen {
	presentationTimeline = new Timeline
	idleTimeline = new Timeline

	initBody() {
		const {
			resources,
			dictionary,
			isMobileDevice
		} = this

		super.initBody({
			resources,
			width: 1000,
			height: 1500
		})

		const { bodyView } = this
		
		bodyView.setTargetArea({
			x: 0,
			y: 0,
			width: 1,
			height: 0.9
		})

		this.bookView = new BookOfCoinsView(resources)
		bodyView.addChild(this.bookView)
		this.bookView.position.set(500, 775)

		bodyView.addChild(
			new TextField({
				maximalWidth: 1000,
				maximalHeight: 125
			}))
			.setFontName('default')
			.setText(dictionary.congratulations_bmp)
			.setFontColor(0xFF9900)
			.setFontSize(90)
			.setAlignCenter()
			.setAlignMiddle()
			.y = 25

		this.captionTextField = bodyView.addChild(
			new TextField({
				maximalWidth: 1000,
				maximalHeight: 200
			}))
			.setFontName('default')
			.setFontSize(200)
			.setAlignCenter()
			.setAlignMiddle()

		this.captionTextField.pivot.set(500, 100)
		this.captionTextField.position.set(500, 245)

		this.payoutTextField = bodyView.addChild(
			new TextField({
				maximalWidth: 1000,
				maximalHeight: 150
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
			.setFontSize(150)
			.setAlignCenter()
			.setAlignMiddle()
		this.payoutTextField.position.set(500, 1275)
		this.payoutTextField.pivot.set(500, 75)
	
		bodyView.addChild(
			new TextField({
				maximalWidth: 1000,
				maximalHeight: 90
			}))
			.setFontName('default')
			.setText(dictionary[
				(isMobileDevice ? 'tap' : 'click')
				+ '_anywhere_to_continue_bmp'
			])
			.setFontColor(0xFF9900)
			.setFontSize(90)
			.setAlignCenter()
			.setAlignMiddle()
			.y = 1355
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


	addSubWinAnimation({
		timeline,
		isFirstSubWin = false,
		isFinalSubWin = true,
		fontColor = 0xFFEE00,
		text = '',
	}) {
		const {
			bookView,
			captionTextField,
		} = this
	
		const delay = timeline.duration || 1
		const duration = isFinalSubWin ? 3000 : 2750

		timeline
		// WIN PRESENTATION...
			.addAnimation({
				delay,
				duration: 300,
				onDelayFinish: () => {
					captionTextField
						.setFontColor(fontColor)
						.setText(text)
				},
				onProgress: (progress) => {
					const reversedProgress = 1 - progress
					captionTextField.alpha = progress ** 2
					captionTextField.y = 245 + 200 * reversedProgress


					if(isFirstSubWin) return
					const distortionProgress = Math.sin(Math.PI * 3 * progress) * (progress - 1)
					bookView.y = 775 + 200 * distortionProgress
				}
			})
			.addAnimation({
				delay,
				duration,
				onProgress: (progress) => {
					const scaleProgress = Math.abs(Math.cos(Math.PI * 2 * ((progress * 3) % 1))) 
					captionTextField.scale.set(1 - 0.1 * scaleProgress)
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
					captionTextField.scale.set(reversedProgress)
				}
			})
		// ...FADE AWAY TO NEXT SUB WIN
	}

	async presentPayout({
		coefficient, 
		payout
	}) {
		const {
			dictionary,
			captionTextField,
			bookView,
			presentationTimeline,
			idleTimeline
		} = this


		idleTimeline
			.deleteAllAnimations()
			.addAnimation({
				duration: 10000,
				onProgress: progress => {
					bookView.presentFloating(progress)
					bookView.presentScrolling({progress: (progress * 10) % 1})
				}
			})
			.setLoopMode()
			.play()

		presentationTimeline.wind(0).deleteAllAnimations()
		captionTextField.alpha = 0
		bookView.scale.set(0)
		await this.setVisible()

		const isHugeWin = coefficient >= WIN_COEFFICIENTS.HUGE
		const isMegaWin = coefficient >= WIN_COEFFICIENTS.MEGA

		this.addSubWinAnimation({
			isFirstSubWin: true,
			timeline: presentationTimeline,
			text: dictionary.big_win_bmp,
			fontColor: 0xFFBB88,
			isFinalSubWin: !isHugeWin && !isMegaWin,
		})

		isHugeWin
		&& this.addSubWinAnimation({
			timeline: presentationTimeline,
			text: dictionary.huge_win_bmp,
			fontColor: 0xFF7733,
			isFinalSubWin: !isMegaWin,
		})

		isMegaWin
		&& this.addSubWinAnimation({
			timeline: presentationTimeline,
			text: dictionary.mega_win_bmp,
			fontColor: 0xBBBB55,
		})

		let countingDuration = 3000
		if(isHugeWin) countingDuration += 3000
		if(isMegaWin) countingDuration += 3000

		await new Promise(resolve => {

			presentationTimeline
				.addAnimation({
					duration: countingDuration,
					onProgress: (progress) => {
						this.payoutTextField.setText(formatMoney(payout * progress))

						const scaleProgress = Math.abs(Math.sin(Math.PI * ((progress * 10) % 1)))
						this.payoutTextField.scale.x = 1 - 0.05 * scaleProgress
						this.payoutTextField.scale.y = 1 + 0.15 * scaleProgress
					}
				})
				.addAnimation({
					duration: 300,
					onProgress: progress => {
						bookView.scale.set(1 * progress ** 2)
						this.payoutTextField.alpha = progress
					}
				})
				.addAnimation({
					delay: 300,
					duration: 200,
					onProgress: progress => {
						bookView.scale.set(1 - 0.025 * Math.sin(Math.PI * progress))
					}
				})
				.addAnimation({
					delay: 500,
					duration: countingDuration - 500,
					onProgress: progress => {
						bookView.scale.set(1 + 0.01 * progress)
					},
				})
				.addAnimation({
					duration: countingDuration + 3000,
					onFinish: () => resolve()
				})
				.play()

			this.eventMode = 'static'
			this.cursor = 'pointer'
			this.on('pointerdown', () => {
				this.removeAllListeners()
				this.eventMode = 'none'
				this.cursor = 'default'
				resolve()
			})
		})

		await this.setVisible(false)
		idleTimeline.pause()
		presentationTimeline.pause()
	}
}