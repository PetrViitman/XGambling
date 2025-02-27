const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')
const UserModel = require('./UserModel')
const {URI, ROLES, ERROR_CODES} = require('../../Constants')
const { deleteSession, allocateNewSession } = require('../session/SessionController')

const connectToDatabase = async () => {
    let databaseResponse
    await mongoose
        .connect(URI.MONGO.USERS)
        .then((result) => {databaseResponse = result})
        .catch((error) => {databaseResponse = {error}})

    return databaseResponse
}

const getUser = async ({name, sessionId}) => { 
    if(!sessionId && !name) {
        return {errorCode: ERROR_CODES.USER.INVALID_CREDENTIALS}
    }

    let result
    await UserModel
        .findOne(name ? {name} : {sessionId})
        .exec()
        .then(user => 
        {
            result =  user ?? {errorCode: ERROR_CODES.USER.AUTHENTICATION_FAILED}
        })
        .catch(_ => {
            result = {errorCode: ERROR_CODES.NETWORK.SOMETHING_WENT_WRONG}
        })

    return result
}

const getUserIfCanAffordDeposit = async ({sessionId, deposit, accountId = 0}) => {
    const user = await getUser({sessionId})

    if (user.errorCode) {
        return {errorCode:  user.errorCode}
    }

    if (!user.name) {
        return {errorCode: ERROR_CODES.USER.USER_NOT_FOUND}
    }

    if (user.accounts[accountId].balance + deposit < 0) {
        return {errorCode: ERROR_CODES.USER.NOT_ENOUGH_MONEY}
    }

    return user
}

const saveUser = async (user) => {
    let result
    await user
        .save()
        .then((user) => {
            result = user ?? {}
        })
        .catch(_ => {
            result = {errorCode: ERROR_CODES.NETWORK.SOMETHING_WENT_WRONG}
        })

    return result
}

const signUp = async (username, password) => {
    const {error, name, sessionId} = await getUser({name: username})

    if(error) {
        return {error}
    }

    if(name) {
        return {errorCode: ERROR_CODES.USER.NAME_IS_TAKEN}
    }

    await deleteSession(sessionId)

    const hashedPassword = await bcrypt.hash(password, 10)

    return saveUser(
        new UserModel({
            name: username,
            password: hashedPassword,
        })
    )
}

const logIn = async ({name, password}) => {
    const user = await getUser({name})

    if(!user.password) {
        return {errorCode: ERROR_CODES.USER.INVALID_CREDENTIALS}
    }

    if(user.errorCode) {
        return {error}
    }

    const isPasswordValid = await bcrypt.compare(password, user.password)

    if (isPasswordValid) {
        if(user.sessionId) {
            await deleteSession(user.sessionId)
        }

        const { sessionId } = await allocateNewSession()

        user.sessionId = sessionId
        await saveUser(user)

        return {
            sessionId
        }
    }

    return {errorCode: ERROR_CODES.USER.INVALID_CREDENTIALS}
}

const deposit = async ({
    username,
    accountName,
    sessionId,
    deposit = 0
}) => {
    const adminUser = await getUser({sessionId})

    if(adminUser.role < ROLES.ADMIN) {
        return {errorCode: adminUser.errorCode ?? ERROR_CODES.USER.ACCESS_DENIED}
    }

    const targetUser = username
        ? await getUser({name: username})
        : adminUser

    const {errorCode, name, accounts} = targetUser
    if(errorCode) {
        return {errorCode}
    }
    
    if(!name) {
        return {errorCode: ERROR_CODES.USER.USER_NOT_FOUND}
    }

    const targetAccount = accounts.find(({name}) => name === accountName)

    if(!targetAccount) {
        return {errorCode: ERROR_CODES.USER.INVALID_ACCOUNT}
    }

    const finalBalance = targetAccount.balance + deposit
    if (finalBalance < 0) {
        return {errorCode: ERROR_CODES.USER.NOT_ENOUGH_MONEY}
    }

    targetAccount.balance = finalBalance

    return saveUser(targetUser)
}

const addAccount = async ({
    username,
    accountName,
    sessionId,
    deposit = 0,
    currencyCode = 'FUN'
}) => {
    const adminUser = await getUser({sessionId})

    if(adminUser.role < ROLES.ADMIN) {
        return {errorCode: adminUser.errorCode ?? ERROR_CODES.USER.ACCESS_DENIED}
    }

    const targetUser = username
        ? await getUser({name: username})
        : adminUser

    const {errorCode, name, accounts} = targetUser
    if(errorCode) {
        return {errorCode}
    }
    
    if(!name) {
        return {errorCode: ERROR_CODES.USER.USER_NOT_FOUND}
    }

    if (
        !accountName
        || accounts.find(({name}) => name === accountName)
    ) {
        return {errorCode: ERROR_CODES.USER.INVALID_ACCOUNT}
    }

    accounts.push({
        name: accountName,
        balance: deposit,
        currencyCode,
    })

    return saveUser(targetUser)
}

const getBalance = async (sessionId) => {
    const user = await getUser({sessionId})

    if(user.errorCode) {
        return {errorCode:  user.errorCode}
    }

    if(!user.name) {
        return {errorCode: ERROR_CODES.USER.USER_NOT_FOUND}
    }

    return {balance: user.balance}
}

const logOut = async (sessionId) => {
    const user = await getUser({sessionId})

    if(user.errorCode) {
        return {errorCode:  user.errorCode}
    }

    if(!user.name) {
        return {errorCode: ERROR_CODES.USER.USER_NOT_FOUND}
    }

    await deleteSession(user.sessionId)

    user.sessionId = undefined

    return saveUser(user)
}

// DEBUG...
const validateAdminPassword = (password) => {
    if (password !== 'admin') return ERROR_CODES.USER.ACCESS_DENIED
}

const deleteUser = async (name, adminPassword) => {
    const error = validateAdminPassword(adminPassword)
    if(error) return {errorCode: ERROR_CODES.NETWORK.SOMETHING_WENT_WRONG}


    let result
    await UserModel
        .findOneAndDelete({name})
        .exec()
        .then(() => {
            result = {result: 'success'}
        })
        .catch(error => {
            result = {error}
        })

    return result
}
// ...DEBUG

module.exports = {
    connectToDatabase,
    getUser,
    getUserIfCanAffordDeposit,
    saveUser,
    addAccount,
    deposit,
    getBalance,
    signUp,
    logIn,
    logOut,
    deleteUser,
}
