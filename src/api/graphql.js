const {generatePairs} = require('..')
const {parseArgs} = require('../arg-parser')
var graphqlHTTP = require('express-graphql')
var { buildSchema } = require('graphql')

// Construct a schema, using GraphQL schema language
const schema = buildSchema(`
  type Pairings {
    pairs: [Pair!]!
    rotation: Int!
    interval: Int!
  }

  type Pair {
    role1: String!
    role2: String!
    tuple: [String!]!
  }

  type Query {
    pairs(members: [String]!): Pairings!
  }
`)

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

// The root provides a resolver function for each API endpoint
const rootValue = {
  pairs: ({members}) => {
    const args = parseArgs(['--', ...members])
    return new Pairings(generatePairs(args.members, Object.assign(
      {},
      args,
      {verbose: true}
    )))
  }
}

function configureGraphqlApiRouter (router) {
  router.use(graphqlHTTP({
    schema,
    rootValue,
    graphiql: true
  }))
}

module.exports = {configureGraphqlApiRouter}
