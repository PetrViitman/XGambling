
const express = require('express')
const cors = require('cors')
const {connectToDatabase} = require('./services/user/UserController')
const https = require('https')
const fs = require('fs')
const app = express()
const {sessionStorage} = require('./services/Shared')
const session = require('express-session')


const localDomains = Array(50).fill(0).map((_, i) => 'https://localhost:' + (49990 + i))

app.use(cors({
    origin: localDomains,
    credentials: true
}))

app.use(express.json())
app.use(express.urlencoded({extended: true}))
app.use(session({
    secret: 'test casino secret',
    resave: false,
    saveUninitialized: false,
    store: sessionStorage,
    cookie: {
        httpOnly: true,
        secure: true,
        maxAge: 1000 * 60 * 60 * 24,
        sameSite: 'None'
    },
}))


app.use('/user', require('./services/user/UserRoutes'))
app.use('/project', require('./services/projects/ProjectRoutes'))
app.use('/wildHeistShowdown', require('./services/projects/wildHeistShowdown/WildHeistShowdownRoutes'))
app.use('/bookOfX', require('./services/projects/bookOfX/BookOfXRoutes'))
app.use('/sharkWash', require('./services/projects/sharkWash/SharkWashRoutes'))
app.use('/richesOfMidgard', require('./services/projects/richesOfMidgard/RichesOfMidgardRoutes'))
app.use('/crystal', require('./services/projects/crystal/CrystalRoutes'))
app.use('/corsairsGold', require('./services/projects/corsairsGold/CorsairsGoldRoutes'))

const startServices = async () => {
    await connectToDatabase()
    console.log('connected...')
}

startServices()

const options = {
    key: fs.readFileSync('../.certificate/key.pem'),
    cert: fs.readFileSync('../.certificate/cert.pem'),
}

const httpsServer = https.createServer(options, app)
httpsServer.listen(40000)


