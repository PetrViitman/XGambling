const express = require('express')
const { sessionValidation } = require('../../session/SessionRoutes')
const { makeBet, makeRisk, gameDescription } = require('./BookOfXController')

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
        betPerLine,
        linesCount,
        desiredReels,
        riskOption,
        presetSpecialSymbolId,
    } = request.body

    const betResult = await makeBet({
        accountId,
        betPerLine,
        linesCount,
        desiredReels,
        riskOption,
        presetSpecialSymbolId,
        sessionId
    })

    const {errorCode} = betResult

    if(errorCode) {
        return response.send({errorCode})
    }

    response.send(betResult)
})

router.post('/makeRisk', sessionValidation, async (request, response) => {
    const sessionId = request.headers['sessionid']
    const {
        riskOption,
    } = request.body

    const riskResult = await makeRisk({
        riskOption,
        sessionId
    })

    const {errorCode} = riskResult

    if(errorCode) {
        return response.send({errorCode})
    }

    response.send(riskResult)
})

module.exports = router
