const moment = require('moment')
const timestring = require('timestring')
const yargs = require('yargs')

function configureArgParser (cmdYargs) {
  return cmdYargs
    .positional('member', {
      alias: 'members',
      array: true
    })
    .option('epoch', {
      alias: 'e',
      coerce: getDateCoercer('epoch'),
      default: '1970-01-01',
      describe: 'Specify the date from which rotations are calculated.',
      require: false
    })
    .option('date', {
      alias: 'd',
      coerce: getDateCoercer('date'),
      default: new Date().toISOString(),
      describe: 'The date for which you want to know the pair assignments. Defaults to right now.',
      require: false
    })
    .option('period', {
      alias: 'p',
      coerce: arg => timestring(arg, 'ms'),
      default: '1w',
      describe: 'Specify how long a rotation lasts.',
      require: false
    })
    .option('offset', {
      alias: 'o',
      number: true,
      default: 0,
      description: 'Specify an arbitary offset for the rotation. This is useful if you have skipped some intervals.'
    })
}

const getDateCoercer = (argName) => arg => {
  const m = moment(arg)
  if (!m.isValid()) {
    throw new Error(`The provided ${argName} is not parseable as a date`)
  }
  return m.toDate()
}

const PARSER = yargs()
  .command('* member [members...]', '', configureArgParser)

function parseArgs (argv) {
  return PARSER.parse(argv)
}

module.exports = {configureArgParser, parseArgs}
