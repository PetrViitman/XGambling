const express = require('express')
const router = express.Router()
const projectController = require('./ProjectController')
const {validateSession} = require('../Shared')


router.get('/list', async (request, response) => {
    const {errorCode, projects} = await projectController.getProjects(request.session.id)

    if(errorCode) {
        return response.send({errorCode})
    }

    response.send({projects})
})

router.post('/delete', validateSession, async (request, response) => {
    const { name } = request.body
    const {error} = await projectController.deleteProject(name, request.session.id)

    response.send({result: error ?? 'success'})
})

router.post('/create', validateSession, async (request, response) => {
    const { name, visibility } = request.body
    const {error} = await projectController.createProject({name, sessionId: request.session.id, visibility})

    response.send({result: error ?? 'success'})
})

module.exports = router
