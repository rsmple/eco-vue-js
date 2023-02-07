import path from 'path'
import fs from 'fs'

const getIconPaths = root => {
  return new Promise((resolve, reject) => {
    const dirPath = path.resolve(root)

    fs.readdir(dirPath, (err, files) => {
      if (err) reject(err)
      else resolve(files.filter(name => name.includes('.svg')).map(name => path.join(dirPath, name)))
    })
  })
}

const getImports = (list) => {
  const imports = list.map(name => `export {default as ${ name.slice(name.indexOf('Icon'), -4) }} from '@${ name.substring(name.indexOf('/assets')) }?component'`)

  return imports.join('\n')
}

const writeDefault = async () => {
  const imports = getImports(await getIconPaths('src/assets/icons/default'))

  return new Promise(resolve => {
    fs.writeFile('src/utils/iconsDefault.ts', imports, resolve)
  })
}

const writeSax = async () => {
  const imports = getImports(await getIconPaths('src/assets/icons/sax'))

  return new Promise(resolve => {
    fs.writeFile('src/utils/iconsSax.ts', imports, resolve)
  })
}

const run = async () => {
  await Promise.all([
    writeDefault(),
    writeSax(),
  ])

  console.log('Successfully written')
}

run()
