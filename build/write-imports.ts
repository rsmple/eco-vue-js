/* eslint-disable no-console */
import fs from 'fs/promises'
import path from 'path'

type ComponentPath = {name: string, path: string}

const PATH_BASE = 'src'
const PATH_ICONS = 'assets/icons'
const PATH_COMPONENTS = 'components'
const PATH_UTILS = 'utils'
const PATH_PACKAGE = 'package/package.json'
const PATH_MAIN = 'main.ts'

const getIconPaths = () => {
  return fs
    .readdir(path.resolve(PATH_BASE, PATH_ICONS))
    .then(files => files
      .filter(name => name.startsWith('Icon') && name.endsWith('.svg'))
      .map(name => ({name: name.slice(0, -4), path: path.join(PATH_ICONS, name)})),
    )
}

const getComponentPaths = (root: string) => {
  return fs
    .readdir(path.resolve(PATH_BASE, PATH_COMPONENTS, root))
    .then(files => files
      .reduce<ComponentPath[]>((result, name) => {
        if (name.startsWith('W') && name.endsWith('.vue')) {
          result.push({
            name: name.slice(0, -4),
            path: path.join(PATH_COMPONENTS, root, name),
          })
        }

        if (name === 'types.ts') {
          result.push({
            name: name.slice(0, -3),
            path: path.join(PATH_COMPONENTS, root, name.slice(0, -3) + '.d.ts'),
          })
        }

        return result
      }, []),
    )
}

const getComponentsList = async () => (await Promise.all(
  (await fs.readdir(path.resolve(PATH_BASE, PATH_COMPONENTS))).map(getComponentPaths),
)).flat(1) satisfies ComponentPath[]

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
  return fs
    .readdir(path.resolve(PATH_BASE, PATH_UTILS))
    .then(files => files.map(name => ({
      name: name.slice(0, -4),
      path: path.join(PATH_UTILS, name),
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
    const distPath = `./dist/${ item.path }`

    if (item.path.endsWith('.d.ts')) {
      result[distPath.slice(0, -5)] = {import: distPath}
    } else if (item.path.endsWith('.ts')) {
      result[distPath.slice(0, -3)] = {import: distPath.slice(0, -3) + '.js'}
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

${ componentsListNoTypes.map(item => `import ${ item.name } from '@/${ item.path }'`).join('\n') }

${ utilsList.map(item => `export * from '@/${ item.path }'`).join('\n') }

${ (await getIconPaths()).map(item => `export {default as ${ item.name }} from '@/${ item.path }?component'`).join('\n') }

${ getVuePlugin(componentsListNoTypes) }

${ getExports(componentsListNoTypes) }
`

  const pathMain = path.resolve(PATH_BASE, PATH_MAIN)

  const content = (await fs.readFile(pathMain).catch(() => '')).toString()

  if (content === result) console.log('Main is up to date')
  else await fs.writeFile(pathMain, result, 'utf8')

  await writePackageExports([...utilsList, ...componentsList])
   
  console.log(`Successfully written: ${ (performance.now() - start) / 1000 }s`)
}
