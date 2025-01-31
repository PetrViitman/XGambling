const { ERROR_CODES, URI } = require("../Constants")
const session = require('express-session')
const MongoDBSession = require('connect-mongodb-session')(session)
const sessionStorage = new MongoDBSession({
    uri: URI.MONGO.USERS,
    collection: 'sessions'
})


const deleteSession = (sessionId) => {
    if(!sessionId) return
    
    return sessionStorage.destroy(sessionId, (err) => {
        if (err) {
          console.error('Ошибка удаления старой сессии:', err);
        }
      });
}

const validateSession = (request, response, next) => {
    if (request.session.isAuth) {
        next()
    } else {
        response.send({
            errorCode: ERROR_CODES.USER.AUTHENTICATION_FAILED
        })
    }
}

module.exports = {
    validateSession,
    deleteSession,
    sessionStorage
}