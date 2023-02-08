import path from 'path'
import fs from 'fs/promises'

const getIconPaths = root => {
  const dirPath = path.resolve(root)

  return fs
    .readdir(dirPath)
    .then(files => files.filter(name => name.startsWith('Icon') && name.endsWith('.svg')).map(name => ({name: name.slice(0, -4), path: path.join(dirPath, name)})))
}

const getIconImports = (list) => {
  const imports = list.map(item => `export {default as ${ item.name }} from '@${ item.path.substring(item.path.indexOf('/assets')) }?component'`)

  return imports.join('\n')
}

const writeIconDefault = async () => {
  return fs.writeFile(
    'src/imports/iconsDefault.ts',
    getIconImports(await getIconPaths('src/assets/icons/default')),
  )
}

const writeIconSax = async () => {
  return fs.writeFile(
    'src/imports/iconsSax.ts',
    getIconImports(await getIconPaths('src/assets/icons/sax')),
  )
}

const getComponentPaths = root => {
  const dirPath = path.resolve(root)

  return fs
    .readdir(dirPath)
    .then(files => files
      .filter(name => name.startsWith('W') && name.endsWith('.vue'))
      .map(name => ({
        name: name.slice(0, -4),
        path: path.join(dirPath, name),
      })),
    )
}

const getComponentDirs = root => {
  const dirPath = path.resolve(root)

  return fs.readdir(dirPath).then(dirs => dirs.map(name => path.join(dirPath, name)))
}

const getComponentsList = async () => {
  const dirs = await getComponentDirs('src/components')

  const list = []

  for (let i = 0; i < dirs.length; i++) {
    list.push(...await getComponentPaths(dirs[i]))
  }

  return list
}

const getImports = list => {
  return list
    .map(item => `import ${item.name} from '@${ item.path.substring(item.path.indexOf('/components')) }'`)
    .join('\n')
}

const getVuePlugin = list => {
  const result = list
    .map(item => `    app.component('${item.name}', ${item.name})`)
    .join('\n')
  
  return `export default {\n  install: (app: App | any) => {\n${result}\n  },\n}`
}

const getExports = list => {
  const result = list
    .map(item => `  ${item.name}`)
    .join(',\n')

  return `export {\n${result},\n}`
}

const writePlugin = async (list) => {
  const result = `import type {App} from 'vue'\n\n${getImports(list)}\n\n${getVuePlugin(list)}\n\n${getExports(list)}`

  return fs.writeFile('src/imports/componentsPlugin.ts', result)
}

const getPackageExports = (list) => {
  const result = {
    '.': {
      'import': './dist/main.js',
    },
    './tailwind-base/index.cjs': {
      'require': './tailwind-base/index.cjs',
    },
    './dist/assets/icons/default/*': {
      'import': './dist/assets/icons/default/*.svg.js',
    },
    './dist/assets/icons/sax/*': {
      'import': './dist/assets/icons/sax/*.svg.js',
    },
    './dist/utils/HorizontalAlign': {
      'import': './dist/utils/HorizontalAlign.js',
    },
    './dist/utils/SemanticType': {
      'import': './dist/utils/SemanticType.js',
    },
    './dist/utils/dateTime': {
      'import': './dist/utils/dateTime.js',
    },
    './dist/utils/utils': {
      'import': './dist/utils/utils.js',
    },
    './dist/utils/mobile': {
      'import': './dist/utils/mobile.js',
    },
    './dist/utils/Modal': {
      'import': './dist/utils/Modal.js',
    },
    './dist/utils/Notify': {
      'import': './dist/utils/Notify.js',
    },
  }

  list.forEach(item => {
    const distPath = `./dist${item.path.substring(item.path.indexOf('/components'))}`
    result[distPath] = {'import': distPath + '.js'}
  })

  return result
}

const writePackageExports = async (list) => {
  const obj = await fs.readFile('package.json', 'utf8').then(JSON.parse)

  obj.exports = getPackageExports(list)

  fs.writeFile('package.json', JSON.stringify(obj, null, 2) + '\n', 'utf8')
}

const writeComponents = async () => {
  const list = await getComponentsList()

  await Promise.all([
    writePlugin(list),
    writePackageExports(list),
  ])
}

const writeIcons = async () => {
  await Promise.all([
    writeIconDefault(),
    writeIconSax(),
  ])
}

const run = async () => {
  await Promise.all([
    writeComponents(),
    writeIcons(),
  ])

  console.log('Successfully written')
}

run()
