import './polyfills'
import { GameLogic } from './busynessLogic/GameLogic'
import { Presentation } from './presentation/Presentation'
const customURLParameters = new URLSearchParams(document.location.search)
const languageCode = customURLParameters.get("lang") ?? 'en'
const customVFXLevel = customURLParameters.get("vfx")
const customUIOption = customURLParameters.get("view")
const customMobileApplicationClientOption = customURLParameters.get("isMobileAppClient")

const presentation = new Presentation()
	.setup({
		wrapperHTMLElementId: 'gameWrapper',
		customVFXLevel,
		customUIOption,
		languageCode,
		isMobileApplicationClient: customMobileApplicationClientOption
	})

new GameLogic(presentation).init()




// import { RTPEditor } from "./busynessLogic/webAPI/service/slotMachine/RTPEditor";
// const rtpEditor = new RTPEditor()
// const probability = rtpEditor.adjustProbability()
// rtpEditor.printProbabilitySummCheck()
// rtpEditor.simulateLaunches({probability})
// rtpEditor.getRTPWithComments()
// rtpEditor.printProbability()

/*
getLaunchSimulationData({
		simulationsCount = 1000,
		spinsCount = 50_000,
	})
*/
