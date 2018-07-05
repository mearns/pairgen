const moment = require('moment')
const timestring = require('timestring')

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

function DummyParser () {
  this.options = {}
}

DummyParser.prototype.positional = function () {
  return this
}
DummyParser.prototype.option = function (name, def) {
  this.options[name] = def
  return this
}
DummyParser.prototype.applyDefaults = function (args) {
  const parsed = {}
  Object.keys(this.options).forEach(opt => {
    if (args.hasOwnProperty(opt)) {
      parsed[opt] = args[opt]
    } else {
      const optDef = this.options[opt]
      const coercer = optDef.coerce || (x => x)
      const defValue = optDef.default
      parsed[opt] = coercer(defValue)
    }
  })
  return parsed
}

const DUMMY_PARSER = new DummyParser()
configureArgParser(DUMMY_PARSER)

function applyDefaults (opts) {
  return DUMMY_PARSER.applyDefaults(opts)
}

module.exports = {configureArgParser, applyDefaults}
