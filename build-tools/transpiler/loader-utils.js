const {SourceMapGenerator} = require('source-map')

function encodeJSStringLiteral (content) {
  return `\`${content.replace(/\\/g, '\\\\').replace(/`/g, '\\`')}\``
}

function CodeGenerator ({sourcePath, destPath}) {
  this._sourcePath = sourcePath
  this._sourceMapGenerator = new SourceMapGenerator({file: destPath})
  this._lines = []
}
CodeGenerator.prototype.addLine = function (line, mappings = null) {
  this._lines.push(line)
  if (mappings) {
    const {
      original: {
        line: oline,
        column: ocolumn = 0
      },
      generatedColumn: gcolumn = 0
    } = mappings
    this._sourceMapGenerator.addMapping({
      original: {
        line: oline,
        column: ocolumn
      },
      generated: {
        line: this._lines.length + 1, // 1 based, but also add a line for requiring source-map-support
        column: gcolumn
      },
      source: this._sourcePath
    })
  }
}
CodeGenerator.prototype.addText = function (text, mappings = null) {
  const {
    original: {
      line: oline,
      column: ocolumn = 0
    },
    generatedColumn: gcolumn = 0
  } = mappings
  const lines = text.split(/\r?\n/)
  lines.forEach((line, idx) => this.addLine(line, {
    original: {
      line: oline + idx,
      column: idx === 0 ? ocolumn : 0
    },
    generatedColumn: idx === 0 ? gcolumn : 0
  }))
}
CodeGenerator.prototype.generateCode = function ({sourceMap = false} = {}) {
  const lines = [...this._lines]
  if (sourceMap === 'inline') {
    lines.splice(0, 0, 'require(\'source-map-support\').install()')
    const sourceMapString = this._sourceMapGenerator.toString()
    const encodedSourceMap = Buffer.from(sourceMapString).toString('base64')
    lines.push('', `//# sourceMappingURL=data:application/json;charset=utf-8;base64,${encodedSourceMap}`)
  }
  return lines.join('\n')
}

module.exports = {
  encodeJSStringLiteral,
  CodeGenerator
}
