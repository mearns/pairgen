const {generatePairs} = require('..')
const {parseArgs} = require('../arg-parser')
const graphqlHTTP = require('express-graphql')
const {graphql, buildSchema} = require('graphql')
const GraphQLLong = require('graphql-type-long')
const humanizeDuration = require('humanize-duration')
const fs = require('fs')

function Pair (role1, role2) {
  this._role1 = role1
  this._role2 = role2
}
Pair.prototype.role1 = function () {
  return this._role1
}
Pair.prototype.role2 = function () {
  return this._role2
}
Pair.prototype.tuple = function () {
  return [this._role1, this._role2]
}

function Duration (ms) {
  this._ms = ms
}
Duration.prototype.ms = function () {
  return this._ms
}
Duration.prototype.text = function ({lang, precision}) {
  return humanizeDuration(this._ms, {language: lang, largest: precision})
}

function GqlDate (datetime) {
  this._date = new Date(datetime)
}
GqlDate.prototype.timestamp = function () {
  return parseInt(this._date.getTime() / 1000)
}
GqlDate.prototype.timestampMs = function () {
  return this._date.getTime()
}
GqlDate.prototype.isoString = function () {
  return this._date.toISOString()
}

function Pairings (data) {
  this._data = data
}
Pairings.prototype.pairs = function () {
  return this._data.pairs.map(([a, b]) => new Pair(a, b))
}
Pairings.prototype.rotation = function () {
  return this._data.rotation
}
Pairings.prototype.interval = function () {
  return this._data.interval
}
Pairings.prototype.offset = function () {
  return this._data.offset
}
Pairings.prototype.epoch = function () {
  return new GqlDate(this._data.epoch)
}
Pairings.prototype.date = function () {
  return new GqlDate(this._data.date)
}
Pairings.prototype.period = function () {
  return new Duration(this._data.period.ms)
}
Pairings.prototype.elapsedTime = function () {
  return new Duration(this._data.elapsedTime.ms)
}

const rootValue = {
  pairings: ({members}) => {
    const args = parseArgs(['--', ...members])
    return new Pairings(generatePairs(args.members, Object.assign(
      {},
      args,
      {verbose: true}
    )))
  },
  Long: value => new GraphQLLong(value)
}

// TK: Use mz, make configure...Router return a promise.
const schema = buildSchema(fs.readFileSync('./src/api/schema.graphql', 'utf8'))

function configureGraphqlApiRouter (router) {
  router.use(graphqlHTTP({
    schema,
    rootValue,
    graphiql: true
  }))
}

module.exports = {configureGraphqlApiRouter}
