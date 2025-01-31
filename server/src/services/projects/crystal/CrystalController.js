const { ERROR_CODES, BET_OPTIONS, ROLES } = require("../../../Constants");
const { getUserIfCanAffordDeposit, getUser } = require("../../user/UserController");
const { SlotMachine, COEFFICIENTS } = require("./CrystalSlotMachine");
const probability = require('./probabilities/ProbabilityTemplate')
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
        betsOptions: BET_OPTIONS[currencyCode],
        accounts,
        currencyCode,
        balance
    }
}

const makeBet = async ({
    sessionId,
    accountId = 0,
    bet,
    desiredReels,
}) => {
    if (!bet) {
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
        descriptor = await slotMachine.generateSingleGameDescriptor({
            bet,
            desiredReels: user.role >= ROLES.TESTER ? desiredReels : undefined,
        })
    } catch (error) {
        console.log(error)

        return {errorCode: ERROR_CODES.NETWORK.SOMETHING_WENT_WRONG}
    }

    user.accounts[accountId].balance += descriptor.totalCoefficient * bet - bet

    await user.save()

    return {
        ...descriptor,
        currencyCode: user.accounts[accountId].currencyCode,
        balance: user.accounts[accountId].balance,
    }
}

module.exports = {
    gameDescription,
    makeBet,
}