import { Timeline } from "../../timeline/Timeline";
import { TextField } from "../text/TextField";
import { BaseSplashScreen } from "./BaseSplashScreen";
import { BookOfSymbolsView } from "./books/BookOfSymbolsView";
import { BookOfChipsView } from "./books/BookOfChipsView";

export class BonusAwardSplashScreen extends BaseSplashScreen {
	presentationTimeline = new Timeline
	idleTimeline
	spinsCountTextField
	commentTextField
	booksViews
	dictionary

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

		this.dictionary = dictionary
        this.initBooks(resources)
        this.initTexts({
			resources,
			dictionary,
			isMobileDevice
		})

		this.initIdleTimeline()
    }

	initBody() {
		super.initBody({
			width: 1600,
			height: 1500
		})
	}

	initBooks(resources) {
		this.booksViews = [
			new BookOfSymbolsView(resources),
			new BookOfChipsView(resources)
		].map(view => {
			view.position.set(800, 800)
			this.bodyView.addChild(view)
			view.visible = false

			return view
		})
    }

	initTexts({
		resources,
		dictionary,
		isMobileDevice
	}) {
        const { bodyView } = this

        bodyView.addChild(
			new TextField({
				maximalWidth: 1600,
				maximalHeight: 150
			}))
			.setFontName('default')
			.setText(dictionary.congratulations_bmp)
			.setFontColor(0xFF5500)
			.setFontSize(150)
			.setAlignCenter()
			.setAlignMiddle()
			.y = 25

		this.spinsCountTextField = bodyView
            .addChild(new TextField({
                maximalWidth: 1600,
                maximalHeight: 90
            }))
            .setFontName('default')
			.setFontColor(0xFF5500)
			.setFontSize(90)
			.setAlignCenter()
			.setAlignTop()
            .setText(dictionary.you_have_won_bmp)

        this.spinsCountTextField.y = 180

		// FS COUNT TEXT LINE...
        this.spinsCountTextField = bodyView
            .addChild(new TextField({
                maximalWidth: 1600,
                maximalHeight: 80
            }))
            .setFontName('default')
			.setFontColor(0xFF9900)
			.setFontSize(80)
			.setAlignCenter()
			.setAlignTop()

        this.spinsCountTextField.y = 320
        // ...FS COUNT TEXT LINE

		this.commentTextField = bodyView
			.addChild(new TextField({
				maximalWidth: 1600,
				maximalHeight: 65
			}))
			.setFontName('default')
			.setText(dictionary.special_symbol_bmp)
			.setFontColor(0xFF00AA)
			.setFontSize(55)
			.setAlignCenter()
			.setAlignBottom()
		
		this.commentTextField.y = 1150

		bodyView.addChild(
			new TextField({
				maximalWidth: 1600,
				maximalHeight: 60
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
			.y = 1300
    }

	initIdleTimeline() {
        this.idleTimeline = new Timeline

        this.idleTimeline
			.deleteAllAnimations()
			.addAnimation({
				duration: 10000,
				onProgress: progress => {
					this.booksViews.forEach(view =>
						view.presentFloating(progress))

					this.booksViews[1].presentScrolling({progress: (progress * 10) % 1})
				}
			})
			.setLoopMode()
    }

	async presentAward({awardedFreeSpinsCount, specialSymbolId}) {
		const randomSymbolsIds = [0, 1, 2, 3, 4, 5, 6, 7, 8]
		const pageSymbolsIds = []
		const { booksViews, dictionary } = this
		const isSpecialSymbolAwarded = specialSymbolId !== undefined

		this.commentTextField.setText(
			dictionary[isSpecialSymbolAwarded
				? 'special_symbol_bmp'
				: 'additionally_bmp'
			])
	
		booksViews.forEach(view => view.presentScrolling({}))
		booksViews[0].visible = !!isSpecialSymbolAwarded
		booksViews[1].visible = !isSpecialSymbolAwarded

		while(randomSymbolsIds.length) {
			const index = Math.trunc(randomSymbolsIds.length * Math.random())
			const symbolId = randomSymbolsIds[index]
			randomSymbolsIds.splice(index, 1)
			pageSymbolsIds.push(symbolId)
		}

		if(pageSymbolsIds[pageSymbolsIds.length - 1] !== specialSymbolId)
			pageSymbolsIds.push(specialSymbolId)

		this.idleTimeline.play()
		this.spinsCountTextField.setText(
			awardedFreeSpinsCount + ' ' + this.dictionary.free_spins_bmp)

		await super.setVisible()

		await new Promise(resolve => {
			this.presentationTimeline
				.deleteAllAnimations()
				.addAnimation({
					duration: 5000,
					onProgress: progress => {
						const multiplier = 1 + 0.75 * Math.sin(Math.PI * progress)
						const scrollProgress = progress ** 2 * multiplier * pageSymbolsIds.length
						const currentSymbolIndex = Math.trunc(scrollProgress)

						booksViews[0].presentScrolling({
							progress: scrollProgress % 1,
							currentSymbolId: pageSymbolsIds[currentSymbolIndex - 1] ?? -1,
							nextSymbolId: pageSymbolsIds[currentSymbolIndex] ?? -1,
						})
					}
				})
				.addAnimation({
					delay: 4500,
					duration: 1500,
					onProgress: progress => booksViews[0].presentWin(progress)
				})
				.addAnimation({
					delay: 6000,
					duration: 5000,
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
				x: 0,
				y: 0.1,
				width: 1,
				height: 0.7,
			})
			.stickMiddle()
			// ...NARROW LANDSCAPE
		} else {
			// PORTRAIT...
			bodyView.setTargetArea({
				x: -0.2,
				y: 0.1,
				width: 1.4,
				height: 0.575,
			})
			.stickBottom()
			// ...PORTRAIT
		}
	}
}