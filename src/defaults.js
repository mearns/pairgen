const moment = require('moment')
const timestring = require('timestring')

module.exports = {
    epoch: {
        parseable: () => '1970-01-01',
        value: () => moment('1970-01-01').toDate()
    },
    date: {
        parseable: () => new Date().toISOString(),
        value: () => new Date()
    },
    period: {
        parseable: () => '1w',
        value: () => timestring('1w')
    },
    offset: {
        parseable: () => '0',
        value: () => 0
    }
}