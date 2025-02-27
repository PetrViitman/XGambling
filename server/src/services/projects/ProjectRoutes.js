const express = require('express')
const router = express.Router()
const projectController = require('./ProjectController')
const {validateSessionPost} = require('../session/SessionRoutes')


router.get('/list', async (request, response) => {
    const sessionId = request.headers['sessionid']
    const {errorCode, projects} = await projectController.getProjects(sessionId)

    if(errorCode) {
        return response.send({errorCode})
    }

    response.send({projects})
})

router.post('/delete', validateSessionPost, async (request, response) => {
    const { name, sessionId } = request.body
    const {error} = await projectController.deleteProject(name, sessionId)

    response.send({result: error ?? 'success'})
})

router.post('/create', validateSessionPost, async (request, response) => {
    const { name, visibility, sessionId } = request.body
    const {error} = await projectController.createProject({name, sessionId, visibility})

    response.send({result: error ?? 'success'})
})

module.exports = router
