// User collection model in DB
const mongoose = require('mongoose')
const { ROLES } = require('../../Constants')

const accountSchema = new mongoose.Schema({
    name: {
      type: String,
      required: true,
    },
    currencyCode: {
      type: String,
      default: 'FUN',
    },
    balance: {
        type: Number,
        default: 0
    },
})

const schema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    accounts: {
        type: [accountSchema],
        default: [{
            name: 'DEMO ACCOUNT',
            currencyCode: 'FUN',
            balance: '1000',
        }]
    },
    sessionId: {
        type: String,
        required: false
    },
    role: {
        type: Number,
        default: ROLES.CUSTOMER,
    }
}, {timestamps: true})

schema.index({ sessionId: 1, name: 1 })


module.exports = mongoose.model('User', schema)