/* eslint-disable no-console */
import fs from 'fs/promises'
import path from 'path'

type ComponentPath = {name: string, path: string}

const PATH_ICONS_DEFAULT = 'src/assets/icons/default'
const PATH_ICONS_DEFAULT_PLUGIN = 'src/imports/iconsDefault.ts'
const PATH_ICONS_SAX = 'src/assets/icons/sax'
const PATH_ICONS_SAX_PLUGIN =  'src/imports/iconsSax.ts'
const PATH_COMPONENTS = 'src/components'
const PATH_COMPONENTS_PLUGIN = 'src/imports/componentsPlugin.ts'
const PATH_PACKAGE = 'package/package.json'

const getIconPaths = (root: string) => {
  const dirPath = path.resolve(root)

  return fs
    .readdir(dirPath)
    .then(files => files.filter(name => name.startsWith('Icon') && name.endsWith('.svg')).map(name => ({name: name.slice(0, -4), path: path.join(dirPath, name)})))
}

const getIconImports = (list: ComponentPath[]) => {
  const imports = list.map(item => `export {default as ${ item.name }} from '@${ item.path.substring(item.path.indexOf('/assets')) }?component'`)

  return imports.join('\n')
}

const writeIconDefault = async () => {
  const text = (await fs.readFile(PATH_ICONS_DEFAULT_PLUGIN)).toString()
  const imports = getIconImports(await getIconPaths(PATH_ICONS_DEFAULT))

  if (text === imports) {
    console.log('IconDefault is up to date')

    return
  }

  console.log('Writing IconDefault')

  return fs.writeFile(
    PATH_ICONS_DEFAULT_PLUGIN,
    imports,
  )
}

const writeIconSax = async () => {
  const text = (await fs.readFile(PATH_ICONS_SAX_PLUGIN)).toString()
  const imports = getIconImports(await getIconPaths(PATH_ICONS_SAX))

  if (text === imports) {
    console.log('IconSax is up to date')

    return
  }

  console.log('Writing IconSax')

  return fs.writeFile(
    PATH_ICONS_SAX_PLUGIN,
    imports,
  )
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

const getImports = (list: ComponentPath[]) => {
  return list
    .map(item => `import ${ item.name } from '@${ item.path.substring(item.path.indexOf('/components')) }'`)
    .join('\n')
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

const writePlugin = async (list: ComponentPath[]) => {
  const result = `import type {App} from 'vue'\n\n${ getImports(list) }\n\n${ getVuePlugin(list) }\n\n${ getExports(list) }`

  const text = (await fs.readFile(PATH_COMPONENTS_PLUGIN)).toString()

  if (text === result) {
    console.log('Components are up to date')

    return
  }

  console.log('Writing Components')

  return fs.writeFile(PATH_COMPONENTS_PLUGIN, result)
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
    './dist/assets/icons/default/*': {
      import: './dist/assets/icons/default/*.svg.js',
    },
    './dist/assets/icons/sax/*': {
      import: './dist/assets/icons/sax/*.svg.js',
    },
    './dist/utils/DOMListenerContainer': {
      import: './dist/utils/DOMListenerContainer.js',
    },
    './dist/utils/HorizontalAlign': {
      import: './dist/utils/HorizontalAlign.js',
    },
    './dist/utils/SemanticType': {
      import: './dist/utils/SemanticType.js',
    },
    './dist/utils/dateTime': {
      import: './dist/utils/dateTime.js',
    },
    './dist/utils/utils': {
      import: './dist/utils/utils.js',
    },
    './dist/utils/mobile': {
      import: './dist/utils/mobile.js',
    },
    './dist/utils/Modal': {
      import: './dist/utils/Modal.js',
    },
    './dist/utils/Notify': {
      import: './dist/utils/Notify.js',
    },
    './dist/utils/Tooltip': {
      import: './dist/utils/Tooltip.js',
    },
    './dist/utils/useDefaultQuery': {
      import: './dist/utils/useDefaultQuery.js',
    },
    './dist/utils/useQueryUpdater': {
      import: './dist/utils/useQueryUpdater.js',
    },
    './dist/utils/useCopy': {
      import: './dist/utils/useCopy.js',
    },
    './dist/utils/order': {
      import: './dist/utils/order.js',
    },
    './dist/utils/useSelected': {
      import: './dist/utils/useSelected.js',
    },
    './dist/utils/api': {
      import: './dist/utils/api.js',
    },
    './dist/utils/validate': {
      import: './dist/utils/validate.js',
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

  obj.exports = getPackageExports(list)

  fs.writeFile(PATH_PACKAGE, JSON.stringify(obj, null, 2) + '\n', 'utf8')
}

const writeComponents = async () => {
  const list = await getComponentsList()

  await Promise.all([
    writePlugin(list.filter(item => item.name !== 'types')),
    writePackageExports(list),
  ])
}

const writeIcons = async () => {
  await Promise.all([
    writeIconDefault(),
    writeIconSax(),
  ])
}

export const writeImports = async () => {
  await Promise.all([
    writeComponents(),
    writeIcons(),
  ])
   
  console.log('Successfully written')
}
