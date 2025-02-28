const express = require('express')
const { sessionValidation } = require('../../session/SessionRoutes')
const { makeBet, gameDescription } = require('./CrystalController')

const router = express.Router()

router.get('/gameDescription', sessionValidation, async (request, response) => {
    const sessionId = request.headers['sessionid']
    const descriptor = await gameDescription(sessionId)
    
    response.send(descriptor)
})

router.post('/makeBet', sessionValidation, async (request, response) => {
    const sessionId = request.headers['sessionid']
    
    const {
        accountId,
        bet,
        desiredReels,
    } = request.body

    const betResult = await makeBet({
        accountId,
        bet,
        desiredReels,
        sessionId
    })

    const {errorCode} = betResult

    if(errorCode) {
        return response.send({errorCode})
    }

    response.send(betResult)
})

module.exports = router
