/* eslint-disable no-console */
/**
 * Fills generated regions in the docs Markdown, so the source .md is complete on its own —
 * it is what VitePress search indexes and what the llms.txt output serves verbatim.
 *
 *   <!-- @api WButton --> … <!-- @api-end -->                   props, events and slots from vue-component-meta
 *   <!-- @example Button/Basic --> … <!-- @example-end -->       live demo + the example's source (`client` suffix skips SSR)
 *   <!-- @source docs/examples/x.ts --> … <!-- @source-end -->   any file's source as a code block
 *   <!-- @icons --> … <!-- @icons-end -->                        every icon name
 *
 * Run with `--check` to fail instead of writing when a region is stale.
 */
import {type ComponentMeta, type PropertyMeta, createChecker} from 'vue-component-meta'

import {existsSync} from 'node:fs'
import {glob, readFile, readdir, writeFile} from 'node:fs/promises'
import path from 'node:path'

const ROOT = path.resolve(import.meta.dirname, '..')
const CHECK = process.argv.includes('--check')

const MARKDOWN_GLOBS = ['docs/**/*.md', 'src/components/*/docs/*.md']
const INHERITED_COLLAPSE_MIN = 4

// Types that print badly from .d.ts files (vue-router ships minified declaration names).
const TYPE_REPLACEMENTS: [RegExp, string][] = [
  [/string \| it \| et/g, 'RouteLocationRaw'],
  [/VNode<RendererNode, RendererElement, \{ \[key: string\]: any; \}>/g, 'VNode'],
]

let checker: ReturnType<typeof createChecker> | undefined

const getChecker = () => checker ??= createChecker(path.join(ROOT, 'tsconfig.vue.json'), {
  forceUseTs: true,
  printer: {newLine: 1},
})

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
    const defaultValue = prop.required ? '**required**' : hasDefault ? code(prop.default!) : '—'

    return `| \`${ prop.name }\` | ${ code(formatType(prop.type, prop.required)) } | ${ defaultValue } | ${ formatDescription(prop) } |`
  }),
].join('\n')

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
    lines.push(
      '',
      '#### Events',
      '',
      '| Event | Payload | Description |',
      '| --- | --- | --- |',
      ...meta.events.map(event => {
        const payload = event.type.replace(/^\[(.*)\]$/s, '($1)')
        return `| \`${ event.name }\` | ${ payload === '()' ? '—' : code(formatType(payload, true)) } | ${ formatDescription(event) } |`
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
      ...meta.slots.map(slot => `| \`${ slot.name }\` | ${ slot.type === '{}' ? '—' : code(slot.type) } | ${ cell(slot.description) || '—' } |`),
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

const renderers: Record<string, (arg: string) => Promise<string>> = {
  async api(name) {
    const file = await findComponent(name)
    return renderApi(name, file, getChecker().getComponentMeta(file))
  },

  async example(arg) {
    const [name, flag] = arg.split(/\s+/, 2)
    const file = findExample(name)
    return `<DocsDemo name="${ name }"${ flag === 'client' ? ' client-only' : '' } />\n\n${ await fence(file)() }`
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

const processFile = async (file: string): Promise<boolean> => {
  const content = await readFile(file, 'utf8')
  const replacements: string[] = []

  for (const [, , kind, arg] of content.matchAll(REGION)) {
    replacements.push(await renderers[kind](arg.trim()))
  }

  if (!replacements.length) return false

  let index = 0
  const result = content.replace(REGION, (_, open, _kind, _arg, close) => `${ open }\n${ replacements[index++] }\n\n${ close }`)

  if (result === content) return false

  if (!CHECK) await writeFile(file, result, 'utf8')

  return true
}

const start = performance.now()
const changed: string[] = []

for (const pattern of MARKDOWN_GLOBS) {
  for await (const file of glob(pattern, {cwd: ROOT})) {
    if (await processFile(path.join(ROOT, file))) changed.push(file)
  }
}

const seconds = ((performance.now() - start) / 1000).toFixed(1)

if (CHECK && changed.length) {
  console.error(`Generated docs are stale — run \`npm run docs:generate\`:\n${ changed.map(file => `  ${ file }`).join('\n') }`)
  process.exit(1)
}

console.log(changed.length ? `Updated ${ changed.length } file(s) in ${ seconds }s:\n${ changed.map(file => `  ${ file }`).join('\n') }` : `Docs are up to date (${ seconds }s)`)
