#!/usr/bin/env node
/* eslint-disable no-console */
/**
 * Replaces light/dark palette pairs with eco-vue-js color roles and tones, inside single class strings:
 *
 *   'bg-default dark:bg-default-dark'                → 'bg-surface'
 *   'border-gray-300 dark:border-gray-700'           → 'border-line'
 *   'text-negative dark:text-negative-dark'          → 'tone-negative text-tone'
 *   'bg-primary/10 dark:bg-primary-dark/10'          → 'tone-primary bg-tone-fill/10'
 *
 *   npx eco-vue-color-roles [--write] [--exact] [--theme <css>] [paths…]     default: src
 *
 * A pair maps to a role when its colors are the role's, on any property the role suits: `stroke-gray-200
 * dark:stroke-gray-700` → `stroke-line-subtle`. `--theme` reads the app's `--role-*: var(--color-*)` overrides, so after
 * `--role-surface-dark: var(--color-gray-900)` the app's `bg-default dark:bg-gray-900` becomes `bg-surface`.
 *
 * Without `--write` it only reports. `--exact` applies only replacements that render the same colors; without it the
 * codemod also unifies near-duplicate grays and moves tone text to the readable shade the kit derives from the fill.
 *
 * Either way it lists the pairs it found no role for — candidates for a `--role-*` override in the app's theme (then
 * run again with `--theme`) or a manual choice — and every palette color class it left.
 */
import {globSync, readFileSync, statSync, writeFileSync} from 'node:fs'

const TEXT_PROPS = ['text', 'fill', 'stroke', 'placeholder', 'caret', 'decoration']
const SURFACE_PROPS = ['bg', 'from', 'via', 'to', 'fill']
const LINE_PROPS = ['border', 'divide', 'outline', 'ring', 'stroke']

/**
 * The kit's roles (`tailwind-base/css/roles.css`): the utility color name, the properties it suits, and the default
 * palette colors per mode. `--theme` replaces the defaults with the app's `--role-*` overrides.
 *
 * @type {{role: string, color: string, props: string[], light: string, dark: string}[]}
 */
const ROLES = [
  {role: 'text-accent', color: 'accent', props: TEXT_PROPS, light: 'black-default', dark: 'default'},
  {role: 'text-description', color: 'description', props: TEXT_PROPS, light: 'gray-500', dark: 'gray-400'},
  {role: 'text-subtle', color: 'subtle', props: TEXT_PROPS, light: 'gray-400', dark: 'gray-600'},
  {role: 'surface', color: 'surface', props: [...SURFACE_PROPS, 'text'], light: 'default', dark: 'default-dark'},
  {role: 'surface-muted', color: 'surface-muted', props: SURFACE_PROPS, light: 'gray-100', dark: 'gray-800'},
  {role: 'surface-inset', color: 'surface-inset', props: SURFACE_PROPS, light: 'gray-200', dark: 'gray-700'},
  {role: 'track', color: 'track', props: ['bg', 'fill', 'stroke'], light: 'gray-300', dark: 'gray-700'},
  {role: 'track-strong', color: 'track-strong', props: ['bg', 'fill', 'stroke'], light: 'gray-400', dark: 'gray-500'},
  {role: 'line', color: 'line', props: LINE_PROPS, light: 'gray-300', dark: 'gray-700'},
  {role: 'line-subtle', color: 'line-subtle', props: LINE_PROPS, light: 'gray-200', dark: 'gray-700'},
]

/** Translucent roles, matched as written. */
const EXACT_EXTRA = {
  'bg:default/40|default-dark/60': 'bg-overlay',
  'bg:primary-light/40|primary-darkest/40': 'bg-backdrop',
}

/** Near-duplicates the kit unified into a role. */
const NEUTRAL_UNIFIED = {
  'text:black-default|gray-200': 'text-accent', // dark gray-200 → white
  'text:black-default|gray-100': 'text-accent',
  'text:gray-400|gray-500': 'text-description', // muted text was too faint in light mode
  'border:gray-200|gray-800': 'border-line-subtle', // dark 800 → 700
  // Exactly `line-raised`, but in app code these are card borders, not the edge of a popup.
  'border:gray-100|gray-800': 'border-line-subtle', // light 100 → 200, dark 800 → 700
}

/**
 * Reads `--role-{name}: var(--color-x)` and `--role-{name}-dark: …` from the app's theme CSS into `ROLES`, so pairs
 * of the app's own surface or line colors map to the role it set.
 *
 * @param {string} file
 */
const readTheme = file => {
  for (const [, key, color] of readFileSync(file, 'utf8').matchAll(/--role-([\w-]+):\s*var\(--color-([\w-]+)\)\s*;/g)) {
    const dark = key.endsWith('-dark') && ROLES.some(item => item.role === key.slice(0, -5))
    const item = ROLES.find(entry => entry.role === (dark ? key.slice(0, -5) : key))

    if (item) item[dark ? 'dark' : 'light'] = color
  }
}

/** `property:light|dark` → role utility, for every property each role suits. */
const getExactTable = () => ({
  ...Object.fromEntries(ROLES.flatMap(item => item.props.map(prop => [`${ prop }:${ item.light }|${ item.dark }`, `${ prop }-${ item.color }`]))),
  ...EXACT_EXTRA,
})

const TONES = ['primary', 'negative', 'positive', 'warning', 'info']

/** Tone pairs `X dark:X-dark` → the tone utility; `exact` when it renders the pair's own colors. */
const TONE_PROPS = {
  bg: {utility: 'bg-tone-fill', exact: true},
  fill: {utility: 'fill-tone-fill', exact: true},
  text: {utility: 'text-tone', exact: false},
  border: {utility: 'border-tone', exact: false},
  outline: {utility: 'outline-tone', exact: false},
  stroke: {utility: 'stroke-tone', exact: false},
}

const PROPS = 'bg|text|border|outline|ring|fill|stroke|divide|from|via|to|shadow|placeholder|caret|accent|decoration'
const PALETTE = new RegExp(`^(?:${ PROPS })-(?:gray-\\d+|primary(?:-[a-z]+)?|default(?:-dark)?|black-[a-z]+|negative(?:-dark)?|positive(?:-dark)?|warning(?:-dark)?|info(?:-dark)?)(?:/\\d+)?$`)
const HAS_COLOR_CLASS = new RegExp(`(?:^|\\s|:)(?:${ PROPS })-`)

/** @typedef {{raw: string, variants: string, dark: boolean, prop: string, color: string}} Token */

/** @param {string} raw @returns {Token | null} */
const parse = raw => {
  const parts = raw.split(':')
  const utility = /** @type {string} */ (parts.pop())

  if (!PALETTE.test(utility)) return null

  const dash = utility.indexOf('-')

  return {
    raw,
    variants: parts.filter(part => part !== 'dark').map(part => part + ':').join(''),
    dark: parts.includes('dark'),
    prop: utility.slice(0, dash),
    color: utility.slice(dash + 1),
  }
}

/**
 * @param {string} value
 * @param {boolean} exact
 * @param {Record<string, string>} table `property:light|dark` → role utility
 * @returns {{text: string, replaced: string[], unmapped: string[], left: string[]}}
 */
const transformClasses = (value, exact, table) => {
  const words = value.split(/(\s+)/)
  const tokens = words.map(word => /\s/.test(word) ? null : parse(word))
  const neutral = exact ? table : {...NEUTRAL_UNIFIED, ...table}
  /** @type {string[]} */
  const replaced = []
  /** @type {string[]} */
  const unmapped = []
  const tonesInString = new Set(tokens.flatMap(token => TONES.filter(tone => token?.color === tone || token?.color.startsWith(tone + '-') || token?.color.startsWith(tone + '/'))))
  /** @type {string | null} */
  let addTone = null

  tokens.forEach((light, index) => {
    if (!light || light.dark) return

    const darkIndex = tokens.findIndex(token => token?.dark && token.variants === light.variants && token.prop === light.prop)

    if (darkIndex === -1) return

    const dark = /** @type {Token} */ (tokens[darkIndex])
    // The same opacity on both sides maps to the role with that opacity: `bg-gray-100/50 dark:bg-gray-800/50` → `bg-surface-muted/50`.
    const [lightColor, lightAlpha] = light.color.split('/')
    const [darkColor, darkAlpha] = dark.color.split('/')
    const alpha = lightAlpha === darkAlpha && lightAlpha ? '/' + lightAlpha : ''
    const role = neutral[`${ light.prop }:${ light.color }|${ dark.color }`] ?? (alpha ? neutral[`${ light.prop }:${ lightColor }|${ darkColor }`]?.concat(alpha) : undefined)
    /** @type {string | null} */
    let next = null

    if (role) {
      next = light.variants + role
    } else {
      const tone = TONES.find(item => lightColor === item && darkColor === item + '-dark' && lightAlpha === darkAlpha)
      const toneProp = TONE_PROPS[/** @type {keyof typeof TONE_PROPS} */ (light.prop)]

      // A tone is set on the whole string, so only strings with one tone and no state variant on it qualify.
      if (tone && toneProp && (toneProp.exact || !exact) && !light.variants && tonesInString.size === 1) {
        next = toneProp.utility + alpha
        addTone = 'tone-' + tone
      }
    }

    if (!next) {
      unmapped.push(`${ light.variants }${ light.prop }:${ light.color }|${ dark.color }`)
      return
    }

    replaced.push(`${ light.raw } ${ dark.raw } → ${ next }`)
    words[index] = next
    words[darkIndex] = ''
    tokens[index] = null
    tokens[darkIndex] = null
  })

  // Removed classes leave gaps: collapse them, drop spaces left before line breaks, keep the string's own edges.
  const lead = value.match(/^\s*/)?.[0] ?? ''
  const trail = value.match(/\s*$/)?.[0] ?? ''
  let text = lead + words.join('').trim().replace(/[ \t]{2,}/g, ' ').replace(/[ \t]+\n/g, '\n') + trail

  if (addTone && !text.split(/\s+/).includes(addTone)) text = text.replace(/^(\s*)/, `$1${ addTone } `)

  return {text, replaced, unmapped, left: tokens.filter(token => token !== null).map(token => token.raw)}
}

const args = process.argv.slice(2)

if (args.includes('--help')) {
  console.log('Usage: eco-vue-color-roles [--write] [--exact] [--theme <css>] [paths…]   (default path: src)')
  process.exit(0)
}

const write = args.includes('--write')
const themeIndex = args.indexOf('--theme')

if (themeIndex !== -1) readTheme(args[themeIndex + 1])

const exactTable = getExactTable()
const exact = args.includes('--exact')
const roots = args.filter((arg, index) => !arg.startsWith('--') && index !== themeIndex + 1)
const files = (roots.length ? roots : ['src']).flatMap(root => statSync(root).isDirectory()
  ? globSync(`${ root }/**/*.{vue,ts,tsx,js,jsx,astro,html,svelte}`, {exclude: path => /(^|\/)(node_modules|dist)(\/|$)/.test(path)})
  : [root])

let replacedCount = 0
/** @type {Map<string, string[]>} */
const leftByFile = new Map()
/** @type {Map<string, number>} */
const unmappedCount = new Map()

for (const file of files) {
  const source = readFileSync(file, 'utf8')
  /** @type {string[]} */
  const left = []

  // Every run of text between two consecutive quote characters. Class strings never contain quotes, so this finds each
  // one whatever the quoting around it — pairing quotes from the start of the file goes wrong on a stray apostrophe.
  // Runs between strings (`: isOpen,`) hold no palette pairs and come back unchanged.
  const output = source.replace(/(?<=["'`])[^"'`]+(?=["'`])/g, value => {
    if (!HAS_COLOR_CLASS.test(value)) return value

    const result = transformClasses(value, exact, exactTable)

    replacedCount += result.replaced.length
    left.push(...result.left)
    for (const pair of result.unmapped) unmappedCount.set(pair, (unmappedCount.get(pair) ?? 0) + 1)
    if (result.replaced.length && !write) console.log(`${ file }:`, result.replaced.join('; '))

    return result.text
  })

  if (left.length) leftByFile.set(file, left)
  if (write && output !== source) writeFileSync(file, output)
}

console.log(`\n${ replacedCount } pairs ${ write ? 'replaced' : 'replaceable' }${ exact ? ' (exact only)' : '' }`)

if (unmappedCount.size) {
  console.log(`\n${ unmappedCount.size } kinds of pairs without a role (property:light|dark):`)
  for (const [pair, count] of [...unmappedCount].sort((a, b) => b[1] - a[1])) console.log(`  ${ String(count).padStart(4) } ${ pair }`)
}

console.log(`\n${ [...leftByFile.values()].flat().length } palette classes left in ${ leftByFile.size } files:`)
for (const [file, left] of [...leftByFile].sort((a, b) => b[1].length - a[1].length)) console.log(`  ${ file }: ${ left.join(' ') }`)
