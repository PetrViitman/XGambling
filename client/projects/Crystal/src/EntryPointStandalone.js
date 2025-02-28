const parametersFromURL = new URLSearchParams(document.location.search)
const languageCode = parametersFromURL.get("lang") ?? 'en'
const customVFXLevel = parametersFromURL.get("vfx")
const customUIOption = parametersFromURL.get("view")

import './polyfills'
import { GameLogic } from './busynessLogic/GameLogic'
import { MobilePresentation as Presentation } from './presentation/mobile/MobilePresentation'
import { webAPI } from './busynessLogic/standaloneService/WebAPI'

const presentation = new Presentation()
	.setup({
		wrapperHTMLElementId: 'projectWrapper',
		customVFXLevel,
		customUIOption: 'mobile',
		languageCode,
	})

new GameLogic({
	webAPI,
	presentation
}).init()

