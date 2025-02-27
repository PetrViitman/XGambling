const { validateSession } = require("./SessionController")

const validateSessionGet = async (request, response, next) => {
    const sessionId =  request.headers['sessionid']
    console.log('headers: ', request.headers)
    const {errorCode} = await validateSession(sessionId)

    if (errorCode) {
        response.send({
            errorCode
        })
    } else {
        next()
    }
}

const validateSessionPost = async (request, response, next) => {
    const sessionId =  request.body.sessionId
    const {errorCode} = await validateSession(sessionId)

    if (errorCode) {
        response.send({
            errorCode
        })
    } else {
        next()
    }
}

module.exports = {
    validateSessionGet,
    validateSessionPost,
}