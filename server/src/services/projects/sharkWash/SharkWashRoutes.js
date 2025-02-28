const express = require('express')
const { sessionValidation } = require('../../session/SessionRoutes')
const { makeBet, gameDescription } = require('./SharkWashController')

const router = express.Router()

router.get('/gameDescription', sessionValidation, async (request, response) => {
    const sessionId = request.headers['sessionid']
    const descriptor = await gameDescription(sessionId)
    
    response.send(descriptor)
})

router.post('/makeBet', sessionValidation, async (request, response) => {
    const sessionId = request.headers['sessionid']
    const {
        bet,
        isBuyFeatureRequest,
        desiredReels,
    } = request.body

    const betResult = await makeBet({
        sessionId,
        bet,
        isBuyFeatureRequest,
        desiredReels,
    })

    const {errorCode} = betResult

    if(errorCode) {
        return response.send({errorCode})
    }

    response.send(betResult)
})

module.exports = router
