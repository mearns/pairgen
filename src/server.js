const express = require('express')
const morgan = require('morgan')
const {generatePairs} = require('.')
const {applyDefaults} = require('./arg-parser')
const StatusCodes = require('http-status-codes')

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
  } else if (typeof members === 'string') {
    return members.split(',').map(member => member.trim())
  }
  return members
}

function configureApiRouter (router) {
  router.get('/pairs', (request, response) => {
    try {
      const members = parseMembers(request.query.members)
      const opts = applyDefaults({})
      response.json(generatePairs(members, opts))
    } catch (e) {
      response.status(StatusCodes.BAD_REQUEST).json({error: e.message})
    }
  })
}

module.exports = {runServer}
