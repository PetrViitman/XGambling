const BUY_FEATURE_BET_MULTIPLIER = 75
const { ERROR_CODES, BET_OPTIONS, ROLES } = require("../../../Constants");
const { getUserIfCanAffordDeposit, getUser } = require("../../user/UserController");
const { SlotMachine, COEFFICIENTS } = require("./WildHeistShowdownSlotMachine");
const probability = require('./probabilities/RTP97')
const slotMachine = new SlotMachine(probability)


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
        coefficients: COEFFICIENTS,
        minimalBet: BET_OPTIONS[currencyCode][0],
		maximalBet: BET_OPTIONS[currencyCode][BET_OPTIONS[currencyCode].length - 1],
        accounts,
        buyFeatureBetMultiplier: BUY_FEATURE_BET_MULTIPLIER,
        currencyCode,
        balance
    }
}

const makeBet = async ({
    sessionId,
    accountId,
    bet,
    isBuyFeatureRequest,
    desiredReels,
}) => {
    if (
        !bet
    ) {
        return {errorCode: ERROR_CODES.BET.INVALID_BET_REQUEST}
    }


    const finalBet = isBuyFeatureRequest ? bet * BUY_FEATURE_BET_MULTIPLIER : bet
    
    const user = await getUserIfCanAffordDeposit({
        sessionId,
        deposit: -finalBet,
        accountId,
    })

    if (user.errorCode) {
        return {errorCode: user.errorCode}
    }

    let descriptor

    try {
        descriptor = await slotMachine.generateSingleGameDescriptor({
            bet,
            desiredReels: user.role >= ROLES.TESTER ? desiredReels : undefined,
            isBonusPurchased: isBuyFeatureRequest,
        })
    } catch (error) {
        console.log(error)

        return {errorCode: ERROR_CODES.NETWORK.SOMETHING_WENT_WRONG}
    }

    const totalPayout = descriptor.totalCoefficient * bet

    user.accounts[accountId].balance += totalPayout - finalBet

    await user.save()

    return {
        ...descriptor,
        currencyCode: user.accounts[accountId].currencyCode,
        balance: user.accounts[accountId].balance,
        totalPayout
    }
}


module.exports = {
    gameDescription,
    makeBet
}