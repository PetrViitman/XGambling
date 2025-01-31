import './polyfills'
import { GameLogic } from './busynessLogic/GameLogic'
import { MobilePresentation as Presentation } from './presentation/mobile/MobilePresentation'
import { webAPI } from './busynessLogic/standaloneService/WebAPI'

const customURLParameters = new URLSearchParams(document.location.search)
const languageCode = customURLParameters.get("lang") ?? 'en'
const customVFXLevel = customURLParameters.get("vfx")
const customUIOption = customURLParameters.get("view")

const presentation = new Presentation()
	.setup({
		wrapperHTMLElementId: 'gameWrapper',
		customVFXLevel,
		customUIOption,
		languageCode,
	})

new GameLogic({
	webAPI,
	presentation
}).init()

