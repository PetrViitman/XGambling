// Book Of X risks collection model in DB
const mongoose = require('mongoose')

const schema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    pendingPayout: {
        type: Number,
        required: true
    },
    accountId: {
        type: Number,
        required: true
    },
})

schema.index({ name: 1 })


module.exports = mongoose.model('Book Of X risk', schema)