const {encodeJSStringLiteral, CodeGenerator} = require('../loader-utils')

function transpileGraphQLSchema (content, {sourcePath, destPath}) {
  const gen = new CodeGenerator({sourcePath, destPath})
  gen.addLine('const {buildSchema} = require(\'graphql\')')
  gen.addLine('module.exports = buildSchema(')
  gen.addText(encodeJSStringLiteral(content), {
    original: {line: 1, column: 0},
    generatedColumn: 1
  })
  gen.addLine(')')
  return gen.generateCode({sourceMap: 'inline'})
}

module.exports = {
  name: 'graphql schema loader',
  applies: filename => Boolean(filename.match(/\.graphql$/)),
  transpile: transpileGraphQLSchema
}
