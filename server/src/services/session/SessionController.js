const crypto = require("crypto")
const { ERROR_CODES } = require("../../Constants")
const SessionModel = require("./SessionModel")

const getSession = async sessionId => {
    if(!sessionId) {
        return {errorCode: ERROR_CODES.USER.INVALID_CREDENTIALS}
    }

    let result
    await SessionModel
        .findOne({sessionId})
        .exec()
        .then(session => 
        {
            result = session ?? {errorCode: ERROR_CODES.USER.AUTHENTICATION_FAILED}
        })
        .catch(_ => {
            result = {errorCode: ERROR_CODES.NETWORK.SOMETHING_WENT_WRONG}
        })

    return result
}

const validateSession = async sessionId => {
    const {
        errorCode,
        expiringDate
    } = await getSession(sessionId)

    if (errorCode) return {errorCode}

    if (Date.now() > expiringDate) {
        await deleteSession(sessionId)

        return {errorCode: ERROR_CODES.USER.SESSION_EXPIRED}
    }

    return {}
}

const deleteSession = async sessionId => {
    let result
    await SessionModel
        .findOneAndDelete({sessionId})
        .exec()
        .then(() => {
            result = {result: 'success'}
        })
        .catch(_ => {
            result = {errorCode: ERROR_CODES.NETWORK.SOMETHING_WENT_WRONG}
        })

    return result
}

const allocateNewSession = async (expiringDate = Date.now() + 3_600_000) => {
    const sessionId = crypto.randomBytes(32).toString('hex')
    const session = new SessionModel({sessionId, expiringDate})

    let result

    await session
        .save()
        .then((session) => {
            result = session ?? {}
        })
        .catch(_ => {
            result = {errorCode: ERROR_CODES.NETWORK.SOMETHING_WENT_WRONG}
        })

    return result
}

module.exports = {
    allocateNewSession,
    getSession,
    validateSession,
    deleteSession
}
