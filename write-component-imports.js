import path from 'path'
import fs from 'fs'

const getComponentPaths = root => {
  return new Promise((resolve, reject) => {
    const dirPath = path.resolve(root)

    fs.readdir(dirPath, (err, files) => {
      if (err) reject(err)
      else resolve(files.filter(name => name.includes('.vue') && name.includes('/W')).map(name => path.join(dirPath, name)))
    })
  })
}

const getImports = (list) => {
  const imports = list.map(name => `export {default as ${ name.slice(name.indexOf('W'), -4) }} from '@${ name.substring(name.indexOf('/components')) }'`)

  return imports.join('\n')
}

const run = async () => {
  fs.readdir('src/components', (err, files) => console.log(files))

  console.log('Successfully written')
}

run()
