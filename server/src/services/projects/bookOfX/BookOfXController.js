const { ERROR_CODES, BET_OPTIONS, ROLES } = require("../../../Constants");
const { getUserIfCanAffordDeposit, getUser, saveUser } = require("../../user/UserController");
const { SlotMachine, COEFFICIENTS, WIN_LINES } = require("./BookOfXSlotMachine");
const probability = require('./probabilities/RTP97%')
const slotMachine = new SlotMachine(probability)
const BookOfXRiskModel = require('./BookOfXRiskModel');


const savePendingPayout = async(sessionId, payout, accountId = 0) => {
    const user = await getUser({sessionId})

    if (user.errorCode) {
        return {errorCode:  user.errorCode}
    }

    if (!user.name) {
        return {errorCode: ERROR_CODES.USER.USER_NOT_FOUND}
    }

    let pendingRiskDescriptor
    await BookOfXRiskModel
        .findOne({name: user.name})
        .exec()
        .then(risk => 
        {
            pendingRiskDescriptor = risk ?? {}
        })
        .catch(_ => {
            pendingRiskDescriptor = {errorCode: ERROR_CODES.NETWORK.SOMETHING_WENT_WRONG}
        })

    const {name, errorCode} = pendingRiskDescriptor

    if (errorCode) {
        return {errorCode}
    }

    if (name) {
        pendingRiskDescriptor.pendingPayout = payout
        pendingRiskDescriptor.accountId = accountId
        await pendingRiskDescriptor.save()

        return {}
    }

    let result
    await new BookOfXRiskModel({
            name: user.name,
            pendingPayout: payout,
            accountId
        })
        .save()
        .then((risk) => {
            result = risk
        })
        .catch(_ => {
            result = {errorCode: ERROR_CODES.NETWORK.SOMETHING_WENT_WRONG}
        })

    return result
}

const getPendingPayout = async (sessionId) => {
    const user = await getUser({sessionId})

    if (user.errorCode) {
        return {errorCode:  user.errorCode}
    }

    if (!user.name) {
        return {errorCode: ERROR_CODES.USER.USER_NOT_FOUND}
    }

    let pendingRiskDescriptor

    await BookOfXRiskModel
        .findOne({name: user.name})
        .exec()
        .then(risk => 
        {
            pendingRiskDescriptor = risk ?? {}
        })
        .catch(_ => {
            pendingRiskDescriptor = {errorCode: ERROR_CODES.NETWORK.SOMETHING_WENT_WRONG}
        })

    const {pendingPayout, errorCode, accountId} = pendingRiskDescriptor

    return {pendingPayout, accountId, errorCode}
}

const gameDescription = async(sessionId, accountId = 0) => {
    const {
        errorCode,
        accounts
    } = await getUser({sessionId})

    if (errorCode) {
        return {errorCode}
    }

    const {currencyCode, balance } = accounts[accountId]

    return {
        winLinesTopologies: WIN_LINES,
        coefficients: COEFFICIENTS,
        betsOptions: BET_OPTIONS[currencyCode],
        accounts,
        currencyCode,
        balance
    }
}

const makeBet = async ({
    sessionId,
    accountId = 0,
    betPerLine,
    linesCount,
    desiredReels,
    riskOption,
    presetSpecialSymbolId
}) => {
    if (
        !betPerLine,
        !linesCount
    ) {
        return {errorCode: ERROR_CODES.BET.INVALID_BET_REQUEST}
    }
    
    const betPerAllLines = betPerLine * linesCount
    const user = await getUserIfCanAffordDeposit({
        sessionId,
        deposit: -betPerAllLines,
        accountId
    })

    if (user.errorCode) {
        return {errorCode: user.errorCode}
    }

    await BookOfXRiskModel
        .findOneAndDelete({name: user.name})
        .exec()
    
    const isCheatBetAvailable = user.role >= ROLES.TESTER

    try {
        descriptor = await slotMachine.generateSingleGameDescriptor({
            betPerLine, // PER LINE!!!
            linesCount,
            desiredReels: isCheatBetAvailable ? desiredReels : undefined,
            // riskOption: isCheatBetAvailable ? riskOption : undefined,
            presetSpecialSymbolId: isCheatBetAvailable ? presetSpecialSymbolId : undefined
        })
    } catch (error) {
        console.log(error)

        return {errorCode: ERROR_CODES.NETWORK.SOMETHING_WENT_WRONG}
    }

    const totalPayout = descriptor.totalCoefficient * betPerAllLines
    user.accounts[accountId].balance += totalPayout - betPerAllLines

    await user.save()
    await savePendingPayout(sessionId, totalPayout, accountId)

    return {
        ...descriptor,
        currencyCode: user.accounts[accountId].currencyCode,
        balance: user.accounts[accountId].balance,
    }
}

const makeRisk = async ({sessionId, riskOption}) => {
    const {pendingPayout, errorCode, accountId} = await getPendingPayout(sessionId)
    if (errorCode) {
        return {errorCode}
    }

    if (!pendingPayout) {
        return {errorCode: ERROR_CODES.NETWORK.SOMETHING_WENT_WRONG}
    }

    const user = await getUserIfCanAffordDeposit({
        sessionId,
        deposit: -pendingPayout,
        accountId
    })

    if (user.errorCode) {
        return {errorCode: user.errorCode}
    }

    const {
        coefficient,
        payout,
        option
    } = await slotMachine.generateRiskGameDescriptor({option: riskOption, pendingPayout})

    user.accounts[accountId].balance += payout - pendingPayout

    if (coefficient) {
        const updateResult = await savePendingPayout(sessionId, payout, accountId)

        if(updateResult.errorCode) {
            return {errorCode}
        }
    }

    const updateResult = await saveUser(user)
    
    if(updateResult.errorCode) {
        return {errorCode}
    }

    return {
        coefficient,
        payout,
        option,
        balance: user.accounts[accountId].balance,
    }
}

module.exports = {
    gameDescription,
    makeBet,
    makeRisk
}