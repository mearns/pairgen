const generatePairs = require('.').generatePairs
const yargs = require('yargs')
const moment = require('moment')
const timestring = require('timestring')
const pick = require('lodash.pick')

function main (argv) {
    const args = argParser.parse(argv)
    generatePairs(args.members, pick(args, ['epoch', 'period', 'date', 'offset']))
        .forEach(pair => {
            console.log(`${pair[0]} -- ${pair[1]}`)
        })
}

const coerceDate = (argName) => arg => {
    const m = moment(arg)
    if (!m.isValid()) {
        throw new Error("The provided ${argName} is not parseable as a date")
    }
    return m.toDate()
}

const argParser = yargs
    .command('* [members...]')
    .option('epoch', {
        alias: 'e',
        coerce: coerceDate('epoch'),
        default: '1970-01-01',
        describe: 'Specify the date from which rotations are calculated.',
        require: false
    })
    .option('date', {
        aliad: 'd',
        coerce: coerceDate('date'),
        default: '1970-01-01',
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
    .strict()

module.exports = {main}
