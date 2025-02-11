import { BusynessLogic } from './busynessLogic/BusynessLogic'
import { Presentation } from './presentation/Presentation'
import webAPI from './busynessLogic/WebAPI'


new BusynessLogic({
	webAPI,
	presentation: new Presentation({})
}).init()
