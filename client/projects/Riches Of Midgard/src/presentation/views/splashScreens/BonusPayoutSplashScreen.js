import { Timeline } from "../../timeline/Timeline";
import { TextField } from "../text/TextField";
import { BaseSplashScreen } from "./BaseSplashScreen";
import { SpecialWinDecorationView } from "./SpecialWinDecorationView";

export class BonusPayoutSplashScreen extends BaseSplashScreen {
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

		bodyView.addChild(
			new TextField({
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

		this.payoutTextField = bodyView.addChild(
			new TextField({
				maximalWidth: 1000,
				maximalHeight: 150
			}))
			.setFontName('default')
			.setFontColor(0xFF5500)
			.setFontSize(150)
			.setAlignCenter()
			.setAlignMiddle()
		this.payoutTextField.y = 1200
	
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
			.setFontColor(0xAA00FF)
			.setFontSize(90)
			.setAlignCenter()
			.setAlignMiddle()
			.y = 1355

	}

	async presentPayout(payout = 0) {    

		this.payoutTextField.setText(payout + '')

		this.decorationView.play()
		await this.setVisible()

		await new Promise(resolve => {
			this.timeline
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