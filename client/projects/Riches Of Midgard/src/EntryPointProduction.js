const urlParameters = new URLSearchParams(document.location.search)
const languageCode = urlParameters.get("lang") ?? 'en'
const customVFXLevel = urlParameters.get("vfx")
const customUIOption = urlParameters.get("view")
const sessionId = urlParameters.get("sessionId")

import './polyfills'
import { GameLogic } from './busynessLogic/GameLogic'
import { Presentation } from './presentation/Presentation'

const presentation = new Presentation()
    .setup({
        languageCode,
        customVFXLevel,
        customUIOption,
        wrapperHTMLElementId: 'projectWrapper'
    })

const webAPI = {
    url: document.serviceURL ?? window.location.href,
    get: (route) => fetch(webAPI.url + route, {
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
            webAPI.url + route, {
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
    gameDescription: () => webAPI.get('richesOfMidgard/gameDescription'),
    makeBet: (data) => webAPI.post('richesOfMidgard/makeBet', data),
}

new GameLogic({
    webAPI,
    presentation
}).init()
