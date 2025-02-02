const mongoose = require('mongoose')
const UserController = require('../user/UserController')
const ProjectModel = require('./ProjectModel')
const { ERROR_CODES, ROLES } = require('../../Constants')

const saveProject = async (project) => {
    let result
    await project
        .save()
        .then((project) => {
            result = project ?? {}
        })
        .catch(error => {
            project = {error}

        })

    return result
}

const getProjects = async (sessionId) => {
    const user = await UserController.getUser({sessionId})

    if(user.errorCode) {
        return {errorCode: user.errorCode}
    }

    if(user.role === undefined) {
        return {errorCode: ERROR_CODES.USER.ACCESS_DENIED}
    }

    let result
    await ProjectModel
            .find({visibility: {$lte: user.role}})
            .exec()
            .then(projects => result = {projects: projects ?? []})
            .catch(_ => result = {errorCode: ERROR_CODES.NETWORK.SOMETHING_WENT_WRONG})
    
    return result
}

const createProject = async ({sessionId, name, visibility = ['admin']}) => {
    const user = await UserController.getUser({sessionId})

    if(user.errorCode) {
        return {error}
    }

    if(user.role < ROLES.ADMIN) {
        return {errorCode: ERROR_CODES.USER.ACCESS_DENIED}
    }

    return saveProject(
        new ProjectModel({
            name,
            visibility
        }))
}

const deleteProject = async (name, sessionId) => {
    const user = await UserController.getUser({sessionId})

    if(user.errorCode) {
        return {error}
    }

    if(user.role < ROLES.ADMIN) {
        return {errorCode: ERROR_CODES.USER.ACCESS_DENIED}
    }

     let result
    await ProjectModel
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

getAllProjects = async () => {
    return ProjectModel.find({})
}

module.exports = {
    getProjects,
    createProject,
    deleteProject,
    getAllProjects
}
