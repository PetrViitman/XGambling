const { validateSession } = require("./SessionController")

const sessionValidation = async (request, response, next) => {
    const sessionId =  request.headers['sessionid']
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
    sessionValidation,
    sessionValidation,
}