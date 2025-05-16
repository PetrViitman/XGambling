import { Application, Graphics, Sprite } from "pixi.js";
import { AdaptiveContainer } from "../adaptiveDesign/AdaptiveContainer";
import { createAtlas,extractHighResolutionSymbols } from "./GUIGraphics";
import { ButtonSpinView } from "./buttons/ButtonSpinView";
import { ButtonSkipView } from "./buttons/ButtonSkipView";
import { ButtonBetView } from "./buttons/ButtonBetView";
import { ButtonBetMoreView } from "./buttons/ButtonBetMoreView";
import { ButtonBetLessView } from "./buttons/ButtonBetLessView";
import { ButtonInfoView } from "./buttons/ButtonInfoView";
import { ButtonTurboView } from "./buttons/ButtonTurboView";
import { ButtonAutoplayView } from "./buttons/ButtonAutoplayView";
import { BottomGradientView } from "./BottomGradientView";
import { IndicatorBalanceView } from "./indicators/IndicatorBalanceView";
import { IndicatorBetView } from "./indicators/IndicatorBetView";
import { IndicatorWinView } from "./indicators/IndicatorWinView";

import { ButtonFullScreenView } from "./buttons/ButtonFullScreenView";
import { Timeline } from "../../timeline/Timeline";
import { OverlayView } from "./OverlayView";
import { BetSelectorView } from "./selectors/bet/BetSelectorView";
import { AutoplaySelectorView } from "./selectors/AutoplaySelectorView";
import { AccountSelectorView } from "./selectors/accounts/AccountSelectorView";
import { ButtonBuyFeatureView } from "./buttons/ButtonBuyFeatureView";
import { BuyFeatureSelectorView } from "./selectors/buyFeature/BuyFeatureSelectorView";
import { PaytableView } from "./scrollable/paytable/PaytableView";
import { BonusPanelView } from "./bonuses/BonusPanelView";
import { BonusSelectorView } from "./scrollable/bonusSelector/BonusSelectorView";
import { ButtonBonusView } from "./buttons/ButtonBonusView";
import { ButtonHomeView } from "./buttons/ButtonHomeView";
import { ButtonAudioView } from "./buttons/ButtonAudioView";


export class GUIView extends AdaptiveContainer {
    bottomGradientView
    buttonSpinView
    buttonSkipView
    buttonBetView
    buttonBetMoreView
    buttonBetLessView
    buttonInfoView
    buttonAutoplayView
    buttonTurboView
    buttonFullScreenView
    buttonBuyFeatureView
    buttonBonusView
    buttonAudioView
    buttonHomeView

    indicatorBalanceView
    indicatorBetView
    indicatorWinView

  
    betSelectorView
    autoplaySelectorView
    buyFeatureSelectorView
    popupsViews = []
    activePopupName
    activePopupView

    bonusPanelView

    paytableView
    bonusSelectorView
    windowsViews = []
    activeWindowName
    activeWindowView

    leftCornerGroupView
    audioGroupView
    bottomGroupView
    leftSideGroupView
    rightSideGroupView

    FPS = 0
    resolve = undefined
    isHidden = false
    isSpinExpected = false
    isSkipExpected = false
    activePopupName = ''
    currencyCode = ''
    betsOptions = []
    formattedBetsOptions = []
    autoplayOptions = []
    payout = 0
    balance = 0
    bet = 0
    betIndex = 0
    isTurboMode = false
    remainingAutoSpinsCount = 0
    dictionary = {}
    accounts = []
    fullScreeRequestTimeline = new Timeline
    timeline = new Timeline
    audio

    isFreeSpinsMode

    constructor(wrapperHTMLElementId) {
        super()
        
        this.wrapperHTMLElement = document.getElementById(wrapperHTMLElementId)
        document.body.addEventListener('fullscreenchange', () => {
            if(! this.buttonFullScreenView) return
            this.buttonFullScreenView.setFullscreenMode(document.fullscreenElement)
        })

        /*
        document.addEventListener('keyup', ({key}) => {
            if(key === '1') {
                this.presentPopup('bet')
            } else if(key === '2') {
                this.presentPopup('autoplay')
            } else if (key === '3') {
                this.presentPopup()
            }
        })
        */
    }
    
    async init({
        gameAssets,
        dictionary,
        currencyCode = 'FUN',
        vfxLevel,
        buyFeatureBetMultiplier,
        coefficients,
        isLTRTextDirection = true,
        isMobileApplicationClient = false,
        locale,
        audio
    }) {
        const assets = await createAtlas(gameAssets, vfxLevel)
        for (const [key, value] of Object.entries(gameAssets)) {
            assets[key] = value
        }

        //extractHighResolutionSymbols(gameAssets)

        this.audio = audio
        this.initBonusPanel(assets, dictionary)
        this.initOverlay(assets)
        this.initGradient(assets)
        this.initButtons(assets, isMobileApplicationClient)
        this.initIndicators({assets, dictionary, isLTRTextDirection})
        this.initBetSelector({assets, dictionary, currencyCode, isLTRTextDirection})
        this.initBuyFeatureSelector({assets, dictionary, currencyCode, buyFeatureBetMultiplier, isLTRTextDirection})
        this.initAutoplaySelector({assets, dictionary})
        this.initAccountSelector({assets, dictionary})
        this.initPaytable({assets, dictionary, coefficients, isLTRTextDirection})
        this.initBonusSelector({assets, dictionary, isLTRTextDirection, locale})

        audio.onAudioReady = () => this.buttonAudioView.onAudioReady()

        /*
        const reelSelectorView = new ReelSelectorView()
        this.addChild(reelSelectorView)
        reelSelectorView.position.set(200)

        const inputView = new InputView(assets)
        this.addChild(inputView)
        inputView.position.set(200, 400)
        */

        // const s

       // this.popupView = this.addChild(new PopupView(gameAssets))


       // const selectorView = new SelectorView({assets, options: this.autoplayOptions, selectedOptionIndex: 0})
        //this.autoplaySelectorView = selectorView

        // this.addChild(selectorView).position.set(300)

        this.setFreeSpinsMode(false)
    }

    initBonusPanel(assets, dictionary) {
        const view = new BonusPanelView({assets, dictionary, audio: this.audio})

        view.onButtonCloseClick = () => {
            this.resolve?.({
                key: 'trigger_bonus',
            })
        }
        this.bonusPanelView = this.addChild(view)
    }

    initOverlay(assets) {
        this.overlayView = this.addChild(new OverlayView(assets))
        this.overlayView.alpha = 0
        this.overlayView.visible = false
        this.overlayView.onClick = () => {
            if (this.activePopupView?.canBeDismissed()) {
                this.presentPopup()
            }

            this.activePopupView?.onOverlayClick()
        }
    }

    initBetSelector({assets, dictionary, currencyCode, isLTRTextDirection}) {
        this.betSelectorView = this.addChild(new BetSelectorView({assets, dictionary, currencyCode, isLTRTextDirection, audio: this.audio}))
       
    
        this.betSelectorView.onOptionSelected = (bet) => {
            this.resolve?.({
                key: 'change_bet',
                value: bet
            })
        }
        this.popupsViews.push(this.betSelectorView)
    }

    initBuyFeatureSelector({
        assets,
        dictionary,
        currencyCode,
        buyFeatureBetMultiplier,
        isLTRTextDirection,
    }) {
        this.buyFeatureSelectorView = this.addChild(
            new BuyFeatureSelectorView({
                assets,
                dictionary,
                currencyCode,
                buyFeatureBetMultiplier,
                isLTRTextDirection,
                audio: this.audio
            })
        )

        this.buyFeatureSelectorView.onOverlayClick = () => {
            this.presentPopup()
        }

        this.buyFeatureSelectorView.onPurchaseRequest = () => {
            this.resolve?.({
                key: 'buy_feature',
                value: this.bet
            })
        }

        
        this.popupsViews.push(this.buyFeatureSelectorView)
    }

    initAutoplaySelector({assets, dictionary}) {
        this.autoplaySelectorView = this.addChild(
            new AutoplaySelectorView({assets, dictionary})
        )

        /*
        this.autoplaySelectorView.onOptionSelected = (selectedOptionIndex) => {
            // this.onAutoplaySpinsCountChange?.(this.autoplayOptions[selectedOptionIndex])
            // this.remainingAutoSpinsCount = this.autoplayOptions[selectedOptionIndex]
        }
        */

        this.popupsViews.push(this.autoplaySelectorView)
    }

    initAccountSelector({assets, dictionary}) {
        this.accountSelectorView = this.addChild(
            new AccountSelectorView({assets, dictionary, audio: this.audio})
        )

        this.accountSelectorView.onAccountSwitchRequest = (account) => {
            this.presentPopup()
            this.resolve?.({
                key: 'change_account',
                value:  account
            })
        }

        this.popupsViews.push(this.accountSelectorView)
    }

    initPaytable({assets, dictionary, coefficients, isLTRTextDirection}) {
        const view = new PaytableView({assets, dictionary, coefficients, isLTRTextDirection, audio: this.audio})
        view.visible = false
        view.alpha = 0
        view.onButtonCloseClick = () => {
            this.presentWindow()
        }
        view.onOverlayClick = () => {
            this.presentWindow()
        }
        this.paytableView = this.addChild(view)

        this.windowsViews.push(view)
    }

    initBonusSelector({assets, dictionary, isLTRTextDirection, locale}){
        const view = new BonusSelectorView({assets, dictionary, isLTRTextDirection, locale, audio: this.audio})
        view.visible = false
        view.alpha = 0
        view.onButtonCloseClick = () => {
            this.presentWindow()
        }
        view.onOverlayClick = () => {
            this.presentWindow()
        }

        view.onBonusActivationRequest = (bonusDescriptor) => {
            this.presentWindow()
            this.resolve?.({
                key: 'trigger_bonus',
                value:  bonusDescriptor
            })

        }

        this.bonusSelectorView = this.addChild(view)

        this.windowsViews.push(view)
    }

    presentWindow(name)  {
        const windowsMap = {
            'bonuses': this.bonusSelectorView,
            'paytable': this.paytableView,
        }

        const oldWindowView = windowsMap[this.activeWindowName]
        const newWindowView = windowsMap[name]


        this.activeWindowName = name
        this.activeWindowView = newWindowView


        if(newWindowView) {
            this.activePopupName = undefined
        }

        this.refresh()
        
        const {activePopupView, overlayView} = this

        this.windowsViews.forEach(view => { view.visible = false })
        this.timeline
            .wind(1)
            .deleteAllAnimations()
            .addAnimation({
                duration: 250,
                onStart: () => {
                    if (!newWindowView) {
                        this.onWindowVisibleStateChanged?.(false)
                    }
                },
                onProgress: progress => {
                    const regress = 1 - progress

                    if(oldWindowView) {
                        oldWindowView.alpha = Math.min(oldWindowView.alpha, regress)
                        oldWindowView.visible = oldWindowView.alpha > 0
                    }

                    if(newWindowView) {
                        newWindowView.alpha = Math.max(newWindowView.alpha, progress)
                        newWindowView.visible = newWindowView.alpha > 0
                    }

                    if(activePopupView) {
                        activePopupView.alpha = Math.min(activePopupView.alpha, regress)
                        activePopupView.visible = activePopupView.alpha > 0

                        overlayView.alpha = Math.min(overlayView.alpha, regress)
                        overlayView.visible = overlayView.alpha > 0
                    }
                },
                onFinish: () => {
                    this.refresh()
                    this.activePopupView = undefined

                    if (newWindowView) {
                        this.onWindowVisibleStateChanged?.(true)
                    }
                }
            })
            .windToTime(1)
            .play()
    }

    initGradient(assets) {
        this.bottomGradientView = this.addChild(new BottomGradientView(assets))
    }

    initButtons(assets, isMobileApplicationClient) {
        const {audio} = this
        const leftCornerGroupView = this.addChild(new AdaptiveContainer)
            .stickTop()
            .stickLeft()
            .setTargetArea({x: 0, y: 0, width: 1, height: 1})
            .setSourceArea({width: 600, height: 600})

        this.leftCornerGroupView = leftCornerGroupView

        const audioGroupView = this.addChild(new AdaptiveContainer)
            .stickRight()

        this.audioGroupView = audioGroupView

        const rightSideGroupView = this.addChild(new AdaptiveContainer)
            .setSourceArea({width: 850, height: 500})
            .setTargetArea({x: 0, y: 0.1, width: 1, height: 0.8})
            .stickRight()
            

        this.rightSideGroupView = rightSideGroupView

        this.addChild(this.overlayView)

        const bottomGroupView = this.addChild(new AdaptiveContainer)
        this.backgroundPanelView = bottomGroupView
            .addChild(new Graphics)
            .beginFill(0x262D2A, 0.7)
            .drawRect(0, 108 + 1865, 1290, 273)
            .endFill()

        this.bottomGroupView = bottomGroupView

        const leftSideGroupView = this.addChild(new AdaptiveContainer)
            .setSourceArea({width: 1000, height: 500})
            .setTargetArea({x: 0, y: 0.25 * 0.9, width: 1, height: 0.5 * 0.9})
            .stickLeft()

        this.leftSideGroupView = leftSideGroupView

        const buttonsViews = [
            new ButtonSpinView(assets, audio),
            new ButtonSkipView(assets, audio),
            new ButtonBetMoreView(assets, audio),
            new ButtonBetLessView(assets, audio),
            new ButtonTurboView(assets, audio),
            new ButtonAutoplayView(assets, audio),
            new ButtonInfoView(assets, audio),
            new ButtonBuyFeatureView(assets, audio),
            new ButtonBonusView(assets, audio),
            new ButtonAudioView(assets, audio),
            isMobileApplicationClient
                ? new ButtonHomeView(assets, audio)
                : new ButtonFullScreenView(assets, audio)
        ]

        buttonsViews.forEach(view => { bottomGroupView.addChild(view) })

        this.buttonSpinView = buttonsViews[0]
        this.buttonSkipView = buttonsViews[1]
        this.buttonBetMoreView = buttonsViews[2]
        this.buttonBetLessView = buttonsViews[3]
        this.buttonTurboView = buttonsViews[4]
        this.buttonAutoplayView = buttonsViews[5]
        this.buttonInfoView = buttonsViews[6]
        this.buttonBuyFeatureView = buttonsViews[7]
        this.buttonBonusView = buttonsViews[8]
        this.buttonAudioView = buttonsViews[9]

        this.buttonBonusView.scale.set(0.5)
        this.buttonBuyFeatureView.scale.set(0.5)
        this.buttonInfoView.scale.set(0.5)
        this.buttonAudioView.scale.set(0.5)

        if (isMobileApplicationClient) {
            this.buttonHomeView = buttonsViews[10]
            this.buttonHomeView.y = 50
            this.buttonHomeView.scale.set(0.5)
            this.buttonHomeView.onClick = () => {
                this.resolve?.({ key: 'home' })
            }

            this.leftCornerGroupView.addChild(this.buttonHomeView)
        } else {
            this.buttonFullScreenView = buttonsViews[10]
            this.buttonFullScreenView.scale.set(0.5)
            this.buttonFullScreenView.onClick = () => {
                if(document.fullscreenElement) {
                    document.exitFullscreen?.()
                } else {
                    this.requestFullScreen() 
                }
            }
        }

        this.buttonsViews = buttonsViews
        this.audioGroupView.addChild(this.buttonAudioView)

        this.leftSideGroupView.addChild(
            this.buttonInfoView,
            this.buttonBonusView
        )

        this.buttonFullScreenView && this.leftSideGroupView.addChild(this.buttonFullScreenView)
       
        this.buttonAutoplayView.onClick = () => {
            if(!this.remainingAutoSpinsCount) {
                this.presentPopup('autoplay')
            } else {
                this.onAutoplaySpinsCountChange?.(0)
            }
        }

        this.buttonInfoView.onClick = () => {
            this.presentWindow('paytable')
        }

        this.buttonAudioView.onClick = () => {
            this.buttonAudioView.setMuted(!this.buttonAudioView.isMuted)

            this.audio.setMuted(this.buttonAudioView.isMuted)
            // this.onAutoplaySpinsCountChange?.(this.autoplayOptions[this.autoplaySelectorView.getSelectedOptionIndex()])
        }

        this.buttonSpinView.onClick = () => {
            if(this.activePopupName === 'autoplay') {
                this.onAutoplaySpinsCountChange?.(this.autoplayOptions[this.autoplaySelectorView.getSelectedOptionIndex()])
            }

            this.resolve?.({ key: 'make_bet' })
            this.buttonSkipView.presentClick()
            this.requestFullScreen()
        }
        this.buttonSkipView.onClick = () => {
            this.onSkipRequested?.()
			this.isSkipExpected = false
            this.buttonSpinView.presentClick()
        }

        this.buttonBetMoreView.onClick = () => {
            const { betsOptions } = this
            this.betIndex = Math.min(betsOptions.length - 1, this.betIndex + 1)
            this.resolve?.({
                key: 'change_bet',
                value:  betsOptions[this.betIndex]
            })

            this.betSelectorView.forceSelect({optionIndex: this.betIndex, dropUserInput: true})
        }
        this.buttonBetLessView.onClick = () => {
            const { betsOptions } = this
            this.betIndex = Math.max(0, this.betIndex - 1)
            this.resolve?.({
                key: 'change_bet',
                value: betsOptions[this.betIndex]
            })

            this.betSelectorView.forceSelect({optionIndex: this.betIndex, dropUserInput: true})
        }

        this.buttonTurboView.onClick = () => {
            this.isTurboMode = !this.isTurboMode
            this.onTurboToggle?.(this.isTurboMode)
            this.buttonTurboView.setActive(this.isTurboMode)
        }


        this.buttonBuyFeatureView.onClick = () => {
            if(!this.maximalBet) {
                this.resolve?.({ key: 'request_sign_in' })
                return
            }
            this.presentPopup('buy')
        }

        this.buttonBonusView.onClick = () => {
            this.resolve?.({ key: 'request_bonuses' })
            this.presentPopup()
        }


        this.buttonsViews.forEach(view => {
            view.visible = false
            view.alpha = 0
        })

        this.buttonSpinView.alpha = 1
        this.buttonBuyFeatureView.alpha = 1
        this.buttonBuyFeatureView.visible = true

    }

    

    initIndicators({assets, dictionary, isLTRTextDirection}) {
        const {bottomGroupView} = this

        this.indicatorBalanceView = bottomGroupView.addChild(new IndicatorBalanceView({assets, isLTRTextDirection}))
        this.indicatorBetView = bottomGroupView.addChild(new IndicatorBetView({assets, dictionary, isLTRTextDirection}))
        this.indicatorWinView = bottomGroupView.addChild(new IndicatorWinView({assets, isLTRTextDirection}))
  
        this.indicatorBalanceView.visible = false
        this.indicatorBetView.visible = false
        this.indicatorWinView.visible = false
      
        this.indicatorBetView.onClick = () => {
            if(!this.maximalBet) {
                this.resolve?.({ key: 'make_bet' })
                return
            }
            this.presentPopup('bet')
        }

        this.indicatorBalanceView.onClick = () => {
            if(!this.maximalBet) {
                this.resolve?.({ key: 'make_bet' })
                return
            }
            this.presentPopup('account')
        }
    }

    updateTargetArea(sidesRatio) {
        const {
            indicatorBalanceView,
            indicatorBetView,
            indicatorWinView,
          
         
            buttonSpinView,
            buttonSkipView,
            buttonBetLessView,
            buttonBetMoreView,
            buttonTurboView,
            buttonAutoplayView,
            buttonInfoView,
            buttonFullScreenView,
            buttonHomeView,
            buttonBuyFeatureView,
            buttonBonusView,
            buttonAudioView,
            bottomGroupView,
            leftSideGroupView,
            rightSideGroupView,
            leftCornerGroupView,
            audioGroupView,

            offsetTop = 0,
            offsetBottom = 0
        } = this

        if(!bottomGroupView) return

        leftSideGroupView.setTargetArea({x: 0, y: offsetTop + 0.25 * 0.9, width: 1, height: 0.5 * 0.9 - offsetBottom})
        leftCornerGroupView.setTargetArea({x: 0, y: offsetTop, width: 1, height: 1  - offsetBottom})
        /*
        if (sidesRatio > 0.5) {
            console.log({
                offsetTop,
                offsetBottom
            })

            bottomGroupView.pivot.y = 0
            bottomGroupView
                .setSourceArea({width: 1000, height: 480})
                .setTargetArea({
                    x: 0,
                    y: offsetTop + 0.7,
                    width: 1,
                    height: 0.30 - offsetBottom
                })
                .stickBottom()
        } else {
            bottomGroupView.pivot.y = -800
            bottomGroupView
                .setSourceArea({width: 1000, height: 480})
                .setTargetArea({
                    x: 0,
                    y: offsetTop,
                    width: 1,
                    height: 0.9 - offsetBottom
                })
                .stickMiddle()
        } */


        
            buttonAudioView.position.set(950, 150)
            buttonAudioView.scale.set(0.5)

            audioGroupView
                .setSourceArea({width: 1000, height: 500})
                .setTargetArea({x: 0, y: offsetTop + 0.25 * 0.9, width: 1, height: 0.5 * 0.9 - offsetBottom})

            bottomGroupView.addChild(
                buttonSpinView,
                buttonSkipView,
                buttonTurboView,
                buttonAutoplayView
            )

            rightSideGroupView.addChild(buttonBuyFeatureView)
            rightSideGroupView.setTargetArea({x: 0, y: 0, width: 1, height: 1})
            .stickCenter()
            .setSourceArea({
                width: 1290, 
                height: 2796  
            })

            const offsetY = 1460

            buttonFullScreenView?.position.set(55, 55)
            buttonBonusView.position.set(55, 220)
            buttonInfoView.position.set(55, 405)
            buttonBuyFeatureView.position.set(1125, 1600)
            buttonBuyFeatureView.scale.set(1)

            buttonSpinView.position.set(645, 225 + 1865)
            buttonSpinView.scale.set(1)

            buttonSkipView.position.set(625, 200)
            buttonSkipView.scale.set(1)
            

            buttonTurboView.position.set(500 - 400, 330 + offsetY)
            buttonTurboView.scale.set(0.75)

            buttonBetLessView.position.set(500 - 220, 335 + offsetY)
            buttonBetLessView.scale.set(0.85)
            buttonBetMoreView.position.set(500 + 220, 335 + offsetY)
            buttonBetMoreView.scale.set(0.85)

            buttonAutoplayView.position.set(500 + 400, 330 + offsetY)
            buttonAutoplayView.scale.set(0.75)

            buttonAudioView.position.set(945, 45)


            const indicatorsY = 200  + offsetY
            indicatorBalanceView.position.set(500 - 315, indicatorsY)
            indicatorBalanceView.scale.set(0.75)

            indicatorBetView.position.set(500, indicatorsY)
            indicatorBetView.scale.set(0.75)

            indicatorWinView.position.set(500 + 315, indicatorsY)
            indicatorWinView.scale.set(0.75)



            bottomGroupView
                .setSourceArea({width: 1290, height: 2796})
                .setTargetArea({x: 0, y: offsetTop, width: 1, height: 1  - offsetBottom  - offsetTop})
                .stickMiddle()

    }


    refresh(parametersMap = {}) {
        for (const [key, value] of Object.entries(parametersMap))
			this[key] = value

        const isBetExpected = !!this.maximalBet

        // DETECTING CLOSEST BET INDEX...
        let closestBetIndex = 0
        let shortestDelta = Infinity
        this.betsOptions.forEach((betOption, i) => {
            const betDelta = Math.abs(betOption - this.bet)
            if (betDelta < shortestDelta) {
                shortestDelta = betDelta
                closestBetIndex = i
            }
        })
        this.betIndex = closestBetIndex
        // ...DETECTING CLOSEST BET INDEX

        this.indicatorWinView.setValue(this.payout, this.currencyCode)
        this.indicatorBalanceView.setValue(this.balance, this.currencyCode)
        this.indicatorBetView.setValue(this.bet, this.currencyCode)

        this.accountSelectorView.setSelectableOptions(this.accounts)
        this.accountSelectorView.forceSelect()

        this.autoplaySelectorView.setSelectableOptions(this.autoplayOptions)

        this.betSelectorView.setSelectableOptions(this.betsOptions)
        this.betSelectorView.forceSelect({optionIndex: this.betIndex})
        this.betSelectorView.setBetLimits(this.minimalBet, this.maximalBet)

        this.bonusPanelView.presentBonus(this.activeBonusDescriptor)
        this.bonusPanelView.setInteractive(this.activeBonusDescriptor && this.isSpinExpected)

        this.buyFeatureSelectorView.refresh({bet: this.bet, currencyCode: this.currencyCode})
        this.paytableView.refresh({bet: this.bet, currencyCode: this.currencyCode})

        const isFreeBet = this.activeBonusDescriptor?.type === 3

        this.buttonBetMoreView.setInteractive(isBetExpected && !isFreeBet && this.isSpinExpected && this.betIndex < this.betsOptions.length - 1)
        this.buttonBetLessView.setInteractive(isBetExpected && !isFreeBet && this.isSpinExpected && this.betIndex > 0)

        this.buttonSpinView.setInteractive(this.isSpinExpected)
        //this.buttonSpinView.visible = !this.isSkipExpected
        // this.buttonSpinView.visible = true
        //this.buttonSkipView.visible = this.isSkipExpected
        //this.buttonSkipView.setInteractive(this.isSkipExpected)

        this.buttonAutoplayView.presentSpinsCount(this.remainingAutoSpinsCount)
        this.buttonAutoplayView.setInteractive(
            isBetExpected
            && !this.activeBonusDescriptor
            && this.isSpinExpected
            || this.remainingAutoSpinsCount
        )

        this.betSelectorView.setInteractive({
            isMaximalBetButtonInteractive: this.bet < this.maximalBet,
            isMinimalBetButtonInteractive: this.bet > this.minimalBet,
        })

        this.betSelectorView.onMinimalBetRequested = () => {
            this.betIndex = 0
            this.resolve?.({
                key: 'change_bet',
                value:  this.betsOptions[this.betIndex]
            })
            this.betSelectorView.forceSelect({optionIndex: this.betIndex, dropUserInput: true}    
        )}

        this.betSelectorView.onMaximalBetRequested = () => {
            this.betIndex = this.betsOptions.length - 1
            this.resolve?.({
                key: 'change_bet',
                value:  this.betsOptions[this.betIndex]
            })
            this.betSelectorView.forceSelect({optionIndex: this.betIndex, dropUserInput: true}    
        )}


        this.indicatorBetView.setInteractive(
            isBetExpected
            && this.isSpinExpected
            && this.activePopupName !== 'bet'
        )
        this.indicatorBetView.presentBonus(this.activeBonusDescriptor)
        this.indicatorBalanceView.setInteractive(
            isBetExpected
            && this.accounts.find(account => account.isActive)?.id > -1
            && this.isSpinExpected
            && this.activePopupName !== 'account'
        )

        this.buttonBuyFeatureView.setInteractive(
            !this.activeBonusDescriptor
            && this.isSpinExpected
            && this.activePopupName !== 'buy'
        )
        this.buttonBonusView.setInteractive(
            isBetExpected
            && this.isSpinExpected
            && this.accounts.find(account => account.isActive)?.id > -1
            && this.accounts.find(account => account.isActive)?.isPrimary
            && !this.activeBonusDescriptor
        )


        switch(this.activePopupName) {
            case 'autoplay':
                this.buttonAutoplayView.setInteractive(false)
                break
        }
        
    }

    presentError() {
        this.presentPopup()
        this.presentWindow()
    }

    setRemainingAutoSpinsCount(remainingAutoSpinsCount) {
        context.remainingAutoSpinsCount = remainingAutoSpinsCount
        context.onAutoplaySpinsCountChange?.(remainingAutoSpinsCount)
        this.buttonAutoplayView.presentSpinsCount(remainingAutoSpinsCount)
    }

    getUserInput() {
        this.buttonSpinView.presentIdle()

        return new Promise(resolve => {
            this.resolve = resolve
        })
    }





    requestFullScreen() {
        return
        this.fullScreeRequestTimeline
            .deleteAllAnimations()
            .addAnimation({
                duration: 100,
                onFinish: () => {
                    const wrapperHTMLElement = document.body
                    const options = {navigationUI: 'hide'}
                    if (wrapperHTMLElement.requestFullscreen) {
                        wrapperHTMLElement.requestFullscreen(options).catch((err) => {})
                    } else if (wrapperHTMLElement.webkitRequestFullscreen) {
                        wrapperHTMLElement.webkitRequestFullscreen(options).catch((err) => {})
                    } else if (wrapperHTMLElement.msRequestFullscreen) {
                        wrapperHTMLElement.msRequestFullscreen(options).catch((err) => {})
                    }
                }
            })
            .play()
    }

    presentPopup(name) {
        const { popupsViews, overlayView } = this
        const popupsMap = {
            'bet': this.betSelectorView,
            'buy': this.buyFeatureSelectorView,
            'autoplay': this.autoplaySelectorView,
            'account': this.accountSelectorView,
            'rules': undefined,
        }

        const oldPopupView = popupsMap[this.activePopupName]
        const newPopupView = popupsMap[name]

        oldPopupView?.reelSelectorView?.setEditable(false)

        this.activePopupName = name
        this.activePopupView = newPopupView
        this.refresh()



        popupsViews.forEach(view => { view.visible = false })
        this.timeline
            .wind(1)
            .deleteAllAnimations()
            .addAnimation({
                duration: 250,
                onProgress: progress => {
                    const regress = 1 - progress

                    if(oldPopupView) {
                        oldPopupView.alpha = Math.min(oldPopupView.alpha, regress)
                        oldPopupView.visible = oldPopupView.alpha > 0
                    }

                    if(newPopupView) {
                        newPopupView.alpha = Math.max(newPopupView.alpha, progress)
                        overlayView.alpha = Math.max(overlayView.alpha, progress)
                        newPopupView.visible = newPopupView.alpha > 0
                    } else {
                        overlayView.alpha = Math.min(overlayView.alpha, regress)
                    }

                    overlayView.visible = overlayView.alpha > 0
                },
                onFinish: () => {
                    this.refresh()
                }
            })
            .windToTime(1)
            .play()
    }

    setAdaptiveDesignOffsets({offsetTop, offsetBottom}) {
        this.offsetTop = offsetTop
        this.offsetBottom = offsetBottom + offsetTop
        this.onResize()

        this.windowsViews.forEach(view => {
            view.setAdaptiveDesignOffsets({offsetTop: 0, offsetBottom})
        })

        this.popupsViews.forEach(view => {
            view.setAdaptiveDesignOffsets({offsetTop: 0, offsetBottom})
        })
    }

    presentBonuses(bonuses) {
        this.bonusSelectorView.refresh(bonuses)
        this.presentWindow('bonuses')
    }

    setFreeSpinsMode(isFreeSpinsMode = true) {
        this.isFreeSpinsMode = isFreeSpinsMode

        if(isFreeSpinsMode) {
            this.buttonBuyFeatureView.visible = false
            this.buttonSpinView.visible = false
            this.backgroundPanelView.visible = false
        } else {
            this.buttonBuyFeatureView.visible = true
            this.buttonSpinView.visible = true
            this.backgroundPanelView.visible = true
        }
    }
}