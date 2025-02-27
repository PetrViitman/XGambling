const express = require('express')
const { validateSessionPost } = require('../../session/SessionRoutes')
const { makeBet, gameDescription } = require('./WildHeistShowdownController')

const router = express.Router()

router.post('/gameDescription', validateSessionPost, async (request, response) => {
    const { accountId, sessionId } = request.body

    const descriptor = await gameDescription(sessionId, accountId)
    
    response.send(descriptor)
})

router.post('/makeBet', validateSessionPost, async (request, response) => {
    const {
        sessionId,
        accountId,
        bet,
        isBuyFeatureRequest,
        desiredReels,
    } = request.body

    const betResult = await makeBet({
        accountId,
        bet,
        isBuyFeatureRequest,
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
