const { ERROR_CODES } = require("../../../Constants");
const { getUserIfCanAffordDeposit, getUser } = require("../../user/UserController");
const { SlotMachine, COEFFICIENTS, WIN_LINES } = require("./CorsairsGoldSlotMachine");
const probability = require('./probabilities/ProbabilityTemplate')
const slotMachine = new SlotMachine(probability)

const gameDescription = async(sessionId) => {
    const {
        balance,
        errorCode
    } = await getUser({sessionId})

    if (errorCode) {
        return {errorCode}
    }

    return {
		coefficients: COEFFICIENTS,
        winLinesTopologies: WIN_LINES,
        betsOptions: [1, 5, 10, 10],
        buyFeatureOptions: [1, 5, 10, 10],
        balance,
        currencyCode: 'FUN'
    }
}

const makeBet = async ({
    sessionId,
    accountId,
    bet,
    buyFeaturePrice,
    desiredReels,
}) => {
    if (
        !bet
    ) {
        return {errorCode: ERROR_CODES.BET.INVALID_BET_REQUEST}
    }
    
    const user = await getUserIfCanAffordDeposit({
        sessionId,
        deposit: -bet,
        accountId
    })

    if (user.errorCode) {
        return {errorCode: user.errorCode}
    }

    let descriptor

    try {
        descriptor = slotMachine.generateSingleGameDescriptor({
            bet,
            desiredReels,
            buyFeaturePrice,
        })
    } catch (error) {
        console.log(error)

        return {errorCode: ERROR_CODES.NETWORK.SOMETHING_WENT_WRONG}
    }

    user.accounts[accountId].balance += descriptor.totalCoefficient * bet - bet

    await user.save()

    return {
        ...descriptor,
        currencyCode: 'FUN',
        balance: user.balance
    }
}


module.exports = {
    gameDescription,
    makeBet
}