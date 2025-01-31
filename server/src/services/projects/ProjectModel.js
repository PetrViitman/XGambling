// Projects collection model in DB
const mongoose = require('mongoose')
const { ROLES } = require('../../Constants')

const schema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    visibility: {
        type: Number,
        default: ROLES.ADMIN,
    }
})

module.exports = mongoose.model('Project', schema)