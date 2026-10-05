/* eslint-disable no-console */
/**
 * Fills generated regions in the docs Markdown, so the source .md is complete on its own —
 * it is what VitePress search indexes and what the llms.txt output serves verbatim.
 *
 *   <!-- @api WButton --> … <!-- @api-end -->                   props, events and slots from vue-component-meta
 *   <!-- @example Button/Basic --> … <!-- @example-end -->       live demo + the example's source (`client` flag skips SSR, other
 *                                                                flags like `overflow` pass through as DocsDemo attributes)
 *   <!-- @source docs/examples/x.ts --> … <!-- @source-end -->   any file's source as a code block
 *   <!-- @icons --> … <!-- @icons-end -->                        every icon name
 *
 * Run with `--check` to fail instead of writing when a region is stale.
 *
 * `@api` tables are rendered in a pool of worker threads (this same file), each with its own type checker.
 */
import {type ComponentMeta, type PropertyMeta, createCheckerByJson} from 'vue-component-meta'

import {createHash} from 'node:crypto'
import {existsSync, readFileSync} from 'node:fs'
import {glob, mkdir, readFile, readdir, writeFile} from 'node:fs/promises'
import {availableParallelism} from 'node:os'
import path from 'node:path'
import {Worker, isMainThread, parentPort} from 'node:worker_threads'

const ROOT = path.resolve(import.meta.dirname, '..')
const CHECK = process.argv.includes('--check')
const WORKERS = Math.max(1, Math.min(availableParallelism() - 1, 6))

const MARKDOWN_GLOBS = ['docs/**/*.md', 'src/components/*/docs/*.md']
const INHERITED_COLLAPSE_MIN = 4

// Types that print badly from .d.ts files (vue-router ships minified declaration names).
const TYPE_REPLACEMENTS: [RegExp, string][] = [
  [/string \| it \| et/g, 'RouteLocationRaw'],
  [/VNode<RendererNode, RendererElement, \{ \[key: string\]: any; \}>/g, 'VNode'],
]

const TSCONFIG = JSON.parse(readFileSync(path.join(ROOT, 'tsconfig.vue.json'), 'utf8'))
// Ambient declarations every component sees; components themselves are added one at a time as `files`.
const TSCONFIG_GLOBALS = (TSCONFIG.include as string[]).filter(pattern => pattern.endsWith('.d.ts'))
const CHECKER_OPTIONS = {forceUseTs: true, printer: {newLine: 1}}

const findComponent = async (name: string): Promise<string> => {
  for (const folder of await readdir(path.join(ROOT, 'src/components'))) {
    const file = path.join(ROOT, 'src/components', folder, `${ name }.vue`)
    if (existsSync(file)) return file
  }

  throw new Error(`Component ${ name } not found in src/components/*/`)
}

const findExample = (name: string): string => {
  const [folder, file] = name.split('/', 2)
  const candidates = [
    path.join(ROOT, 'src/components', folder, 'docs/examples', `${ file }.vue`),
    path.join(ROOT, 'docs/examples', `${ name }.vue`),
  ]
  const found = candidates.find(existsSync)

  if (!found) throw new Error(`Example ${ name } not found in ${ candidates.map(item => path.relative(ROOT, item)).join(' or ') }`)

  return found
}

const cell = (value: string) => value.replace(/\n+/g, ' ').replace(/\|/g, '\\|').trim()

const code = (value: string) => `\`${ cell(value) }\``

const formatType = (type: string, required: boolean) => {
  let result = required ? type : type.replace(/ \| undefined$/, '')
  for (const [pattern, replacement] of TYPE_REPLACEMENTS) result = result.replace(pattern, replacement)
  return result
}

const formatDescription = (prop: Pick<PropertyMeta, 'description' | 'tags'>) => {
  const parts: string[] = []
  const deprecated = prop.tags.find(tag => tag.name === 'deprecated')
  const since = prop.tags.find(tag => tag.name === 'since')

  if (deprecated) parts.push(`**Deprecated**${ deprecated.text ? `: ${ deprecated.text }` : '' }.`)
  if (prop.description) parts.push(prop.description)
  if (since) parts.push(`_Since ${ since.text }._`)

  return cell(parts.join(' ')) || '—'
}

const propsTable = (props: PropertyMeta[]) => [
  '| Prop | Type | Default | Description |',
  '| --- | --- | --- | --- |',
  ...props.map(prop => {
    const hasDefault = prop.default !== undefined && prop.default !== 'undefined'
    // `false as unknown as undefined` keeps a boolean prop's type optional in withDefaults; only the value is useful here.
    const defaultValue = prop.required ? '**required**' : hasDefault ? code(prop.default!.replace(/(?: as \w+)+$/, '')) : '—'

    return `| \`${ prop.name }\` | ${ code(formatType(prop.type, prop.required)) } | ${ defaultValue } | ${ formatDescription(prop) } |`
  }),
].join('\n')

// vue-component-meta drops emit JSDoc on non-generic components, so read it from the `defineEmits` source.
const sourceEmitDescriptions = (file: string): Map<string, string> => {
  const block = readFileSync(file, 'utf8').match(/defineEmits<\{([\s\S]*?)\n\}>\(\)/)?.[1] ?? ''
  const pattern = /\/\*\*\s*([\s\S]*?)\s*\*\/\s*(?:\(e: )?'([^']+)'/g

  return new Map([...block.matchAll(pattern)].map(([, text, name]) => [name!, text!.replace(/\s*\n\s*\*\s?/g, ' ')]))
}

const declarationFile = (prop: PropertyMeta) => {
  const file = prop.getDeclarations()[0]?.file
  return file ? path.relative(ROOT, file) : undefined
}

const renderApi = (name: string, file: string, meta: ComponentMeta): string => {
  const relative = path.relative(path.join(ROOT, 'src'), file)
  const ownFolder = path.dirname(path.relative(ROOT, file))
  const props = meta.props.filter(prop => !prop.global)

  const own: PropertyMeta[] = []
  const inherited = new Map<string, PropertyMeta[]>()

  for (const prop of props) {
    const source = declarationFile(prop)

    if (!source || source.startsWith(ownFolder) || !source.startsWith('src/')) own.push(prop)
    else inherited.set(source, [...inherited.get(source) ?? [], prop])
  }

  for (const [source, list] of inherited) {
    if (list.length >= INHERITED_COLLAPSE_MIN) continue
    own.push(...list)
    inherited.delete(source)
  }

  const lines: string[] = [
    `### ${ name }`,
    '',
    '```ts',
    `import ${ name } from 'eco-vue-js/dist/${ relative }'`,
    '```',
    '',
    '#### Props',
    '',
    own.length ? propsTable(own) : '_No props._',
  ]

  for (const [source, list] of inherited) {
    lines.push('', `::: details Inherited from \`${ source }\` (${ list.length })`, '', propsTable(list), '', ':::')
  }

  if (meta.events.length) {
    const sourceDescriptions = sourceEmitDescriptions(file)

    lines.push(
      '',
      '#### Events',
      '',
      '| Event | Payload | Description |',
      '| --- | --- | --- |',
      ...meta.events.map(event => {
        const payload = event.type.replace(/^\[(.*)\]$/s, '($1)')
        return `| \`${ event.name }\` | ${ payload === '()' ? '—' : code(formatType(payload, true)) } | ${ formatDescription({...event, description: event.description || sourceDescriptions.get(event.name) || ''}) } |`
      }),
    )
  }

  if (meta.slots.length) {
    lines.push(
      '',
      '#### Slots',
      '',
      '| Slot | Props | Description |',
      '| --- | --- | --- |',
      ...meta.slots.map(slot => `| \`${ slot.name }\` | ${ slot.type === '{}' || slot.type === 'any' ? '—' : code(slot.type) } | ${ cell(slot.description) || '—' } |`),
    )
  }

  return lines.join('\n')
}

const fence = (file: string, title?: string) => async () => {
  const source = (await readFile(file, 'utf8')).trimEnd()
  const lang = path.extname(file).slice(1)
  const longest = Math.max(2, ...[...source.matchAll(/`+/g)].map(match => match[0].length))
  const ticks = '`'.repeat(longest + 1)

  return `${ ticks }${ lang }${ title ? ` [${ title }]` : '' }\n${ source }\n${ ticks }`
}

const renderComponentApi = async (name: string) => {
  const file = await findComponent(name)

  // A fresh type checker per component, rooted at that component only: TypeScript orders union members and inherited
  // props by the order it first saw the types, so a shared checker would reshuffle one page's tables whenever another
  // page is added. Its program is then exactly the component's dependencies, which keys the cache.
  const checker = createCheckerByJson(ROOT, {...TSCONFIG, include: TSCONFIG_GLOBALS, files: [file]}, CHECKER_OPTIONS)
  const result = renderApi(name, file, checker.getComponentMeta(file))
  const deps = checker.getProgram()!.getSourceFiles()
    .map(source => path.relative(ROOT, source.fileName))
    .filter(source => !source.startsWith('..') && !source.startsWith('node_modules/'))

  return {result, deps}
}

type ApiRender = Awaited<ReturnType<typeof renderComponentApi>>

const renderApiInWorker = (worker: Worker, name: string) => new Promise<ApiRender>((resolve, reject) => {
  const onError = (error: Error) => reject(error)

  worker.once('error', onError)
  worker.once('message', (message: {render?: ApiRender, error?: string}) => {
    worker.off('error', onError)
    if (message.error !== undefined) reject(new Error(message.error))
    else resolve(message.render!)
  })
  worker.postMessage(name)
})

// API tables are cached per component, keyed by the content of every file in its program. Anything that can change
// them without being one of those files (this script, the tsconfig, dependencies, a new file shadowing an import)
// goes into the global key and drops the whole cache.
type ApiCache = {key: string, entries: Record<string, {result: string, deps: Record<string, string>}>}

const CACHE_FILE = path.join(ROOT, 'node_modules/.cache/docs-generate.json')

const hashes = new Map<string, string | null>()

const hashFile = (file: string) => {
  if (!hashes.has(file)) {
    const absolute = path.join(ROOT, file)
    hashes.set(file, existsSync(absolute) ? createHash('sha1').update(readFileSync(absolute)).digest('base64url') : null)
  }
  return hashes.get(file)!
}

const cacheKey = async () => {
  const sources: string[] = []
  for await (const file of glob('src/**/*.{ts,vue}', {cwd: ROOT})) sources.push(file)

  return createHash('sha1')
    .update([path.relative(ROOT, import.meta.filename), 'tsconfig.vue.json', 'package-lock.json'].map(hashFile).join())
    .update(sources.sort().join())
    .digest('base64url')
}

const readCache = (key: string): ApiCache => {
  try {
    const cache = JSON.parse(readFileSync(CACHE_FILE, 'utf8')) as ApiCache
    if (cache.key === key) return cache
  } catch {
    // Missing or unreadable cache — start over.
  }
  return {key, entries: {}}
}

const writeCache = async (cache: ApiCache) => {
  await mkdir(path.dirname(CACHE_FILE), {recursive: true})
  await writeFile(CACHE_FILE, JSON.stringify(cache), 'utf8')
}

const showProgress = (text: string) => {
  if (process.stdout.isTTY) process.stdout.write(`\r\x1b[K${ text }`)
}

const renderAllApis = async (names: string[]): Promise<{results: Map<string, string>, rendered: number}> => {
  const cache = readCache(await cacheKey())
  const results = new Map<string, string>()

  for (const name of names) {
    const entry = cache.entries[name]
    if (entry && Object.entries(entry.deps).every(([file, hash]) => hashFile(file) === hash)) results.set(name, entry.result)
  }

  const queue = names.filter(name => !results.has(name))
  const total = queue.length
  let done = 0

  const runWorker = async () => {
    const worker = new Worker(new URL(import.meta.url))

    try {
      while (queue.length) {
        const name = queue.shift()!
        const {result, deps} = await renderApiInWorker(worker, name)
        results.set(name, result)
        cache.entries[name] = {result, deps: Object.fromEntries(deps.map(file => [file, hashFile(file)!]))}
        showProgress(`API tables ${ ++done }/${ total } — ${ name }`)
      }
    } finally {
      await worker.terminate()
    }
  }

  if (total) {
    showProgress(`API tables 0/${ total }`)
    try {
      await Promise.all(Array.from({length: Math.min(WORKERS, total)}, runWorker))
    } finally {
      showProgress('')
      await writeCache(cache)
    }
  }

  return {results, rendered: total}
}

let apiResults = new Map<string, string>()

const renderers: Record<string, (arg: string) => Promise<string>> = {
  async api(name) {
    const result = apiResults.get(name)
    if (result === undefined) throw new Error(`API table for ${ name } was not rendered`)
    return result
  },

  async example(arg) {
    const [name, ...flags] = arg.split(/\s+/)
    const file = findExample(name)
    const attrs = flags.map(flag => ` ${ flag === 'client' ? 'client-only' : flag }`).join('')
    return `<DocsDemo name="${ name }"${ attrs } />\n\n${ await fence(file)() }`
  },

  async source(arg) {
    const [file, title] = arg.split(/\s+/, 2)
    return fence(path.join(ROOT, file), title ?? path.basename(file))()
  },

  async icons() {
    const names = (await readdir(path.join(ROOT, 'src/assets/icons')))
      .filter(name => name.startsWith('Icon') && name.endsWith('.svg'))
      .map(name => name.slice(0, -4))
      .sort()

    return [
      `All ${ names.length } icons, importable as \`import Name from 'eco-vue-js/dist/assets/icons/Name'\`:`,
      '',
      names.map(name => `\`${ name }\``).join(', '),
    ].join('\n')
  },
}

const REGION = /(<!-- @(api|example|source|icons)\b ?(.*?) -->\n)[\s\S]*?(<!-- @\2-end -->)/g

// Where a stale region first diverges, so `--check` says what changed and not only which file.
const describeStale = (content: string, offset: number, current: string, expected: string) => {
  const currentLines = current.split('\n')
  const expectedLines = expected.split('\n')
  let index = 0
  while (index < currentLines.length && currentLines[index] === expectedLines[index]) index++

  const line = content.slice(0, offset).split('\n').length + index
  const show = (value: string | undefined) => value === undefined ? '(end of region)' : value.trim() || '(empty line)'

  return [
    `line ${ line }:`,
    `      - ${ show(currentLines[index]) }`,
    `      + ${ show(expectedLines[index]) }`,
  ].join('\n')
}

const processFile = async (file: string): Promise<string[]> => {
  const content = await readFile(file, 'utf8')
  const regions: {open: string, kind: string, arg: string, body: string, offset: number, expected: string}[] = []

  for (const match of content.matchAll(REGION)) {
    const [whole, open, kind, arg, close] = match
    const body = whole.slice(open.length, whole.length - close.length)
    const expected = `\n${ await renderers[kind](arg.trim()) }\n\n`
    regions.push({open, kind, arg: arg.trim(), body, offset: match.index + open.length, expected})
  }

  const stale = regions.filter(region => region.body !== region.expected)

  if (!stale.length) return []

  if (!CHECK) {
    let index = 0
    const result = content.replace(REGION, (_, open, _kind, _arg, close) => `${ open }${ regions[index++].expected }${ close }`)
    await writeFile(file, result, 'utf8')
  }

  return stale.map(region => `@${ region.kind }${ region.arg ? ` ${ region.arg }` : '' } — ${ describeStale(content, region.offset, region.body, region.expected) }`)
}

const main = async () => {
  const start = performance.now()
  const files: string[] = []

  for (const pattern of MARKDOWN_GLOBS) {
    for await (const file of glob(pattern, {cwd: ROOT})) files.push(file)
  }

  const apiNames = new Set<string>()

  for (const file of files) {
    for (const [, , kind, arg] of (await readFile(path.join(ROOT, file), 'utf8')).matchAll(REGION)) {
      if (kind === 'api') apiNames.add(arg.trim())
    }
  }

  const {results, rendered} = await renderAllApis([...apiNames])
  apiResults = results

  const changed: string[] = []
  const details: string[] = []

  for (const file of files) {
    const stale = await processFile(path.join(ROOT, file))
    if (!stale.length) continue

    changed.push(file)
    details.push(`  ${ file }`, ...stale.map(item => `    ${ item }`))
  }

  const seconds = `${ ((performance.now() - start) / 1000).toFixed(1) }s, ${ rendered }/${ apiNames.size } API tables rendered`

  if (CHECK && changed.length) {
    console.error(`Generated docs are stale — run \`npm run docs:generate\`:\n${ details.join('\n') }`)
    process.exit(1)
  }

  console.log(changed.length ? `Updated ${ changed.length } file(s) (${ seconds }):\n${ changed.map(file => `  ${ file }`).join('\n') }` : `Docs are up to date (${ seconds })`)
}

if (isMainThread) {
  await main()
} else {
  parentPort!.on('message', async (name: string) => {
    try {
      parentPort!.postMessage({render: await renderComponentApi(name)})
    } catch (error) {
      parentPort!.postMessage({error: error instanceof Error ? error.stack ?? error.message : String(error)})
    }
  })
}
