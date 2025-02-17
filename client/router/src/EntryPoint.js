import { RouterLogic } from './busynessLogic/RouterLogic'
import { Presentation } from './presentation/Presentation'
import webAPI from './busynessLogic/WebAPI'


new RouterLogic({
	webAPI,
	presentation: new Presentation({})
}).init()