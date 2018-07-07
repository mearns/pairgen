var graphqlHTTP = require('express-graphql')
var { buildSchema } = require('graphql')

// Construct a schema, using GraphQL schema language
const schema = buildSchema(`
  type Query {
    hello: String
  }
`)

// The root provides a resolver function for each API endpoint
const rootValue = {
  hello: () => 'Hello world!'
}

function configureGraphqlApiRouter (router) {
  router.use(graphqlHTTP({
    schema,
    rootValue,
    graphiql: true
  }))
}

module.exports = {configureGraphqlApiRouter}
