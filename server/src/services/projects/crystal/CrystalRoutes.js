const express = require('express')
const { validateSessionPost, validateSessionGet } = require('../../session/SessionRoutes')
const { makeBet, gameDescription } = require('./CrystalController')

const router = express.Router()

router.get('/gameDescription', validateSessionGet, async (request, response) => {
    const sessionId = request.headers['sessionid']
    const descriptor = await gameDescription(sessionId)
    
    response.send(descriptor)
})

router.post('/makeBet', validateSessionPost, async (request, response) => {
    const {
        accountId,
        bet,
        desiredReels,
        sessionId
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
