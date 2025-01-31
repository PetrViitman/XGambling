const express = require('express')
const { validateSession } = require('../../Shared')
const { makeBet, gameDescription } = require('./CorsairsGoldController')

const router = express.Router()

router.get('/gameDescription', validateSession, async (request, response) => {
    const descriptor = await gameDescription(request.session.id)
    
    response.send(descriptor)
})

router.post('/makeBet', validateSession, async (request, response) => {
    const {
        accountId,
        bet,
        buyFeaturePrice,
        desiredReels,
    } = request.body

    const betResult = await makeBet({
        accountId,
        bet,
        buyFeaturePrice,
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
