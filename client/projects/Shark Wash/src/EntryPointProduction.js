const parametersFromURL = new URLSearchParams(document.location.search)
const languageCode = parametersFromURL.get("lang") ?? 'en'
const customVFXLevel = parametersFromURL.get("vfx")
const customUIOption = parametersFromURL.get("view")
const sessionId = parametersFromURL.get("sessionId")

import './polyfills'
import { GameLogic } from './busynessLogic/GameLogic'
import { Presentation } from './presentation/Presentation'

const protocol = window.location.protocol
const hostname = window.location.hostname
const port = 5004

const presentation = new Presentation()
    .setup({
        customVFXLevel,
        customUIOption,
        languageCode,
        wrapperHTMLElementId: 'projectWrapper'
    })

const remoteWebAPI = {
    url: document.serviceURL ?? protocol + '//' + hostname + ':' + port + '/',
    get: (route) => fetch(remoteWebAPI.url + route, {
        method: "GET",
        credentials: 'include',
        headers: {
            'sessionid': sessionId
        },
    })
        .then(response => response.json())
        .then(data => data)
        .catch(_ => {return {errorCode: -1}}),
    post: (route, data = {}) =>{ 
        return fetch(
            remoteWebAPI.url + route, {
                method: "POST",
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                    'sessionid': sessionId
                },
                body: JSON.stringify(data)
            })
        .then(response => response.json())
        .then(data => data)
        .catch(_ => {return {errorCode: -1}})
    },
    gameDescription: () => remoteWebAPI.get('sharkWash/gameDescription'),
    makeBet: (data) => remoteWebAPI.post('sharkWash/makeBet', data),
}

new GameLogic({
    webAPI: remoteWebAPI,
    presentation
}).init()
