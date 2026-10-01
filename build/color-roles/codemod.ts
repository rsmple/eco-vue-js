/* eslint-disable no-console */
/**
 * Replaces light/dark palette pairs with color roles (plans/color-roles.md) inside single class strings:
 *
 *   'bg-default dark:bg-default-dark'                → 'bg-surface'
 *   'border-gray-300 dark:border-gray-700'           → 'border-line'
 *   'text-negative dark:text-negative-dark'          → 'tone-negative text-tone'
 *
 *   node build/color-roles/codemod.ts [--write] [paths…]     default: src/components, src/utils without their docs/
 *
 * Without `--write` it only reports. Either way it lists every palette color class it left, for review by hand:
 * one-sided classes, near-duplicate pairs, state variants on tones, and strings with more than one tone.
 */
import {globSync, readFileSync, statSync, writeFileSync} from 'node:fs'

/** `property:light|dark` → role utility. Only pairs whose role default is exactly the pair, plus agreed unifications. */
const NEUTRAL: Record<string, string> = {
  'text:black-default|default': 'text-accent',
  'text:black-default|gray-200': 'text-accent', // unification: dark text gray-200 → white
  'text:gray-400|gray-500': 'text-description',
  'text:gray-400|gray-600': 'text-subtle',
  'bg:default|default-dark': 'bg-surface',
  'bg:gray-100|gray-800': 'bg-surface-muted',
  'bg:gray-200|gray-700': 'bg-surface-inset',
  'bg:default/40|default-dark/60': 'bg-overlay',
  'bg:gray-300|gray-700': 'bg-track',
  'bg:gray-400|gray-500': 'bg-track-strong',
  'border:gray-300|gray-700': 'border-line',
  'border:gray-200|gray-700': 'border-line-subtle',
  'border:gray-200|gray-800': 'border-line-subtle', // unification: dark 800 → 700
  'border:gray-100|gray-800': 'border-line-subtle', // unification: light 100 → 200, dark 800 → 700
}

const TONES = ['primary', 'negative', 'positive', 'warning', 'info']

/** Tone pairs: `text-negative dark:text-negative-dark` → `text-tone` in `tone-negative`. */
const TONE_PROPS: Record<string, string> = {text: 'text-tone', border: 'border-tone'}

const PALETTE = /^(?:bg|text|border|outline|ring|fill|stroke|divide|from|via|to|shadow|placeholder|caret|accent|decoration)-(?:gray-\d+|primary(?:-[a-z]+)?|default(?:-dark)?|black-[a-z]+|negative(?:-dark)?|positive(?:-dark)?|warning(?:-dark)?|info(?:-dark)?)(?:\/\d+)?$/

type Token = {raw: string, variants: string, dark: boolean, prop: string, color: string}

const parse = (raw: string): Token | null => {
  const parts = raw.split(':')
  const utility = parts.pop() as string

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

type Result = {text: string, replaced: string[], left: string[]}

const transformClasses = (value: string): Result => {
  const words = value.split(/(\s+)/)
  const tokens = words.map(word => /\s/.test(word) ? null : parse(word))
  const replaced: string[] = []
  const tonesInString = new Set(tokens.flatMap(token => TONES.filter(tone => token?.color === tone || token?.color.startsWith(tone + '-') || token?.color.startsWith(tone + '/'))))
  let addTone: string | null = null

  tokens.forEach((light, index) => {
    if (!light || light.dark) return

    const darkIndex = tokens.findIndex(token => token?.dark && token.variants === light.variants && token.prop === light.prop)

    if (darkIndex === -1) return

    const dark = tokens[darkIndex] as Token
    // The same opacity on both sides maps to the role with that opacity: `bg-gray-100/50 dark:bg-gray-800/50` → `bg-surface-muted/50`.
    const [lightColor, lightAlpha] = light.color.split('/')
    const [darkColor, darkAlpha] = dark.color.split('/')
    const alpha = lightAlpha && lightAlpha === darkAlpha ? '/' + lightAlpha : ''
    const neutral = NEUTRAL[`${ light.prop }:${ light.color }|${ dark.color }`] ?? (alpha ? NEUTRAL[`${ light.prop }:${ lightColor }|${ darkColor }`]?.concat(alpha) : undefined)
    let next: string | null = null

    if (neutral) {
      next = light.variants + neutral
    } else {
      const tone = TONES.find(item => light.color === item && dark.color === item + '-dark')

      if (tone && TONE_PROPS[light.prop] && !light.variants && tonesInString.size === 1) {
        next = TONE_PROPS[light.prop]
        addTone = 'tone-' + tone
      }
    }

    if (!next) return

    replaced.push(`${ light.raw } ${ dark.raw } → ${ next }`)
    words[index] = next
    words[darkIndex] = ''
    tokens[index] = null
    tokens[darkIndex] = null
  })

  // Removed classes leave gaps: collapse them, drop spaces left before line breaks, keep the string's own edges.
  const [lead, trail] = [value.match(/^\s*/)?.[0] ?? '', value.match(/\s*$/)?.[0] ?? '']
  let text = lead + words.join('').trim().replace(/[ \t]{2,}/g, ' ').replace(/[ \t]+\n/g, '\n') + trail

  if (addTone && !text.split(/\s+/).includes(addTone)) text = addTone + ' ' + text

  return {text, replaced, left: tokens.filter((token): token is Token => !!token).map(token => token.raw)}
}

const args = process.argv.slice(2)
const write = args.includes('--write')
const roots = args.filter(arg => arg !== '--write')
const files = (roots.length ? roots : ['src/components', 'src/utils'])
  .flatMap(root => statSync(root).isDirectory() ? globSync(`${ root }/**/*.{vue,ts}`, {exclude: path => !roots.length && path.includes('/docs/')}) : [root])

let replacedCount = 0
const leftByFile = new Map<string, string[]>()

for (const file of files) {
  const source = readFileSync(file, 'utf8')
  const left: string[] = []

  // Every run of text between two consecutive quote characters. Class strings never contain quotes, so this finds each
  // one whatever the quoting around it — pairing quotes from the start of the file goes wrong on a stray apostrophe.
  // Runs between strings (`: isOpen,`) hold no palette pairs and come back unchanged.
  const output = source.replace(/(?<=["'`])[^"'`]+(?=["'`])/g, value => {
    if (!/(?:^|\s|:)(?:bg|text|border|outline|ring|fill|stroke|divide|from|via|to|shadow)-/.test(value)) return value

    const result = transformClasses(value)

    replacedCount += result.replaced.length
    left.push(...result.left)
    if (result.replaced.length && !write) console.log(`${ file }:`, result.replaced.join('; '))

    return result.text
  })

  if (left.length) leftByFile.set(file, left)
  if (write && output !== source) writeFileSync(file, output)
}

console.log(`\n${ replacedCount } pairs ${ write ? 'replaced' : 'replaceable' }`)
console.log(`${ [...leftByFile.values()].flat().length } palette classes left in ${ leftByFile.size } files:`)

for (const [file, left] of [...leftByFile].sort((a, b) => b[1].length - a[1].length)) console.log(`  ${ file }: ${ left.join(' ') }`)
