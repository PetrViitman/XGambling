const express = require('express')
const { validateSession } = require('../../Shared')
const { makeBet, gameDescription } = require('./SharkWashController')

const router = express.Router()

router.get('/gameDescription', validateSession, async (request, response) => {
    const descriptor = await gameDescription(request.session.id)
    
    response.send(descriptor)
})

router.post('/makeBet', validateSession, async (request, response) => {
    const {
        sessionId,
        bet,
        isBuyFeatureRequest,
        desiredReels,
    } = request.body

    const betResult = await makeBet({
        sessionId,
        bet,
        isBuyFeatureRequest,
        desiredReels,
        sessionId: request.session.id
    })

    const {errorCode} = betResult

    if(errorCode) {
        return response.send({errorCode})
    }

    response.send(betResult)
})

module.exports = router
