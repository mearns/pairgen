const OUTPUT_DIR = 'dest'

const LOADERS = [
  require('./loaders/graphql'),
  {
    name: 'JSON loader',
    applies: filename => Boolean(filename.match(/\.json\.js$/)),
    transpile: content => `module.exports = ${content}`
  }
]

const path = require('path')
const walk = require('fs-walk')
const fs = require('mz/fs')
const {copy: copyFile, mkdirs} = require('fs-extra')

function main (rootDirs) {
  mkdirs(OUTPUT_DIR)
    .then(() => {
      rootDirs.forEach(rootDir => {
        fs.lstat(rootDir)
          .then(stats => {
            if (stats.isDirectory()) {
              walk.walk(
                rootDir,
                (baseDir, filename, stat, next) => {
                  transpileFile(baseDir, filename)
                    .then(next)
                    .catch(error => {
                      console.error(error)
                      process.exitCode = 1
                    })
                },
                error => {
                  if (error) {
                    console.error(error)
                    process.exitCode = 1
                  }
                }
              )
            } else {
              transpileFile('', rootDir)
                .catch(error => {
                  console.error(error)
                  process.exitCode = 1
                })
            }
          })
      })
    })
}

function transpileFile (baseDir, filename) {
  const srcPath = path.join(baseDir, filename)
  const loader = getLoader(baseDir, filename)
  const destPath = getDestPath(baseDir, filename)
  if (loader) {
    return fs.readFile(srcPath, 'utf-8')
      .then(content => loader.transpile(content, {sourcePath: `../../../${srcPath}`, destPath}))
      .then(output => fs.writeFile(destPath, output))
      .then(() => {
        console.log(`${srcPath}: [${loader.name}]`)
      })
  } else {
    return copyFile(srcPath, getDestPath(baseDir, filename))
      .then(() => {
        console.log(`${srcPath}: (copied)`)
      })
  }
}

function getDestPath (baseDir, filename) {
  return path.join(OUTPUT_DIR, baseDir, filename)
}

function getLoader (baseDir, filename) {
  return LOADERS.find(loaderSpec => loaderSpec.applies(filename, baseDir))
}

main(process.argv.slice(2))
