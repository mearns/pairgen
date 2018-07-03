const generatePairs = require('.').generatePairs
const yargs = require('yargs')
const moment = require('moment')
const timestring = require('timestring')
const pick = require('lodash.pick')
const package = require('../package.json')
const runServer = require('./server').runServer
const defaults = require('./defaults')

function main (argv, scriptName) {
    argParser(scriptName || package.name).parse(argv)
}

function cliHandler (args) {
    return generatePairs(args.members, pick(args, ['epoch', 'period', 'date', 'offset']))
        .forEach(pair => {
            console.log(`${pair[0]} -- ${pair[1]}`)
        })
}

function serverHandler (args) {
    runServer(args.host, args.port)
}

const coerceDate = (argName) => arg => {
    const m = moment(arg)
    if (!m.isValid()) {
        throw new Error("The provided ${argName} is not parseable as a date")
    }
    return m.toDate()
}

const argParser = (scriptName) => yargs
    .scriptName(scriptName)
    .command('cli member [members...]', 'Run the CLI pair-generator and exit', cmdYargs => {
        return cmdYargs
            .positional('member', {
                alias: 'members',
                array: true
            })
            .option('epoch', {
                alias: 'e',
                coerce: coerceDate('epoch'),
                default: defaults.epoch.parseable(),
                describe: 'Specify the date from which rotations are calculated.',
                require: false
            })
            .option('date', {
                aliad: 'd',
                coerce: coerceDate('date'),
                default: defaults.date.parseable(),
                describe: 'The date for which you want to know the pair assignments. Defaults to right now.',
                require: false
            })
            .option('period', {
                alias: 'p',
                coerce: arg => timestring(arg, 'ms'),
                default: defaults.period.parseable(),
                describe: 'Specify how long a rotation lasts.',
                require: false
            })
            .option('offset', {
                alias: 'o',
                number: true,
                default: defaults.period.parseable(),
                description: 'Specify an arbitary offset for the rotation. This is useful if you have skipped some intervals.'
            })
        },
        cliHandler
    )
    .command('server [address]', 'Run the HTTP service in the foreground', cmdYargs => {
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
        },
        serverHandler
    )
    .demandCommand(1, 1)
    .strict()

module.exports = {main}
