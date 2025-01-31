module.exports = {
    URI: {
        MONGO: {
            USERS: 'mongodb+srv://ACCESSOR2:qwerty123@test.jvfka.mongodb.net/?retryWrites=true&w=majority&appName=TEST'
        }
    },
    ERROR_CODES: {
        NETWORK: {
            SOMETHING_WENT_WRONG: 1000
        },
        USER: {
            AUTHENTICATION_FAILED: 2000,
            INVALID_CREDENTIALS: 2001,
            NAME_IS_TAKEN: 2003,
            ACCESS_DENIED: 2004,
            USER_NOT_FOUND: 2005,
            NOT_ENOUGH_MONEY: 2006,
            INVALID_ACCOUNT: 2007,
        },
        BET: {
            INVALID_BET_REQUEST: 3000
        }
    },
    ROLES: {
        CUSTOMER: 0,
        TESTER: 1,
        ADMIN: 2,
    },
    BET_OPTIONS: {
        FUN: [10, 20, 30, 50, 100, 1000],
        RUB: [50, 100, 200, 300, 500, 1000],
    }
}