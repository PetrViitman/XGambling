<script >
	let context
	import { createApp, watch, onMounted } from 'vue'
	import App from './VueUI.vue'
	export function mountVueUI(wrapperHtmlElementId) {
		context = createApp(App)
		context.mount('#' + wrapperHtmlElementId)

		return context
	}

	// BCP...
	import Indicator from './componentsBCP/Indicator.vue'
	import Selector from './componentsBCP/Selector.vue'
	import FPSLabel from './componentsBCP/FPSLabel.vue'
	import UIPanelBackground from './componentsBCP/UIPanelBackground.vue'
	import ButtonSpin from './componentsBCP/buttons/ButtonSpin.vue'
	import ButtonSkip from './componentsBCP/buttons/ButtonSkip.vue'
	import ButtonSettings from './componentsBCP/buttons/ButtonSettings.vue'
	import ButtonTurbo from './componentsBCP/buttons/ButtonTurbo.vue'
	import ButtonBet from './componentsBCP/buttons/ButtonBet.vue'
	import ButtonAuto from './componentsBCP/buttons/ButtonAuto.vue'
	import ButtonStopAuto from './componentsBCP/buttons/ButtonStopAuto.vue'
	import ButtonBuy from './componentsBCP/buttons/ButtonBuy.vue'
	//import Overlay from './componentsBCP/popups/Overlay.vue'
	import ErrorPopup from './componentsBCP/popups/PopupError.vue'
	import PopupSelector from './componentsBCP/popups/PopupSelector.vue'
	import CheatScreen from './componentsBCP/popups/CheatScreen.vue'
	import { ref, nextTick } from 'vue'
	// ...BCP

	import BetOptions from "./components/popups/BetOptions.vue";
	import GameBottom from './components/GameBottom.vue'
	//import Rules from './components/popups/Rules.vue'
	import PayTable from './components/popups/PayTable.vue'
	import AutoGame from './components/popups/AutoGame.vue'
	import ControlBtns from './components/ControlBtns.vue'
	import Balance from "./components/popups/Balance.vue";
	import Overlay from './components/Overlay.vue'

	export default {
		components: {
			// BCP...
			Indicator,
			Selector,
			FPSLabel,
			UIPanelBackground,
			ButtonSpin,
			ButtonSkip,
			ButtonSettings,
			ButtonTurbo,
			ButtonBet,
			ButtonAuto,
			ButtonStopAuto,
			ButtonBuy,
			Overlay,
			ErrorPopup,
			PopupSelector,
			CheatScreen,
			// ...BCP

			Balance,
			BetOptions,
			AutoGame,
			// Rules,
			GameBottom,
			PayTable,
			ControlBtns
		},

		setup() {
			context.FPS = ref(0)
			context.resolve = undefined
			context.isHidden = ref(true)
			context.uiAlpha = ref(0)
			context.isSpinExpected = ref(false)
			context.isSkipExpected = ref(false)
			// context.activePopupName = ref('buy bet autoplay error cheats') //prerendering
			context.activePopupName = ref('')
			context.currencyCode = ref('')
			context.errorText = ref('')
			context.isSimplifiedMode = ref(true)
			context.betsOptions = ref([])
			context.betIndex = ref(0)
			context.autoSpinsValues = ref([])
			context.buyFeatureOptions = ref([])
			context.payout = ref(0)
			context.balance = ref(0)
			context.bet = ref('')
			context.remainingAutoSpinsCount = ref(0)
			context.dictionary = ref({})
			context.isBetExpected = ref(false)
			context.isFreeBet = ref(false)
			context.payout = ref(0)
			context.isFreeSpinsMode = ref(false)
			context.isSplashScreenMode = ref(false)
			context.isTurboMode = ref(true)
			context.getUserInput = () => {
				return new Promise(resolve => context.resolve = resolve)
			}

			context.setFreeSpinsMode = (isFreeSpinsMode = true) => {
				context.isFreeSpinsMode.value = isFreeSpinsMode
			}

			context.setSplashScreenMode = (isSplashScreenMode = true) => {
				context.isSplashScreenMode.value = isSplashScreenMode
			}

			context.refresh = (parametersMap = {}) => {
				for (const [key, value] of Object.entries(parametersMap)) {
					if(!context[key]) context[key] = ref(0)
					context[key].value = value ?? context[key]?.value
				}

				context.isBetExpected.value = !!context.maximalBet.value

				// DETECTING CLOSEST BET INDEX...
				let closestBetIndex = 0
				let shortestDelta = Infinity
				context.betsOptions.value.forEach((betOption, i) => {
					const betDelta = Math.abs(betOption - context.bet.value)
					if (betDelta < shortestDelta) {
						shortestDelta = betDelta
						closestBetIndex = i
					}
				})
				context.betIndex.value = closestBetIndex
				// context.isBetExpected.value = isBetExpected
				// ...DETECTING CLOSEST BET INDEX

				/*
				this.indicatorWinView.setValue(this.payout, this.winCurrencyCode ?? this.currencyCode)
				this.indicatorBalanceView.setValue(this.balance, this.currencyCode)
				this.indicatorBetView.setValue(this.bet, this.currencyCode)

				this.accountSelectorView.setSelectableOptions(this.accounts)
				this.accountSelectorView.forceSelect()

				this.autoplaySelectorView.setSelectableOptions(this.autoplayOptions)

				this.betSelectorView.setSelectableOptions(this.betsOptions)
				this.betSelectorView.currencyCode = this.currencyCode
				this.betSelectorView.forceSelect({optionIndex: this.betIndex})
				this.betSelectorView.setBetLimits(this.minimalBet, this.maximalBet)

				this.bonusPanelView.presentBonus(this.activeBonusDescriptor)
				this.bonusPanelView.setInteractive(this.activeBonusDescriptor && this.isSpinExpected)

				this.buyFeatureSelectorView.refresh({bet: this.bet, currencyCode: this.currencyCode, maximalBet: this.maximalBet})
				this.paytableView.refresh({bet: this.bet, currencyCode: this.currencyCode})

				const isFreeBet = this.activeBonusDescriptor?.type === 3

				this.buttonBetMoreView.setInteractive(isBetExpected && !isFreeBet && this.isSpinExpected && this.betIndex < this.betsOptions.length - 1)
				this.buttonBetLessView.setInteractive(isBetExpected && !isFreeBet && this.isSpinExpected && this.betIndex > 0)

				this.buttonSpinView.setInteractive(this.isSpinExpected)
				this.buttonSpinView.visible = !this.isSkipExpected
				this.buttonSkipView.visible = this.isSkipExpected
				this.buttonSkipView.setInteractive(this.isSkipExpected)

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
					&& this.accounts.find(account => account.isActive)?.id !== -1
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
					// && this.accounts.find(account => account.isActive)?.id !== -1
					// && this.accounts.find(account => account.isActive)?.isPrimary
					&& !this.activeBonusDescriptor
				)


				switch(this.activePopupName) {
					case 'autoplay':
						this.buttonAutoplayView.setInteractive(false)
						break
				}
				*/
			}

			context.getUserInput = () => {
				closeAllPopups()
				return new Promise(resolve => { context.resolve = resolve })
			}

			watch(context.isSimplifiedMode, (newValue) => {
				if(!newValue && context.activePopupName.value === 'bet')
					context.activePopupName.value = ''
			})

			/*
			watch(context.bet, newValue =>
				betSelector.value.setSelectedValue(newValue))
				*/

			function presentPopup(name = '') {
				context.activePopupName.value = name
				nextTick(() => document.dispatchEvent(new Event('refreshTextFields')))
				// document.dispatchEvent(new Event('refreshTextFields'));
			}

			function closeAllPopups() {
				nextTick(() => context.activePopupName.value = '')
			}

			function resolve(data) {
				context.resolve?.(data)
				context.resolve = undefined
				//closeAllPopups()
			}

			function toggleTurbo() {
				context.isTurboMode.value = !context.isTurboMode.value
				context.onTurboToggle?.(context.isTurboMode.value)
			}

			function setRemainingAutoSpinsCount(remainingAutoSpinsCount) {
				context.remainingAutoSpinsCount.value = remainingAutoSpinsCount
				context.onAutoplaySpinsCountChange?.(remainingAutoSpinsCount)
			}

			function skip() {
				context.onSkipRequested?.()
				context.isSkipExpected.value = false
			}

			const betSelector = ref(null)

			onMounted(() => {
				window.PresentationLayerAPI = {
					test: context.test
				}
			})

			return {
				bet: context.bet,
				balance: context.balance,
				win: context.payout,
				currencyCode: context.currencyCode,
				activePopupName: context.activePopupName,
				isLTRTextDirection: context.isLTRTextDirection,
				betsOptions: context.betsOptions,
				betIndex: context.betIndex,
				isBetExpected: context.isBetExpected,
				isSpinExpected: context.isSpinExpected,
				isFreeBet: context.isFreeBet,
				remainingAutoSpinsCount: context.remainingAutoSpinsCount,
				isFreeSpinsMode: context.isFreeSpinsMode,
				isSplashScreenMode: context.isSplashScreenMode,
				isTurboMode: context.isTurboMode,
				uiAlpha: context.uiAlpha,
				presentPopup,
				toggleTurbo,
				resolve,
				refresh: context.refresh,
				test: context.test,

				/*
				FPS: context.FPS,

				isHidden: context.isHidden,
				isSpinExpected: context.isSpinExpected,
				isSkipExpected: context.isSkipExpected,
				currencyCode: context.currencyCode,
				errorText: context.errorText,
				isSimplifiedMode: context.isSimplifiedMode,

				autoSpinsValues: context.autoSpinsValues,
				buyFeatureOptions: context.buyFeatureOptions,
				payout: context.payout,
				balance: context.balance,
				bet: context.bet,
				isTurboMode: context.isTurboMode,
				dictionary: context.dictionary,
				closeAllPopups,
				toggleTurbo,
				setRemainingAutoSpinsCount,
				skip,
				betSelector,
				*/
			}
		},
	}
</script>

<template>
	<!--
	<div class="ui-container">
		<UIPanelBackground class="hidden" id="panelBackground"/>
		<ButtonBuy
			class="hidden"
			:class="{ disabled: !isSpinExpected }"
			@click = "activePopupName='buy'"
			id="buyButton">
			{{ dictionary.buy }}
		</ButtonBuy>
		<Indicator
			class="hidden"
			id="winIndicator"
			:class="{ decorated: !isSimplifiedMode }"
			:width = "150"
			:textFieldWidth = "120"
			:captionText = "dictionary.win + ' (' + currencyCode + ')'"
			:indicatorValue = "payout">
		</Indicator>
		<Indicator
			class="hidden"
			id="balanceIndicator"
			:class="{ decorated: !isSimplifiedMode }"
			:width = "150"
			:textFieldWidth = "120"
			:captionText = "dictionary.balance + ' (' + currencyCode + ')'"
			:indicatorValue = "balance">
		</Indicator>
		<Selector
			class="hidden"
			id="betSelector"
			ref = "betSelector"
			@selected="(selectedIndex) => resolve({
			key: 'change_bet',
			value: selectedIndex
			})"
			:isDecorated = "!isSimplifiedMode"
			:class="{
			decorated: !isSimplifiedMode,
			disabled: !isSimplifiedMode && !isSpinExpected }"
			:width = "150"
			:textFieldWidth = "isSimplifiedMode ? 120 : 70"
			:captionText = "dictionary.bet + ' (' + currencyCode + ')'"
			:selectableValues = "betsOptions">
		</Selector>
		<ButtonSpin
			class="hidden"
			@click = "() => resolve({ key: 'make_bet' })"
			:class="{ disabled: !isSpinExpected }"
			id="spinButton"/>
		<ButtonSkip
			class="hidden"
			@click="skip()"
			v-show="!isSpinExpected"
			:class="{ disabled: !isSkipExpected }"
			id="skipButton"/>
		<ButtonSettings
			class="hidden"
			:class="{ disabled: !isSpinExpected }"
			@click="activePopupName = 'cheats'"
			id="settingsButton"/>
		<ButtonTurbo
			class="hidden"
			:class="{ active: isTurboMode }"
			@click="toggleTurbo()"
			id="turboButton"/>
		<ButtonBet
			class="hidden"
			v-show="isSimplifiedMode"
			:class="{ disabled: !isSpinExpected }"
			@click = "activePopupName='bet'"
			id="betButton"/>
		<ButtonAuto
			class="hidden"
			:class="{ disabled: !isSpinExpected || remainingAutoSpinsCount }"
			id="autoButton"
			@click = "activePopupName='autoplay'"
			/>
		<ButtonStopAuto
			class="hidden"
			v-show="remainingAutoSpinsCount"
			id="stopAutoButton"
			@click = "setRemainingAutoSpinsCount(0)">
			{{ remainingAutoSpinsCount }}
		</ButtonStopAuto>
		<Overlay
			class="hidden"
			@click="closeAllPopups()"
			v-show="!!activePopupName || errorText"
			id="overlay"/>
		<ErrorPopup
			class="hidden"
			v-show="errorText || activePopupName.includes('error')"
			@close = "errorText=''"
			:messageText = "errorText"
			:buttonText = "dictionary.ok"
			id="errorPopup"/>

		<PopupSelector
			class="hidden"
			v-show="activePopupName.includes('autoplay')"
			@close = "closeAllPopups()"
			@confirm = "(selectedIndex) => {
			setRemainingAutoSpinsCount(autoSpinsValues[selectedIndex] - 1)
			resolve({ key: 'make_bet' })
			}"
			:messageText = "dictionary.select_auto_play"
			:buttonText = "dictionary.start"
			:selectableValues = "autoSpinsValues"
			id="autoplayPopup"/>

		<PopupSelector
			class="hidden"
			v-show="activePopupName.includes('bet')"
			@close = "closeAllPopups()"
			@confirm = "(selectedIndex) => resolve({
			key: 'change_bet',
			value: selectedIndex
			})"
			:messageText = "dictionary.select_bet"
			:buttonText = "dictionary.select"
			:selectableValues = "betsOptions"
			:selectorCaptionText = "'(' + currencyCode + ')'"
			id="betPopup"/>

		<PopupSelector
			class="hidden"
			v-show="activePopupName.includes('buy')"
			@close = "closeAllPopups()"
			@confirm = "(selectedIndex) => resolve({
					key: 'buy_bonus',
					value: selectedIndex
				})"
			:messageText = "dictionary.buy_feature"
			:buttonText = "dictionary.buy"
			:selectableValues = "buyFeatureOptions.map(value => value
				+ ' (' + currencyCode + ')')"
			:selectableCaptionValues = "
				betsOptions.map(value => value
					+ ' (' + currencyCode + ')'
					+ dictionary.buy_feature_per_spin)"
			id="buyPopup"/>


		<CheatScreen
			class="hidden"
			v-show="activePopupName.includes('cheats')"
			@close = "closeAllPopups()"
			@confirm = "(reels) => resolve({
			key: 'make_cheat_bet',
			value: reels
			})"
			:messageText = "dictionary.bet + ' ' + bet + ' (' + currencyCode + ')'"
			:buttonText = "dictionary.make_cheat_bet"
			id="cheats">
		</CheatScreen>
		<FPSLabel :FPS = "FPS"></FPSLabel>
	</div>
-->

	<div class="wild-heist ui-container">
		<div  id="bottom" v-show="activePopupName === ''">
			<GameBottom
				@autoplay="(spinsCount) => {
					if (!spinsCount) {
						presentPopup('auto')
					} else {
						
					}
				}"
				@selected="(selectedIndex) => {
					resolve({
						key: 'change_bet',
						value: betsOptions[selectedIndex]
					})
				}"
				@bet="() => {
					presentPopup('bet')
				}"
				@balance="() => {
					presentPopup('balance')
				}"
				@paytable="() => {
					presentPopup('paytable')
				}"
				:balance="balance"
				:betIndex="betIndex"
				:bet="bet"
				:win="win"
				:currencyCode="currencyCode"
				:isLTRTextDirection="isLTRTextDirection"
				:betsOptions="betsOptions"
				:isBetExpected="isBetExpected"
				:isSpinExpected="isSpinExpected"
				:isFreeBet="isFreeBet"
				:remainingAutoSpinsCount="remainingAutoSpinsCount"
				:isFreeSpinsMode="isFreeSpinsMode"
				:isSplashScreenMode="isSplashScreenMode"
			/>
		</div>

		<div id="overlay" v-show="activePopupName !== ''">
			<Overlay
				:activePopupName = activePopupName
				@click="presentPopup()"
			/>
		</div>

<!--      <Rules />-->
		<div id="paytable" v-show="activePopupName.includes('paytable')">
			<PayTable
				@close="() => {
					presentPopup('')
				}"
			/>
		</div>

		<div id="auto" v-show="activePopupName.includes('auto')">
			<AutoGame
				:balance="balance"
				:betIndex="betIndex"
				:bet="bet"
				:win="win"
				:currencyCode="currencyCode"
				:isLTRTextDirection="isLTRTextDirection"
				:betsOptions="betsOptions"
				:isBetExpected="isBetExpected"
				:isSpinExpected="isSpinExpected"
				:isFreeBet="isFreeBet"
				:remainingAutoSpinsCount="remainingAutoSpinsCount"
				:isFreeSpinsMode="isFreeSpinsMode"
				:isSplashScreenMode="isSplashScreenMode"
				:isTurboMode="isTurboMode"
				@balance="() => {
					presentPopup('balance')
				}"
				@bet="() => {
					presentPopup('bet')
				}"
				@close="() => {
					presentPopup('')
				}"
				@turbo="() => {
					toggleTurbo()
				}"
				@auto="() => {
					presentPopup('')
				}"
				@limit="(limit) => {
				}"
			/>
		</div>

		<div id="bet" v-show="activePopupName.includes('bet')">
			<BetOptions
				:balance="balance"
				:betIndex="betIndex"
				:bet="bet"
				:win="win"
				:currencyCode="currencyCode"
				:isLTRTextDirection="isLTRTextDirection"
				:betsOptions="betsOptions"
				:isBetExpected="isBetExpected"
				:isSpinExpected="isSpinExpected"
				:isFreeBet="isFreeBet"
				:remainingAutoSpinsCount="remainingAutoSpinsCount"
				:isFreeSpinsMode="isFreeSpinsMode"
				:isSplashScreenMode="isSplashScreenMode"
				@balance="() => {
					presentPopup('balance')
				}"
				@close="() => {
					presentPopup('')
				}"
				@change_bet="(index) => {
					this.resolve?.({
						key: 'change_bet',
						value:  this.betsOptions[index]
					})
					presentPopup()
				}"
			/>
		</div>

		<div id="balance" v-show="activePopupName.includes('balance')">
			<Balance
				:balance="balance"
				:betIndex="betIndex"
				:bet="bet"
				:win="win"
				:currencyCode="currencyCode"
				:isLTRTextDirection="isLTRTextDirection"
				:betsOptions="betsOptions"
				:isBetExpected="isBetExpected"
				:isSpinExpected="isSpinExpected"
				:isFreeBet="isFreeBet"
				:remainingAutoSpinsCount="remainingAutoSpinsCount"
				:isFreeSpinsMode="isFreeSpinsMode"
				:isSplashScreenMode="isSplashScreenMode"
				@bet="() => {
					presentPopup('bet')
				}"
				@close="() => {
					presentPopup('')
				}"
			/>
		</div>
  	</div>
</template>



<style scoped>
	* {
		pointer-events: auto;
		text-transform: uppercase;
		font-family: roboto;
		font-weight: bold;
		color: #b3b3b3;
		-webkit-touch-callout: none;
		-webkit-user-select: none;
		-khtml-user-select: none;
		-moz-user-select: none;
		-ms-user-select: none;
		user-select: none;
	}

	.disabled {
		color: #333333;
		pointer-events: none;
	}

	.ui-container {
		opacity: v-bind("uiAlpha");
		width: v-bind("!!uiAlpha ? '100%' : 0");
		height: 100%;
		position: absolute;
		pointer-events: none;
		-webkit-tap-highlight-color: transparent;
		z-index: 2;
	}

	.hidden {
		opacity: 0;
		pointer-events: none;
	}




	.paytable-sample-wrapper {
		left: 0px;
		top: 0px;
		width: 2500px;
		height: 1000px;
		position: absolute;
		transform: scale(0.5);
		transform-origin: left top
	}

	.bets-sample-wrapper {
		left: 0px;
		top: 0px;
		width: 2500px;
		height: 1000px;
		position: absolute;
		transform: scale(0.5);
		transform-origin: left top;
	}
</style>

<style lang="scss">
@import "./styles.scss";
</style>
