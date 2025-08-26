/* eslint-disable no-console */
import fs from 'fs/promises'
import path from 'path'

type ComponentPath = {name: string, path: string}

const PATH_ICONS = 'src/assets/icons'
const PATH_COMPONENTS = 'src/components'
const PATH_PACKAGE = 'package/package.json'
const PATH_UTILS = 'src/utils'
const PATH_MAIN = 'src/main.ts'

const getIconPaths = (root: string) => {
  const dirPath = path.resolve(root)

  return fs
    .readdir(dirPath)
    .then(files => files.filter(name => name.startsWith('Icon') && name.endsWith('.svg')).map(name => ({name: name.slice(0, -4), path: path.join(dirPath, name)})))
}

const getComponentPaths = (root: string) => {
  const dirPath = path.resolve(root)

  return fs
    .readdir(dirPath)
    .then(files => files
      .reduce<ComponentPath[]>((result, name) => {
        if (name.startsWith('W') && name.endsWith('.vue')) {
          result.push({
            name: name.slice(0, -4),
            path: path.join(dirPath, name),
          })
        }

        if (name === 'types.ts') {
          result.push({
            name: name.slice(0, -3),
            path: path.join(dirPath, name.slice(0, -3) + '.d.ts'),
          })
        }

        return result
      }, []),
    )
}

const getComponentDirs = (root: string) => {
  const dirPath = path.resolve(root)

  return fs.readdir(dirPath).then(dirs => dirs.map(name => path.join(dirPath, name)))
}

const getComponentsList = async () => {
  const dirs = await getComponentDirs(PATH_COMPONENTS)

  const list: ComponentPath[] = []

  for (let i = 0; i < dirs.length; i++) {
    list.push(...await getComponentPaths(dirs[i]))
  }

  return list
}

const getVuePlugin = (list: ComponentPath[]) => {
  const result = list
    .map(item => `    app.component('${ item.name }', ${ item.name })`)
    .join('\n')
  
  return `export default {\n  // eslint-disable-next-line @typescript-eslint/no-explicit-any\n  install: (app: App | any) => {\n${ result }\n  },\n}`
}

const getExports = (list: ComponentPath[]) => {
  const result = list
    .map(item => `  ${ item.name }`)
    .join(',\n')

  return `export {\n${ result },\n}`
}

const getUtils = () => {
  const dirPath = path.resolve(PATH_UTILS)

  return fs
    .readdir(dirPath)
    .then(files => files.map(name => ({
      name: name.slice(0, -4),
      path: path.join(dirPath, name),
    })))
}

const getPackageExports = (list: ComponentPath[]) => {
  const result: Record<string, {import: string, require?: string}> = {
    '.': {
      import: './dist/main.js',
    },
    './dist/types/global.d.ts': {
      import: './dist/types/global.d.ts',
    },
    './dist/types/types.d.ts': {
      import: './dist/types/types.d.ts',
    },
    './tailwind-base': {
      import: './tailwind-base/index.ts',
      require: './tailwind-base/index.ts',
    },
    './eslint/plugin': {
      import: './eslint/plugin.js',
    },
    './dist/assets/icons/*': {
      import: './dist/assets/icons/*.svg.js',
    },
  }

  list.forEach(item => {
    const distPath = `./dist${ item.path.substring(item.path.indexOf('/components')) }`

    if (item.path.endsWith('.d.ts')) {
      result[distPath.slice(0, -5)] = {import: distPath}
    } else {
      result[distPath] = {import: distPath + '.js'}
    }
  })

  return result
}

const writePackageExports = async (list: ComponentPath[]) => {
  const obj = await fs.readFile('package.json', 'utf8').then(JSON.parse)

  delete obj.devDependencies
  delete obj.scripts

  obj.exports = getPackageExports(list)

  fs.writeFile(PATH_PACKAGE, JSON.stringify(obj, null, 2) + '\n', 'utf8')
}

export const writeImports = async () => {
  const start = performance.now()

  const utilsList = await getUtils()
  const componentsList = await getComponentsList()
  const componentsListNoTypes = componentsList.filter(item => item.name !== 'types')

  const result =`import type {App} from 'vue'

${ componentsListNoTypes.map(item => `import ${ item.name } from '@${ item.path.substring(item.path.indexOf('/components')) }'`).join('\n') }

${ utilsList.map(item => `export * from '@${ item.path.substring(item.path.indexOf('/utils')) }'`).join('\n') }

${ (await getIconPaths(PATH_ICONS)).map(item => `export {default as ${ item.name }} from '@${ item.path.substring(item.path.indexOf('/assets')) }?component'`).join('\n') }

${ getVuePlugin(componentsListNoTypes) }

${ getExports(componentsListNoTypes) }
`

  const content = (await fs.readFile(PATH_MAIN).catch(() => '')).toString()

  if (content === result) console.log('Main is up to date')
  else await fs.writeFile(PATH_MAIN, result, 'utf8')

  await writePackageExports([...utilsList, ...componentsList])
   
  console.log(`Successfully written: ${ (performance.now() - start) / 1000 }s`)
}
