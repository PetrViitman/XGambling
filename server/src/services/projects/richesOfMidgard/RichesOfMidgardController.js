const { ERROR_CODES, BET_OPTIONS, ROLES } = require("../../../Constants");
const { getUserIfCanAffordDeposit, getUser } = require("../../user/UserController");
const { SlotMachine, COEFFICIENTS, WIN_LINES } = require("./RichesOfMidgardSlotMachine");
const probability = require('./probabilities/RTP97%')
const slotMachine = new SlotMachine(probability)
const BUY_FEATURE_BET_MULTIPLIER = 75

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
        buyFeatureOptions: BET_OPTIONS[currencyCode].map(bet => bet * BUY_FEATURE_BET_MULTIPLIER),
        accounts,
        currencyCode,
        balance
    }
}

const makeBet = async ({
    sessionId,
    accountId = 0,
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

    user.accounts[accountId].balance += descriptor.totalCoefficient * bet - finalBet

    await user.save()

    return {
        ...descriptor,
        currencyCode: user.accounts[accountId].currencyCode,
        balance: user.accounts[accountId].balance,
    }
}


module.exports = {
    gameDescription,
    makeBet
}