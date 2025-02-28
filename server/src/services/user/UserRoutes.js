const express = require('express')
const router = express.Router()
const userController = require('./UserController')
const { sessionValidation } = require('../session/SessionRoutes')
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
    
    await userController.logOut(request.headers['sessionid'])
    const { sessionId, balance, username, errorCode} = await userController.logIn({name, password})

    if (errorCode) {
        return response.send({errorCode})
    }

    response.send({balance, username, sessionId})
})

router.post('/logOut', sessionValidation, async (request, response) => {
    const { sessionId } = request.body
    const { errorCode } = await userController.logOut(sessionId)

    if(errorCode) {
        return response.send({ errorCode })
    }

    await deleteSession(sessionId)

    response.send({result: 'success'})
})


router.post('/delete', sessionValidation, async (request, response) => {
    const { name, password } = request.body
    const {errorCode} = await userController.deleteUser(name, password)

    if (errorCode) {
        return response.send({errorCode})
    }

    response.send({result: 'success'})
})

router.post('/addAccount', sessionValidation, async (request, response) => {
    const sessionId = request.headers['sessionid']
    const {
        username,
        accountName,
        deposit,
        currencyCode,
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

router.post('/deposit', sessionValidation, async (request, response) => {
    const sessionId = request.headers['sessionid']
    const {
        username,
        accountName,
        deposit
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

router.get('/balance', sessionValidation, async (request, response) => {
    const sessionId = request.headers['sessionid']
    const {errorCode, balance} = await userController.getBalance(sessionId)

    if (errorCode) {
        return response.send({errorCode})
    }

    response.send({balance})
})

router.get('/userInfo', sessionValidation, async (request, response) => {
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