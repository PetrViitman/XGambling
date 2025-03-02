import './polyfills'
import { BusynessLogic } from './busynessLogic/BusynessLogic'
import { Presentation } from './presentation/Presentation'
const parametersFromURL = new URLSearchParams(document.location.search)
const protocol = window.location.protocol
const hostname = window.location.hostname
const port = 10000

const webAPI = {
    url: protocol + '//' + hostname + ':' + port + '/',
    get: (route) => fetch(webAPI.url + route, {
        method: "GET",
        credentials: 'include',
        headers: {
            'sessionid': window.sessionId
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
                    'sessionid': window.sessionId
                },
                body: JSON.stringify(data)
            })
        .then(response => response.json())
        .then(data => data)
        .catch(_ => {return {errorCode: -1}})
    },
    getProjectsList: () => webAPI.get('project/list'),
    logIn: data => webAPI.post('user/logIn', data),
    logOut: () => webAPI.post('user/logOut'),
    userInfo: () => webAPI.get('user/userInfo'),


/*
    getProjectsList: () => { return {projects: [{name: 'Shark Wash'}] } },
    logIn: data => { return {}},
    logOut: () => webAPI.post('user/logOut'),
    userInfo: () =>{
        return {
            name: 'ADMIN',
            accounts: [{balance: 500, currencyCode: 'FUN'}]
        }
    },*/
}

new BusynessLogic({
	webAPI,
	presentation: new Presentation({})
}).init()
