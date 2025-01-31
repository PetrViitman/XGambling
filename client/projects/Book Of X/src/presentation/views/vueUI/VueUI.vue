<script >
	let context
	import { createApp, watch } from 'vue'
	import App from './VueUI.vue'
	export function mountVueUI(wrapperHtmlElementId) {
		context = createApp(App)
		context.mount('#' + wrapperHtmlElementId)
	
		return context
	}

	import Indicator from './components/Indicator.vue'
	import Selector from './components/Selector.vue'
	import FPSLabel from './components/FPSLabel.vue'
	import TextField from './components/TextField.vue'
	import UIPanelBackground from './components/UIPanelBackground.vue'
	import ButtonSpin from './components/buttons/ButtonSpin.vue'
	import ButtonSkip from './components/buttons/ButtonSkip.vue'
	import ButtonSettings from './components/buttons/ButtonSettings.vue'
	import ButtonTurbo from './components/buttons/ButtonTurbo.vue'
	import ButtonBet from './components/buttons/ButtonBet.vue'
	import ButtonAuto from './components/buttons/ButtonAuto.vue'
	import ButtonStopAuto from './components/buttons/ButtonStopAuto.vue'
	import ButtonRisk from './components/buttons/ButtonRisk.vue'
	import Overlay from './components/popups/Overlay.vue'
	import ErrorPopup from './components/popups/PopupError.vue'
	import PopupSelector from './components/popups/PopupSelector.vue'
	import CheatScreen from './components/popups/CheatScreen.vue'
	import { ref, nextTick } from 'vue'
	export default {
	components: {
		Indicator,
		Selector,
		FPSLabel,
		TextField,
		UIPanelBackground,
		ButtonSpin,
		ButtonSkip,
		ButtonSettings,
		ButtonTurbo,
		ButtonBet,
		ButtonAuto,
		ButtonStopAuto,
		ButtonRisk,
		Overlay,
		ErrorPopup,
		PopupSelector,
		CheatScreen,
	},

	setup() {
		context.FPS = ref(0)
		context.resolve = undefined
		context.isHidden = ref(true)
		context.uiAlpha = ref(0)
		context.isSpinExpected = ref(false)
		context.isSkipExpected = ref(false)
		context.isRiskExpected = ref(false)
		context.activePopupName = ref('')
		context.currencyCode = ref('')
		context.errorText = ref('')
		context.isSimplifiedMode = ref(true)
		context.betsOptions = ref([])
		context.linesOptions = ref([])
		context.linesCount = ref(0)
		context.autoplayOptions = ref([])
		context.payout = ref(0)
		context.balance = ref(0)
		context.betIndex = ref(0)
		context.isTurboMode = ref(false)
		context.remainingAutoSpinsCount = ref(0)
		context.dictionary = ref({})
		context.refresh = (data) => {
		for (const [key, value] of Object.entries(data))
			context[key].value = value
		}
		context.getUserInput = () => {
			return new Promise(resolve => { context.resolve = resolve })
		}

	  	watch(context.isSimplifiedMode, (newValue) => {
			if(!newValue && context.activePopupName.value === 'bet')
				context.activePopupName.value = ''
		})

	  	watch(context.betIndex, newValue => {
			betSelector.value.setSelectedIndex(newValue)
			popupBetSelector.value.setSelectedIndex(newValue)
		})

		watch(context.linesCount, newValue => {
			lineSelector.value.setSelectedIndex(newValue - 1)
			popupBetSelector.value.setSelectedIndex2(newValue - 1)
		})

		function closeAllPopups() {
			nextTick(() => context.activePopupName.value = '')
		}

		function resolve(data) {
			context.resolve?.(data)
			context.resolve = undefined
		}

		function resolveAndClosePopups(data) {
			resolve(data)
			closeAllPopups()
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
		const lineSelector = ref(null)
		const popupBetSelector = ref(null)

		return {
			FPS: context.FPS,
			resolve,
			resolveAndClosePopups,
			isHidden: context.isHidden,
			uiAlpha: context.uiAlpha,
			isSpinExpected: context.isSpinExpected,
			isSkipExpected: context.isSkipExpected,
			isRiskExpected: context.isRiskExpected,
			activePopupName: context.activePopupName,
			currencyCode: context.currencyCode,
			errorText: context.errorText,
			isSimplifiedMode: context.isSimplifiedMode,
			betsOptions: context.betsOptions,
			linesOptions: context.linesOptions,
			linesCount: context.linesCount,
			autoplayOptions: context.autoplayOptions,
			remainingAutoSpinsCount: context.remainingAutoSpinsCount,
			payout: context.payout,
			balance: context.balance,
			betIndex: context.betIndex,
			isTurboMode: context.isTurboMode,
			dictionary: context.dictionary,
			closeAllPopups,
			toggleTurbo,
			setRemainingAutoSpinsCount,
			skip,
			betSelector,
			lineSelector,
			popupBetSelector,
		}
	},
}
</script>

<template>
	<div class="ui-container">
		<UIPanelBackground id="panelBackground"/>
		<ButtonRisk
			:class="{ disabled: !isSpinExpected , hidden: !isRiskExpected}"
			@selected = "() => resolve({ key: 'take_risk' })"
			id="riskButton">
			{{ dictionary.take_risk }}
		</ButtonRisk>
		<Indicator
			id="winIndicator"
			:class="{ decorated: !isSimplifiedMode }"
			:width = "150"
			:textFieldWidth = "120"
			:captionText = "dictionary.win + ' (' + currencyCode + ')'"
			:indicatorValue = "payout">
		</Indicator>
		<Indicator
			id="balanceIndicator"
			:class="{ decorated: !isSimplifiedMode }"
			:width = "150"
			:textFieldWidth = "120"
			:captionText = "dictionary.balance + ' (' + currencyCode + ')'"
			:indicatorValue = "balance">
		</Indicator>
		<Selector
			id="betSelector"
			ref = "betSelector"
			@selected="(selectedIndex) => resolve({
				key: 'change_bet',
				value: selectedIndex
			})"
			:isDecorated = "!isSimplifiedMode"
			:class = "{
				decorated: !isSimplifiedMode,
				disabled: !isSimplifiedMode && !isSpinExpected
			}"
			:width = "150"
			:textFieldWidth = "isSimplifiedMode ? 120 : 70"
			:captionText = "dictionary.bet + ' (' + currencyCode + ')'"
			:selectableValues = "betsOptions">
		</Selector>
		<Selector
			id="lineSelector"
			ref = "lineSelector"
			@selected="(selectedIndex) => resolve({
				key: 'change_lines_count',
				value: selectedIndex
			})"
			:isDecorated = "!isSimplifiedMode"
			:class="{
				decorated: !isSimplifiedMode,
				disabled: !isSimplifiedMode && !isSpinExpected
			}"
			:width = "150"
			:textFieldWidth = "isSimplifiedMode ? 120 : 70"
			:captionText = "dictionary.lines"
			:initialIndex = "9"
			:selectableValues = "linesOptions">
		</Selector>
		<ButtonSpin
			@click = "() => resolve({ key: 'make_bet' })"
			:class="{ disabled: !isSpinExpected }"
			id="spinButton"/>
		<ButtonSkip
			@click="skip()"
			v-show="!isSpinExpected"
			:class="{ disabled: !isSkipExpected, hidden: isSpinExpected }"
			id="skipButton"/>
		<ButtonSettings
			:class="{ disabled: !isSpinExpected }"
			@click="activePopupName = 'cheats'"
			id="settingsButton"/>
		<ButtonTurbo
			:class="{ active: isTurboMode }"
			@click="toggleTurbo()"
			id="turboButton"/>
		<ButtonBet
			:class="{ disabled: !isSpinExpected, hidden: !isSimplifiedMode }"
			@click = "activePopupName='bet'"
			id="betButton"/>
		<ButtonAuto
			:class="{ disabled: !isSpinExpected || remainingAutoSpinsCount }"
			id="autoButton"
			@click = "activePopupName='autoplay'"
			/>
		<ButtonStopAuto
			:class="{ hidden: !remainingAutoSpinsCount }"
			id="stopAutoButton"
			@click = "setRemainingAutoSpinsCount(0)">
			{{ remainingAutoSpinsCount }}
		</ButtonStopAuto>
		<Overlay
			@click="closeAllPopups()"
			:class="{ hidden: !activePopupName && !errorText }"
			id="overlay"/>
		<ErrorPopup
			:class="{ hidden: !errorText && !activePopupName.includes('error') }"
			@close = "errorText=''"
			:messageText = "errorText"
			:buttonText = "dictionary.ok"
			id="errorPopup"/>

		<PopupSelector
			:class="{ hidden: !activePopupName.includes('autoplay') }"
			@close = "closeAllPopups()"
			@confirm = "(selectedIndex) => {
			setRemainingAutoSpinsCount(autoplayOptions[selectedIndex] - 1)
				resolveAndClosePopups({ key: 'make_bet' })
			}"
			:messageText = "dictionary.select_autoplay"
			:buttonText = "dictionary.start"
			:selectableValues = "autoplayOptions"
			id="autoplayPopup"/>

		<PopupSelector
			id="popupBetSelector"
			ref="popupBetSelector"
			:class="{ hidden: !activePopupName.includes('bet') }"
			@selected = "(selectedIndex) => resolve({
				key: 'change_bet',
				value: selectedIndex
			})"
			@selected2 = "(selectedIndex) => resolve({
				key: 'change_lines_count',
				value: selectedIndex
			})"
			@close = "closeAllPopups()"
			@confirm = "_ => resolveAndClosePopups({key: 'make_bet'})"
			:messageText = "dictionary.select_bet"
			:buttonText = "dictionary.make_bet"
			:selectorIndex = "0"
			:selectableValues = "betsOptions"
			:selectorCaptionText = "'(' + currencyCode + ')'"
			:selectorIndex2 = "0"
			:selectableValues2 = "linesOptions"
			:selectorCaptionText2 = "dictionary.lines"
		/>

		<CheatScreen
			:class="{ hidden: !activePopupName.includes('cheats') }"
			@close = "closeAllPopups()"
			@confirm = "({
				reels,
				riskOption,
				specialSymbolId
			}) => resolveAndClosePopups({
				key: 'make_cheat_bet',
				value: {
					reels,
					riskOption,
					specialSymbolId
				}
			})"
			:messageText = "dictionary.bet + ' ' + betsOptions[betIndex] + ' (' + currencyCode + ')'"
			:buttonText = "dictionary.make_bet"
			id="cheats">
		</CheatScreen>
		<FPSLabel :FPS = "FPS"></FPSLabel>
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

	.hidden {
		visibility: hidden;
	}

	.disabled {
		color: #333333;
		pointer-events: none;
	}

	@font-face {
		font-family: "roboto";
		src: url('/fonts/roboto.ttf');
	}

	.ui-container {
		opacity: v-bind("uiAlpha");
		width: v-bind("!!uiAlpha ? '100%' : 0");
		height: 100%;
		overflow: hidden;
		position: absolute;
		pointer-events: none;
		-webkit-tap-highlight-color: rgba(0,0,0,0);
		-webkit-tap-highlight-color: transparent;
		z-index: 2;
	}
</style>
