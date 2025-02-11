<script >
	let context
	import { createApp, watch } from 'vue'
	import App from './VueUI.vue'
	export function mountVueUI(wrapperHtmlElementId) {
		const htmlElement = document.getElementById(wrapperHtmlElementId)
		const divHTMLElement = document.createElement('div')
		context = createApp(App)
		context.mount(divHTMLElement)

		htmlElement.appendChild(divHTMLElement)
	
		return context
	}

	import TextField from './components/TextField.vue'
	import Overlay from './components/popups/Overlay.vue'
	import Header from './components/Header.vue'
	import Footer from './components/Footer.vue'
	import Login from './components/popups/Login.vue'
	import { ref, nextTick } from 'vue'
	import ProjectView from './components/popups/ProjectView.vue'

	export default {
	components: {
		TextField,
		Overlay,
		Footer,
		Header,
		Login,
		ProjectView
	},

	setup() {
		context.errorCode = ref(0)
		context.username = ref('')
		context.accounts = ref([])
		context.projectName = ref('')
		context.resolve = undefined
		context.uiAlpha = ref(0)
		context.isUIVisible = ref(false)
		context.activePopupName = ref('iframe login')
		context.dictionary = ref({})
		context.projectURL = ref(undefined)
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

	  	watch(context.bet, newValue =>
			betSelector.value.setSelectedValue(newValue))

		function closeAllPopups() {
			nextTick(() => context.activePopupName.value = '')
		}



		function resolve(data) {
			context.resolve?.(data)
			context.resolve = undefined
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

		return {
			errorCode: context.errorCode,
			username: context.username,
			accounts: context.accounts,
			projectName: context.projectName,
			resolve,
			uiAlpha: context.uiAlpha,
			isUIVisible: context.isUIVisible,
			activePopupName: context.activePopupName,
			dictionary: context.dictionary,
			closeAllPopups,
			projectURL: context.projectURL
		}
	},
}
</script>

<template>
	<div class="ui-container">
		<Header
			id="header"
			class="reverse-fadable"
			:username="username"
			:accounts="accounts"
			@logout="resolve"
		>
		</Header>
		<Footer
			class="reverse-fadable"
			:text = "'XGambling'"
			id="footer"
			>
		</Footer>
		<Overlay v-show="activePopupName !== ''" class="fadable"></Overlay>
		<Login
			v-show="activePopupName.includes('login')"
			id="login"
			class="fadable"
			:errorCode="errorCode"
			@submit="resolve"
		>
		
		</Login>
		<ProjectView
			v-show="activePopupName.includes('iframe')"
			@close="resolve"
			class="fadable"
			:projectName="projectName"
			:projectURL="projectURL"
			id="iframe"
		>
		
		</ProjectView>
	</div>
</template>

<style scoped>
	* {
		pointer-events: auto;
		font-family: Tahoma;
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
		pointer-events: none;
		width: 100%;
		height: 100%;
		overflow: hidden;
		position: absolute;
		-webkit-tap-highlight-color: transparent;
		z-index: 2;
	}

	.ui-container * {
		pointer-events: auto;
	}
	
	.fadable {
		opacity: v-bind("uiAlpha");
	}

	.reverse-fadable {
		opacity: v-bind("isUIVisible ? (1 - uiAlpha) : 0");
	}
</style>
