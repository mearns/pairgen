const {generatePairs} = require('.')
const {runServer} = require('./server')
const {configureArgParser} = require('./arg-parser')
const packageData = require('../package.json')
const yargs = require('yargs')
const humanizeDuration = require('humanize-duration')

function main (argv, scriptName) {
  getArgParser(scriptName || packageData.name)(argv, {
    cli: cliHandler,
    server: serverHandler
  })
}

function cliHandler (args) {
  if (args.prologue) {
    const prologue = args.prologue
      .replace('%d{x}', args.date.toLocaleDateString())
      .replace('%d{X}', args.date.toLocaleTimeString())
      .replace('%d{c}', args.date.toLocaleString())
      .replace('%p', humanizeDuration(args.period))
      .replace('%m', args.members.join(', '))
    console.log(prologue)
    console.log()
  }
  return generatePairs(args.members, args)
    .forEach(pair => {
      const str = args['format-string'].replace('%1', pair[0]).replace('%2', pair[1])
      console.log(str)
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
