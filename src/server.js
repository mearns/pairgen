const express = require('express')
const morgan = require('morgan')
const generatePairs = require('.').generatePairs

function runServer (host, port) {
    const app = express()

    app.use(morgan('common'))
    addApi(app)

    app.listen(port, host, error => {
        if (error) {
            throw error
        }
        console.log(`Listening on ${host}:${port}...`)
    })
}

function addApi (app) {
    const router = express.Router()
    configureApiRouter(router)
    app.use('/api/rest/v1/', router)
}

function parseMembers (members) {
    if (!members) {
        return []
    }
    else if (typeof members === 'string') {
        return members.split(',').map(member => member.trim())
    }
    return members
}

function configureApiRouter (router) {
    router.get('/pairs', (request, response) => {
        const members = parseMembers(request.query.members)
        const pairs = generatePairs(members, {})
        response.json(pairs)
    })
}

module.exports = {runServer}