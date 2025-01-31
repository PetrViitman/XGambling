const express = require('express')
const { validateSession } = require('../../Shared')
const { makeBet, gameDescription } = require('./WildHeistShowdownController')

const router = express.Router()

router.post('/gameDescription', validateSession, async (request, response) => {
    const { accountId } = request.body

    const descriptor = await gameDescription(request.session.id, accountId)
    
    response.send(descriptor)
})

router.post('/makeBet', validateSession, async (request, response) => {
    const {
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
        sessionId: request.session.id
    })

    const {errorCode} = betResult

    if(errorCode) {
        return response.send({errorCode})
    }

    response.send(betResult)
})

module.exports = router
