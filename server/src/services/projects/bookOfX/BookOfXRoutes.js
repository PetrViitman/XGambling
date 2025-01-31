const express = require('express')
const { validateSession } = require('../../Shared')
const { makeBet, makeRisk, gameDescription } = require('./BookOfXController')

const router = express.Router()

router.get('/gameDescription', validateSession, async (request, response) => {
    const descriptor = await gameDescription(request.session.id)
    
    response.send(descriptor)
})

router.post('/makeBet', validateSession, async (request, response) => {
    const {
        accountId,
        betPerLine,
        linesCount,
        desiredReels,
        riskOption,
        presetSpecialSymbolId
    } = request.body

    const betResult = await makeBet({
        accountId,
        betPerLine,
        linesCount,
        desiredReels,
        riskOption,
        presetSpecialSymbolId,
        sessionId: request.session.id
    })

    const {errorCode} = betResult

    if(errorCode) {
        return response.send({errorCode})
    }

    response.send(betResult)
})

router.post('/makeRisk', validateSession, async (request, response) => {
    const {
        riskOption
    } = request.body

    const riskResult = await makeRisk({
        riskOption,
        sessionId: request.session.id
    })

    const {errorCode} = riskResult

    if(errorCode) {
        return response.send({errorCode})
    }

    response.send(riskResult)
})

module.exports = router
