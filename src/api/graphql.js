const {generatePairs} = require('..')
const {parseArgs} = require('../arg-parser')
var graphqlHTTP = require('express-graphql')
var { buildSchema } = require('graphql')

// Construct a schema, using GraphQL schema language
const schema = buildSchema(`
  type Pairings {
    pairs: [Pair!]!
  }

  type Pair {
    role1: String!
    role2: String!
  }

  type Query {
    pairs(members: [String]!): Pairings!
  }
`)

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

function Pairings (pairs) {
  this._pairs = pairs
}
Pairings.prototype.pairs = function () {
  return this._pairs
}

// The root provides a resolver function for each API endpoint
const rootValue = {
  pairs: ({members}) => {
    const args = parseArgs(['--', ...members])
    const rawPairs = generatePairs(args.members, args)
    return new Pairings(rawPairs.map(([a, b]) => new Pair(a, b)))
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
