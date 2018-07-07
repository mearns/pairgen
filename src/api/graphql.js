const {generatePairs} = require('..')
const {parseArgs} = require('../arg-parser')
const graphqlHTTP = require('express-graphql')
const graphql = require('graphql')
const GraphQLLong = require('graphql-type-long')
const humanizeDuration = require('humanize-duration')

const PairType = new graphql.GraphQLObjectType({
  name: 'Pair',
  fields: {
    role1: { type: graphql.GraphQLString },
    role2: { type: graphql.GraphQLString },
    tuple: { type: graphql.GraphQLList(graphql.GraphQLString) }
  }
})

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

const DurationType = new graphql.GraphQLObjectType({
  name: 'Duration',
  fields: {
    ms: {
      type: GraphQLLong
    },
    text: {
      type: graphql.GraphQLString,
      args: {
        lang: { type: graphql.GraphQLString }
      }
    }
  }
})

function Duration (ms) {
  this._ms = ms
}
Duration.prototype.ms = function () {
  return this._ms
}
Duration.prototype.text = function ({lang}) {
  return humanizeDuration(this._ms, {language: lang})
}

const DateType = new graphql.GraphQLObjectType({
  name: 'Date',
  fields: {
    timestamp: {
      type: graphql.GraphQLInt
    },
    timestampMs: {
      type: GraphQLLong
    },
    isoString: {
      type: graphql.GraphQLString
    }
  }
})

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

const PairingsType = new graphql.GraphQLObjectType({
  name: 'Pairings',
  fields: {
    pairs: { type: graphql.GraphQLList(PairType) },
    rotation: { type: graphql.GraphQLInt },
    interval: { type: graphql.GraphQLInt },
    offset: { type: graphql.GraphQLInt },
    epoch: { type: DateType },
    date: { type: DateType },
    period: { type: DurationType },
    elapsedTime: { type: DurationType }
  }
})

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

const QueryType = new graphql.GraphQLObjectType({
  name: 'Query',
  fields: {
    pairings: {
      type: PairingsType,
      args: {
        members: { type: graphql.GraphQLList(graphql.GraphQLString) }
      },
      resolve: (_, {members}) => {
        const args = parseArgs(['--', ...members])
        return new Pairings(generatePairs(args.members, Object.assign(
          {},
          args,
          {verbose: true}
        )))
      }
    }
  }
})

const schema = new graphql.GraphQLSchema({query: QueryType})

function configureGraphqlApiRouter (router) {
  router.use(graphqlHTTP({
    schema,
    graphiql: true
  }))
}

module.exports = {configureGraphqlApiRouter}
