import { Container, Graphics, Sprite } from "pixi.js";
import { Timeline } from "../../timeline/Timeline";
import { SymbolClubView } from "../reels/cell/symbols/SymbolClubView";
import { SymbolHeartView } from "../reels/cell/symbols/SymbolHeartView";
import { TextField } from "../text/TextField";
import { BaseSplashScreen } from "./BaseSplashScreen";
import { BookOfRiskView } from "./books/BookOfRiskView";
import { getRectangleSpot } from "../GraphicalPrimitives";
import { formatMoney } from "../../Utils";
import { AdaptiveContainer } from "../adaptiveDesign/AdaptiveContainer";

export class DoubleUpSplashScreen extends BaseSplashScreen {
    headerView
    payout = 0
	presentationTimeline = new Timeline
    idleTimeline = new Timeline
    bookView
    buttonHeartView
    captionRedView
    buttonClubView
    captionGreenView
    payoutTextField
    buttonCollectView
    buttonHeartView
    buttonClubView
    buttonsViews = []
    buttonsCaptionsViews = []
    buttonsGlowViews = []
    instructionsViews = []
    handView
    idleFactor = 1

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

        this.initTexts(resources, dictionary)
        this.initBook(resources)
        this.initHeartButton(resources, dictionary)
        this.initClubButton(resources, dictionary)
        this.initCollectButton(dictionary)
        this.initHand(resources)
        this.initIdleTimeline()

        this.eventMode = 'static'
        this.cursor = 'default'
    }

	initBody() {
		super.initBody({
			width: 1600,
			height: 1200
		})
	}

    initBook(resources) {
        const bookView = new BookOfRiskView(resources)
		this.bodyView.addChild(bookView)
		bookView.position.set(800, 550)
        bookView.scale.set(0.8)

        this.bookView = bookView
    }

    initHand(resources) {
        const view = new Sprite(resources.hand)
        view.anchor.set(0.5)
        this.handView = view
        view.alpha = 0
        view.scale.set(0.8)
        view.eventMode = 'none'
        this.bodyView.addChild(view)
    }

    initHeartButton(resources, dictionary) {
        const { bodyView } = this
        const container = bodyView.addChild(new Container)
        container.position.set(200, 550)

        // SYMBOL....
        const view = new SymbolHeartView(resources)
        container.addChild(view)
        view.scale.set(1)
        view.presentationSpinProgress = -0.025
        // ...SYMBOL

        // GLOW...
        const glowView = container.addChild(getRectangleSpot({
            width: 70,
            height: 15,
            color: 0x661133
        }))
        glowView.scale.set(1, 1.25)
        glowView.y = 150
        this.buttonsGlowViews.push(glowView)
        // ...GLOW

        // CAPTION...
        const textView = container
            .addChild(new TextField({
                maximalWidth: 200,
                maximalHeight: 50
            }))
            .setFontName('egypt')
            .setText(dictionary.red_bmp)
            .setFontColor(0xFF0000)
            .setFontSize(90)
            .setAlignCenter()
            .setAlignMiddle()

        textView.y = 150
        textView.pivot.set(100, 25)
        this.buttonsCaptionsViews.push(textView)
        // ...CAPTION

        this.buttonHeartView = view

        this.buttonsViews.push(container)
    }

    initClubButton(resources, dictionary) {
        const { bodyView } = this
        const container = bodyView.addChild(new Container)
        container.position.set(1400, 550)


        // SYMBOL....
        const view = new SymbolClubView(resources)
        container.addChild(view)
        view.scale.set(1)
        view.presentationSpinProgress = 0.025
        // ...SYMBOL

        // GLOW...
        const glowView = container.addChild(getRectangleSpot({
            width: 70,
            height: 15,
            color: 0x116600
        }))
        glowView.scale.set(1, 1.25)
        glowView.y = 150
        this.buttonsGlowViews.push(glowView)
        // ...GLOW

        // CAPTION...
        const textView = container
            .addChild(new TextField({
                maximalWidth: 200,
                maximalHeight: 50
            }))
            .setFontName('egypt')
            .setText(dictionary.green_bmp)
            .setFontColor(0xFFFF00)
            .setFontSize(90)
            .setAlignCenter()
            .setAlignMiddle()

        textView.y = 150
        textView.pivot.set(100, 25)
        this.buttonsCaptionsViews.push(textView)
        // ...CAPTION

        this.buttonClubView = view
        this.buttonsViews.push(container)
    }

    initCollectButton(dictionary) {
        const { bodyView } = this

        const container = bodyView.addChild(new Container)

        // GLOW...
        const glowView = container.addChild(getRectangleSpot({
            width: 70,
            height: 15,
            color: 0x116600
        }))
        glowView.scale.set(1.75, 1.25)
        this.buttonsGlowViews.push(glowView)
        // ...GLOW

        const maximalWidth = 300
        const maximalHeight = 90
        const textField = container
            .addChild(new TextField({maximalWidth, maximalHeight}))
            .setFontName('egypt')
            .setText(dictionary.green_bmp)
            .setFontColor(0xFFFF00)
            .setFontSize(90)
            .setAlignCenter()
            .setAlignMiddle()
            .setText(dictionary.collect_bmp)
        this.buttonsCaptionsViews.push(textField)

        textField.pivot.set(maximalWidth / 2, maximalHeight / 2)
        container.position.set(800, 1075)
        this.buttonsViews.push(container)
    }

    initTexts(resources, dictionary) {
        const { bodyView, instructionsViews } = this

        this.headerView = bodyView.addChild(
			new TextField({
				maximalWidth: 1600,
				maximalHeight: 125
			}))
			.setFontName('egypt')
			.setText(dictionary.taking_risk_bmp)
			.setFontColor(0xFF5500)
			.setFontSize(90)
			.setAlignCenter()
			.setAlignMiddle()
	
        this.headerView.pivot.set(800, 62)
        this.headerView.position.set(800, 87)

		instructionsViews[0] = bodyView
            .addChild(new TextField({
				maximalWidth: 1600,
				maximalHeight: 90
			}))
			.setFontName('egypt')
			.setText(dictionary.choose_bmp)
			.setFontColor(0xFF00AA)
			.setFontSize(50)
			.setAlignCenter()
			.setAlignBottom()
		instructionsViews[0].position.set(800, 820)
        instructionsViews[0].pivot.set(800, 45)

        instructionsViews[1] = bodyView
            .addChild(new TextField({
				maximalWidth: 1600,
				maximalHeight: 90
			}))
			.setFontName('egypt')
			.setText(dictionary.or_bmp)
			.setFontColor(0xFF00AA)
			.setFontSize(90)
			.setAlignCenter()
			.setAlignBottom()
        instructionsViews[1].position.set(800, 890)
        instructionsViews[1].pivot.set(800, 45)
        
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
			.setAlignTop()
            .setText('12,334.00')
        this.payoutTextField.pivot.set(800, 62)
        this.payoutTextField.x = 800
        this.payoutTextField.y = 212
        // ...PAYOUT
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
                    const floatingProgress = Math.sin(Math.PI * ((progress * 7) % 1))
                    this.idleFactor
					&& bookView.presentScrolling({progress: this.idleFactor * floatingProgress * 0.1 * (1 - progress)})
                    
                    const symbolsIdleProgress =  (progress * 3) % 1

                    this.buttonHeartView.update(symbolsIdleProgress)
                    this.buttonClubView.update(symbolsIdleProgress)

                    const glowProgress = Math.sin(Math.PI * ((progress * 6) % 1))
                    this.buttonsGlowViews.forEach((view, i) => {
                        view.alpha = 0.75 + 0.25 * glowProgress
                    })

				}
			})
            .addAnimation({
				delay: 2000,
				duration: 1000,
				onProgress: progress => {
                    const { idleFactor } = this
                    const floatingProgress = idleFactor * Math.sin(Math.PI * ((progress * 5) % 1)) * Math.sin(Math.PI * progress)

                    this.buttonHeartView.y = floatingProgress * -100

                    this.handView.alpha = Math.min(1, Math.sin(Math.PI * progress) * 2) * idleFactor
                    this.handView.position.set(
                        this.buttonsViews[0].x,
                        this.buttonsViews[0].y + 200 - 50 * (floatingProgress ** 2)
                    )
				}
			})
            .addAnimation({
				delay: 3500,
				duration: 1000,
				onProgress: progress => {
                    const { idleFactor } = this
                    const floatingProgress = idleFactor * Math.sin(Math.PI * ((progress * 5) % 1)) * Math.sin(Math.PI * progress)
                    
                    this.buttonClubView.y = floatingProgress * -100

                    this.handView.alpha = Math.min(1, Math.sin(Math.PI * progress) * 2) * idleFactor
                    this.handView.position.set(
                        this.buttonsViews[1].x,
                        this.buttonsViews[1].y + 200 - 50 * (floatingProgress ** 2)
                    )
				}
			})
            .addAnimation({
				delay: 5000,
				duration: 1000,
				onProgress: progress => {
                    const { idleFactor } = this
                    const floatingProgress = Math.sin(Math.PI * ((progress * 5) % 1)) * Math.sin(Math.PI * progress)
                    this.buttonsViews[2].pivot.y = 30 * floatingProgress * idleFactor
				}
			})
			.setLoopMode()
    }

    presentUI({ progress = 0, option = 0 }) {
        const selectedSymbolView = option
            ? this.buttonClubView
            : this.buttonHeartView

        const unselectedSymbolView = option
            ? this.buttonHeartView
            : this.buttonClubView
    
		const subProgress = progress ** 2
        
        this.instructionsViews.forEach(view => {
            view.alpha = 1 - 0.75 * subProgress
            view.scale.set(1 - 0.25 * subProgress)
        })

        if(option !== 2) {
            this.buttonsCaptionsViews.forEach((view, i) => {
                if (i !== option) {
                    view.alpha = 1 - 0.75 * subProgress
                    view.scale.set(1 - 0.25 * subProgress)
                }
            })

            this.headerView.scale.set(1 + subProgress * 0.2)
            this.payoutTextField.scale.set(1 - subProgress * 0.2)
            this.idleFactor = 1 - Math.min(1, subProgress * 5)

            selectedSymbolView.presentationFlipProgress = 0.15 * subProgress
            unselectedSymbolView.flameIntensity = 1 - subProgress
            unselectedSymbolView.presentationFlipProgress = 0.25 * subProgress
            unselectedSymbolView.brightness = 1 - 0.75 * subProgress
    
            selectedSymbolView.scale.set(1 + 0.1 * subProgress)
            // this.buttonsCaptionsViews[option].scale.x = 1 + 0.5 * Math.sin(progress * Math.PI * 3) * (1 - progress)
        }
	}

	async getUserChoice(payout = 0) {
        const {payoutTextField, bookView, isVisible} = this
        this.presentUI({option: 0})
        this.presentUI({option: 1})

        this.payout = payout

        if(!isVisible) this.idleTimeline.wind(0)
        this.idleTimeline.play()
        
        isVisible
        || this
            .presentationTimeline
			.deleteAllAnimations()
			.addAnimation({
				duration: 500,
				onProgress: (progress) => {
					payoutTextField.setText(formatMoney(payout * progress))

					const scaleProgress = Math.abs(Math.sin(Math.PI * ((progress * 2) % 1)))
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

        
        const optionCode = await new Promise(resolve => {
            this.buttonsViews.forEach((view, i) => {
                
                view.eventMode = 'static'
                view.cursor = 'pointer'
                view.on('pointerdown', () => {
                    resolve(i)
                })
            })
        })

        this.buttonsViews.forEach(view => {
            view.removeAllListeners()
            view.eventMode = 'none'
            view.cursor = 'default'
        })

        const options = [
            'red',
            'green',
            'collect',
        ]

        optionCode !== 2
        && await this.presentationTimeline
            .deleteAllAnimations()
            .addAnimation({
                duration: 300,
                onProgress: progress => this.presentUI({option: optionCode, progress})
            })
            .play()

        return options[optionCode]
        
        /*
		await new Promise(resolve => {
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

        return new Promise(resolve => {})
        */
	}

    async presentWin({
        payout,
        option
    }) {
        const payoutDelta = payout - this.payout
        const {
            bookView,
            presentationTimeline
        } = this

        await presentationTimeline
            .deleteAllAnimations()
            .addAnimation({
                duration: 500,
                onProgress: progress => {
                    bookView.presentScrolling({
                        progress,
                        nextSymbolId: option,
                    })
                }
            })
            .addAnimation({
                delay: presentationTimeline.duration,
                duration: 750,
                onProgress: progress => {
                    bookView.presentWin(progress)
                    this.payoutTextField.scale.set(0.8 + 0.2 * progress)
                }
            })
            .addAnimation({
                delay: presentationTimeline.duration,
                duration: 300,
                onProgress: progress => {
                    this.payoutTextField
                        .setText(formatMoney(this.payout + payoutDelta * progress))
                }
            })
            .addAnimation({
                delay: presentationTimeline.duration,
                duration: 200,
                onProgress: progress => this.presentUI({progress: 1 - progress, option})
            })
            .play()
    
        this.payout = payout
    }

    async presentLoose(option) {
        const payoutDelta = this.payout
        const {
            bookView,
            presentationTimeline
        } = this

        await presentationTimeline
            .deleteAllAnimations()
            .addAnimation({
                duration: 500,
                onProgress: progress => {
                    bookView.presentScrolling({
                        progress,
                        nextSymbolId: option,
                    })
                }
            })
            .addAnimation({
                delay: presentationTimeline.duration,
                duration: 750,
                onProgress: progress => {
                    bookView.presentLoose(progress)
                    this.payoutTextField.scale.set(0.8 + 0.2 * progress)
                }
            })
            .addAnimation({
                delay: presentationTimeline.duration,
                duration: 300,
                onProgress: progress => {
                    this.payoutTextField
                        .setText(formatMoney(this.payout - payoutDelta * progress))
                }
            })
            .addAnimation({
                delay: presentationTimeline.duration,
                duration: 200,
            })
            .play()
    
        this.payout = 0

        await this.setVisible(false)
        presentationTimeline.wind(0).pause()
        this.idleTimeline.pause()
        this.presentUI({})
    }

    adjustElements(mode = 'wide') {
        switch(mode) {
            case 'wide':
                this.buttonsViews[0].position.set(200, 550)
                this.buttonsViews[1].position.set(1400, 550)
                break
            case 'narrow':
                this.buttonsViews[0].position.set(400, 825)
                this.buttonsViews[1].position.set(1200, 825)
                break
        }
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

            this.adjustElements('wide') 
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
            this.adjustElements('narrow') 
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

            this.adjustElements('narrow') 
			// ...PORTRAIT
		}
	}
}