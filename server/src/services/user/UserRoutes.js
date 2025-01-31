const express = require('express')
const router = express.Router()
const userController = require('./UserController')
const {validateSession} = require('../Shared')
const { ERROR_CODES } = require('../../Constants')


router.post('/signUp', async (request, response) => {
    const { name, password } = request.body
    const signUpResult = await userController.signUp(name, password)

    if (signUpResult.errorCode) {
        return response.send({errorCode: signUpResult.errorCode})
    }

    const logInResult = await userController.logIn({name, password, sessionId: request.session.id})

    if (logInResult.errorCode) {
        return response.send({errorCode: logInResult.errorCode})
    }
    
    request.session.isAuth = true
    response.send({result: 'success'})
})

router.post('/logIn', async (request, response) => {
    const {name, password} = request.body

    await userController.logOut(request.session.id)
    const { balance, username, errorCode} = await userController.logIn({name, password, sessionId: request.session.id})

    if (errorCode) {
        return response.send({errorCode})
    }

    request.session.isAuth = true
    await request.session.save()

    response.send({balance, username})
})

router.post('/logOut', validateSession, async (request, response) => {
    const logOutResult = await userController.logOut(request.session.id)

    if(logOutResult.errorCode) {
        return response.send()
    }

    await request.session.destroy()

    response.send({result: 'success'})
})


router.post('/delete', validateSession, async (request, response) => {
    const { name, password } = request.body
    const {errorCode} = await userController.deleteUser(name, password)

    if (errorCode) {
        return response.send({errorCode})
    }

    response.send({result: 'success'})
})

router.post('/addAccount', validateSession, async (request, response) => {
    const {
        username,
        accountName,
        deposit,
        currencyCode
    } = request.body

    const {errorCode} = await userController.addAccount({
        username,
        accountName,
        deposit,
        currencyCode,
        sessionId: request.session.id
    })

    if (errorCode) {
        return response.send({errorCode})
    }

    response.send({result: 'success'})
})

router.post('/deposit', validateSession, async (request, response) => {
    const {
        username,
        accountName,
        deposit
    } = request.body

    const {errorCode} = await userController.deposit({
        username,
        accountName,
        deposit,
        sessionId: request.session.id
    })

    if (errorCode) {
        return response.send({errorCode})
    }

    response.send({result: 'success'})
})

router.get('/balance', validateSession, async (request, response) => {
    const {errorCode, balance} = await userController.getBalance(request.session.id)

    if (errorCode) {
        return response.send({errorCode})
    }

    response.send({balance})
})

router.get('/userInfo', validateSession, async (request, response) => {
    const {
        errorCode,
        name,
        accounts,
        role
    } = await userController.getUser({sessionId: request.session.id})

    if (errorCode) {
        return response.send({errorCode})
    }

    response.send({name, accounts, role})
})

module.exports = router