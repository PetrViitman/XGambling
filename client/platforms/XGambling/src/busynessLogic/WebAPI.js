const protocol = window.location.protocol
const hostname = window.location.hostname
const port = 40000

const webAPI = {
    url: protocol + '//' + hostname + ':' + port + '/',
    get: (route) => fetch(webAPI.url + route, { method: "GET", credentials: 'include', })
        .then(response => response.json())
        .then(data => data),
    post: (route, data = {}) =>{ 
        return fetch(
            webAPI.url + route, {
                method: "POST",
                credentials: 'include',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify(data)
            })
        .then(response => response.json())
        .then(data => data)
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

export default webAPI