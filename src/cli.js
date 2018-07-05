const {generatePairs} = require('.')
const {runServer} = require('./server')
const {configureArgParser} = require('./arg-parser')
const packageData = require('../package.json')
const yargs = require('yargs')

function main (argv, scriptName) {
  getArgParser(scriptName || packageData.name)(argv, {
    cli: cliHandler,
    server: serverHandler
  })
}

function cliHandler (args) {
  return generatePairs(args.members, args)
    .forEach(pair => {
      console.log(`${pair[0]} -- ${pair[1]}`)
    })
}

function serverHandler (args) {
  runServer(args.host, args.port)
}

function getArgParser (scriptName) {
  const y = yargs
    .scriptName(scriptName)
    .command('cli member [members...]', 'Run the CLI pair-generator and exit', configureArgParser)
    .command('server', 'Run the HTTP service in the foreground', cmdYargs => {
      return cmdYargs
        .option('port', {
          default: 8080,
          number: true,
          description: 'The port to bind to.',
          require: false
        })
        .option('host', {
          default: 'localhost',
          string: true,
          description: 'The host to bind to.',
          require: false
        })
    }
    )
    .demandCommand(1, 1)
    .fail((msg, error) => {
      if (error) {
        throw error
      }
      throw new Error(msg)
    })
    .strict()

  return (argv, handlers) => {
    const args = y.parse(argv)
    const handler = handlers[args._]
    return handler(args)
  }
}

module.exports = {main}
