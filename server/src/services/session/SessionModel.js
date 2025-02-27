// Session collection model in DB
const mongoose = require('mongoose')

const schema = new mongoose.Schema({
    sessionId: {
        type: String,
        required: true
    },
    expiringDate: {
        type: Number,
        default: Date.now() + 300_000
    }
})

schema.index({ sessionId: 1 })


module.exports = mongoose.model('Session', schema)