const express = require('express')
const router = express.Router()
const userController = require('./UserController')
const { validateSessionPost, validateSessionGet } = require('../session/SessionRoutes')
const { deleteSession } = require('../session/SessionController')

router.post('/signUp', async (request, response) => {
    const { name, password } = request.body
    const signUpResult = await userController.signUp(name, password)

    if (signUpResult.errorCode) {
        return response.send({errorCode: signUpResult.errorCode})
    }

    const logInResult = await userController.logIn({name, password})    
    if (logInResult.errorCode) {
        return response.send({errorCode: logInResult.errorCode})
    }

    response.send({sessionId: logInResult.sessionId})
})

router.post('/logIn', async (request, response) => {
    const {name, password} = request.body

    await userController.logOut(request.body.sessionId)
    const { sessionId, balance, username, errorCode} = await userController.logIn({name, password})

    if (errorCode) {
        return response.send({errorCode})
    }

    response.send({balance, username, sessionId})
})

router.post('/logOut', validateSessionPost, async (request, response) => {
    const { sessionId } = request.body
    const logOutResult = await userController.logOut(sessionId)

    if(logOutResult.errorCode) {
        return response.send()
    }

    await deleteSession(sessionId)

    response.send({result: 'success'})
})


router.post('/delete', validateSessionPost, async (request, response) => {
    const { name, password } = request.body
    const {errorCode} = await userController.deleteUser(name, password)

    if (errorCode) {
        return response.send({errorCode})
    }

    response.send({result: 'success'})
})

router.post('/addAccount', validateSessionPost, async (request, response) => {
    const {
        username,
        accountName,
        deposit,
        currencyCode,
        sessionId
    } = request.body

    const {errorCode} = await userController.addAccount({
        username,
        accountName,
        deposit,
        currencyCode,
        sessionId
    })

    if (errorCode) {
        return response.send({errorCode})
    }

    response.send({result: 'success'})
})

router.post('/deposit', validateSessionPost, async (request, response) => {
    const {
        username,
        accountName,
        deposit,
        sessionId
    } = request.body

    const {errorCode} = await userController.deposit({
        username,
        accountName,
        deposit,
        sessionId
    })

    if (errorCode) {
        return response.send({errorCode})
    }

    response.send({result: 'success'})
})

router.get('/balance', validateSessionGet, async (request, response) => {
    const sessionId = request.headers['sessionid']
    const {errorCode, balance} = await userController.getBalance(sessionId)

    if (errorCode) {
        return response.send({errorCode})
    }

    response.send({balance})
})

router.get('/userInfo', validateSessionGet, async (request, response) => {
    const sessionId = request.headers['sessionid']

    const {
        errorCode,
        name,
        accounts,
        role
    } = await userController.getUser({sessionId})

    if (errorCode) {
        return response.send({errorCode})
    }

    response.send({name, accounts, role})
})

module.exports = router