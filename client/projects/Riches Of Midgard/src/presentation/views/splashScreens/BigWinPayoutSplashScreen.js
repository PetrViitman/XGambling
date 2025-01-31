import { TextField } from "../text/TextField";
import { BaseSplashScreen } from "./BaseSplashScreen";
import { Timeline } from "../../timeline/Timeline";
import { formatMoney } from "../../Utils";
import { WIN_COEFFICIENTS } from "../../Constants";
import { SpecialWinDecorationView } from "./SpecialWinDecorationView";


export class BigWinPayoutSplashScreen extends BaseSplashScreen {
	countingTimeline = new Timeline

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

		this.decorationView = new SpecialWinDecorationView(resources)
		bodyView.addChild(this.decorationView)
		this.decorationView.position.set(500, 800)

		bodyView.addChild(
			new TextField({
				maximalWidth: 1000,
				maximalHeight: 125
			}))
			.setFontName('runes')
			.setText(dictionary.congratulations_bmp)
			.setFontColor(0xFF5500)
			.setFontSize(90)
			.setAlignCenter()
			.setAlignMiddle()
			.y = 25

		this.captionTextField = bodyView.addChild(
			new TextField({
				maximalWidth: 1000,
				maximalHeight: 200
			}))
			.setFontName('runes')
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
			.setFontName('runes')
			.setFontColor(0xFF5500)
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
			.setFontName('runes')
			.setText(dictionary[
				(isMobileDevice ? 'tap' : 'click')
				+ '_anywhere_to_continue_bmp'
			])
			.setFontColor(0xFF5500)
			.setFontSize(90)
			.setAlignCenter()
			.setAlignMiddle()
			.y = 1355
	}


	addSubWinAnimation({
		timeline,
		isFinalSubWin = true,
		fontColor = 0xCCFF3b,
		text = '',
	}) {
		const {
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
			decorationView,
			timeline,
			countingTimeline
		} = this

		captionTextField.alpha = 0
		decorationView.play()
		decorationView.scale.set(1)

		timeline.wind(0).deleteAllAnimations()
		await this.setVisible()

		const isHugeWin = coefficient >= WIN_COEFFICIENTS.HUGE
		const isMegaWin = coefficient >= WIN_COEFFICIENTS.MEGA

		this.addSubWinAnimation({
			timeline,
			text: dictionary.big_win_bmp,
			fontColor: 0xFF3b00,
			isFinalSubWin: !isHugeWin && !isMegaWin,
		})

		isHugeWin
		&& this.addSubWinAnimation({
			timeline,
			text: dictionary.huge_win_bmp,
			fontColor: 0xFF3bFF,
			isFinalSubWin: !isMegaWin,
		})

		isMegaWin
		&& this.addSubWinAnimation({
			timeline,
			text: dictionary.mega_win_bmp,
			fontColor: 0xAA00FF,
		})

		timeline.play()

		let countingDuration = 3000
		if(isHugeWin) countingDuration += 3000
		if(isMegaWin) countingDuration += 3000
		countingTimeline
			.deleteAllAnimations()
			.addAnimation({
				duration: countingDuration,
				onProgress: (progress) => {
					this.payoutTextField.setText(formatMoney(payout * progress))

					const scaleProgress = Math.abs(Math.cos(Math.PI * ((progress * 10) % 1)))
					this.payoutTextField.scale.set(1 - 0.25 * scaleProgress)

					decorationView.scale.set(1 + 0.5 * progress)
				}
			})
			.play()

		await new Promise(resolve => {
			countingTimeline.addAnimation({
				duration: countingTimeline.duration + 3000,
				onFinish: resolve
			})

			this.eventMode = 'static'
			this.cursor = 'pointer'
			this.on('pointerdown', resolve)
		})

		this.removeAllListeners()
		this.eventMode = 'none'
		this.cursor = 'default'

		await this.setVisible(false)
		decorationView.pause()
	}
}