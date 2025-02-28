const protocol = window.location.protocol
const hostname = window.location.hostname
const port = 5004

const webAPI = {
    url: protocol + '//' + hostname + ':' + port + '/',
    get: (route, data = {}) => fetch(
        webAPI.url + route, {
            method: "GET",
            headers: data
        })
        .then(response => response.json())
        .then(data => data),
    post: (route, data = {}) =>{ 
        return fetch(
            webAPI.url + route, {
                method: "POST",
                headers: {
                    'Content-Type': 'application/json',
                    sessionId: data.sessionId
                },
                body: JSON.stringify(data)
            })
        .then(response => response.json())
        .then(data => data)
    },
    getProjectsList: data => webAPI.get('project/list', data),
    logIn: data => webAPI.post('user/logIn', data),
    logOut: data => webAPI.post('user/logOut', data),
    balance: data => webAPI.get('user/balance', data),
    userInfo: data => webAPI.get('user/userInfo', data),
    deposit: data => webAPI.post('user/deposit', data)
}

export default webAPI