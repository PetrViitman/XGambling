import { TextField } from "../text/TextField";
import { BaseSplashScreen } from "./BaseSplashScreen";
import { SpecialWinDecorationView } from "./SpecialWinDecorationView";

export class BonusAwardSplashScreen extends BaseSplashScreen {
	initBody() {
		const {
			resources,
			dictionary,
			isMobileDevice
		} = this

		super.initBody({
			width: 1000,
			height: 1200
		})

		const { bodyView } = this

		this.decorationView = new SpecialWinDecorationView(resources, true)
		bodyView.addChild(this.decorationView)
		this.decorationView.position.set(500, 700)
		this.decorationView.scale.set(1.25)

		bodyView.addChild(
			new TextField({
				maximalWidth: 1000,
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
				maximalWidth: 1000,
				maximalHeight: 90
			}))
			.setFontName('default')
			.setText(dictionary.you_have_won_bmp)
			.setFontColor(0xAA00FF)
			.setFontSize(75)
			.setAlignCenter()
			.setAlignBottom()
			.y = 150

		this.spinsCountTextField = bodyView
			.addChild(new TextField({
				maximalWidth: 1000,
				maximalHeight: 90
			}))
			.setFontName('default')
			.setFontColor(0xAA00FF)
			.setFontSize(75)
			.setAlignCenter()
			.setAlignMiddle()

		this.spinsCountTextField.y = 240
	
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
			.setFontColor(0xFF5500)
			.setFontSize(90)
			.setAlignCenter()
			.setAlignMiddle()
			.y = 1060
	}

	async presentAward(freeSpinsCount = 0) {
		const { timeline } = this
		this.spinsCountTextField.setText(
			freeSpinsCount + ' ' + this.dictionary.free_spins_bmp)

		this.decorationView.play()

		await super.setVisible()
		await new Promise(resolve => {
			timeline
				.deleteAllAnimations()
				.addAnimation({
					duration: 3000,
					onFinish: resolve
				})
				.play()

			this.eventMode = 'static'
			this.cursor = 'pointer'
			this.on('pointerdown', resolve)
		})

		this.removeAllListeners()
		this.eventMode = 'none'
		this.cursor = 'default'

		await this.setVisible(false)
		this.decorationView.pause()
	}
}