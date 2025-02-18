const customURLParameters = new URLSearchParams(document.location.search)
const languageCode = customURLParameters.get("lang") ?? 'en'
const customVFXLevel = customURLParameters.get("vfx")
const customUIOption = customURLParameters.get("view")


import './polyfills'
import { GameLogic } from './busynessLogic/GameLogic'
import { Presentation } from './presentation/Presentation'

const protocol = window.location.protocol
const hostname = window.location.hostname
const port = 50004

const presentation = new Presentation().setup({
    customVFXLevel,
    customUIOption,
    languageCode,
    wrapperHTMLElementId: 'projectWrapper'
})

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
        .then(data => {
            console.log('RESPONSE: ', { data} ) 
            return data
        })
        .catch(_ => {return {errorCode: -1}})
    },
    gameDescription: (data) => remoteWebAPI.post('wildHeistShowdown/gameDescription', data),
    makeBet: (data) => remoteWebAPI.post('wildHeistShowdown/makeBet', data),
    switchAccount: (data) => {errorCode: 'не реализовано'},
    getGameBonuses: (data) => {return []},
}

new GameLogic({
    webAPI: remoteWebAPI,
    presentation
}).init()
