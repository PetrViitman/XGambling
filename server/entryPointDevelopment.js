
const express = require('express')
const cors = require('cors')
const {connectToDatabase, getUser} = require('./src/services/user/UserController')
const https = require('https')
const fs = require('fs')
const app = express()
const {sessionStorage} = require('./src/services/Shared')
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


app.use('/user', require('./src/services/user/UserRoutes'))
app.use('/project', require('./src/services/projects/ProjectRoutes'))
app.use('/wildHeistShowdown', require('./src/services/projects/wildHeistShowdown/WildHeistShowdownRoutes'))
app.use('/bookOfX', require('./src/services/projects/bookOfX/BookOfXRoutes'))
app.use('/sharkWash', require('./src/services/projects/sharkWash/SharkWashRoutes'))
app.use('/richesOfMidgard', require('./src/services/projects/richesOfMidgard/RichesOfMidgardRoutes'))
app.use('/crystal', require('./src/services/projects/crystal/CrystalRoutes'))

const startServices = async () => {
    await connectToDatabase()
    console.log('connected...')
}

startServices()

const options = {
    key: fs.readFileSync('../.certificate/key.pem'),
    cert: fs.readFileSync('../.certificate/cert.pem'),
}



const { getAllProjects } = require('./src/services/projects/ProjectController');
const path = require('path');
app.set('view engine', 'ejs')
app.set('views', './statics/.templates')


getAllProjects().then(projects => {
    projects.forEach(({name, visibility}) => {
        const serviceURL = 'https://localhost:40000/'
        try {
            const projectPath = '/' + name.replaceAll(' ', '-')
            const scriptContent = fs.readFileSync( './statics/' + name + '/index.js', 'utf-8')

            let cssContent = ''
            try {
                cssContent = fs.readFileSync( './statics/' + name + '/index-production.css', 'utf-8')
            } catch (_) {}

            app.get(projectPath, async (req, res) => {
                const {name} = await getUser({sessionId: req.session?.id})
                
                if(!name) {

                    res.render(
                        '.login', {
                            title: 'LOG IN',
                            serviceURL,
                            script: scriptContent
                        })
                } else {
                    res.render(
                        '.index', {
                            title: name,
                            serviceURL,
                            css: cssContent,
                            script: scriptContent
                        })
                }
            })

            app.use(
                projectPath,
                express.static(
                    'statics/' + name,
                    {
                        dotfiles: "deny",
                        index: false,
                        maxAge: "1s"
                    }
                )
            )

            app.use(
                '/fonts',
                express.static(
                    'statics/' + name + '/fonts',
                    {
                        dotfiles: "deny",
                        index: false,
                        maxAge: "1s"
                    }
                )
            )
        } catch (error) {
            console.log(name + ' static files are not found')
        }
    })
})



const httpsServer = https.createServer(options, app)
httpsServer.listen(40000)

