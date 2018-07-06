const express = require('express')
const morgan = require('morgan')
const {generatePairs} = require('.')
const {parseArgs} = require('./arg-parser')
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
      const argv = []
      if (request.query.period) {
        argv.push('--period', request.query.period)
      }
      if (request.query.offset) {
        argv.push('--offset', request.query.offset)
      }
      if (request.query.epoch) {
        argv.push('--epoch', request.query.epoch)
      }
      if (request.query.date) {
        argv.push('--date', request.query.date)
      }
      const args = parseArgs([...argv, '--', ...members])
      if (request.query.verbose && request.query.verbose.toLowerCase() == 'true') {
        args.verbose = true
      }
      response.json(generatePairs(args.members, args))
    } catch (e) {
      response.status(StatusCodes.BAD_REQUEST).json({error: e.message})
    }
  })
}

module.exports = {runServer}
