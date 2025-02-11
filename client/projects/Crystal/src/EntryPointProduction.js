import './polyfills'
import { GameLogic } from './busynessLogic/GameLogic'
import { MobilePresentation as Presentation } from './presentation/mobile/MobilePresentation'

const protocol =  window.location.protocol
const hostname = window.location.hostname
const port = 50004

const presentation = new Presentation().setup({wrapperHTMLElementId: 'projectWrapper'})

const remoteWebAPI = {
    url: document.serviceURL ?? protocol + '//' + hostname + ':' + port + '/',
    get: (route) => fetch(remoteWebAPI.url + route, { method: "GET", credentials: 'include', })
        .then(response => response.json())
        .then(data => data)
        .catch(_ => {return {errorCode: -1}}),
    post: (route, data = {}) =>{ 
        return fetch(
            remoteWebAPI.url + route, {
                method: "POST",
                credentials: 'include',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify(data)
            })
        .then(response => response.json())
        .then(data => data)
        .catch(_ => {return {errorCode: -1}})
    },
    gameDescription: () => remoteWebAPI.get('crystal/gameDescription'),
    makeBet: (data) => remoteWebAPI.post('crystal/makeBet', data),
}

new GameLogic({
    webAPI: remoteWebAPI,
    presentation
}).init()


console.log(remoteWebAPI)
