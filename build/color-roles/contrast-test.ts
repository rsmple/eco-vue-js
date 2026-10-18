/// <reference lib="dom" />
/* eslint-disable no-console */
/**
 * WCAG contrast of every color role against what it sits on, in light and dark (plans/color-roles.md, phase 3), and
 * APCA for the black or white text on tone fills, which is what `text-tone-on` picks it by.
 * Colors are resolved by the browser from the real `roles.css`, so overrides and derived values are measured as
 * rendered; translucent colors are composited over their background first.
 *
 *   node build/color-roles/contrast-test.ts [--report] [--presets] [--random]
 *
 * Fails when a pair is under its minimum; `--report` prints every pair without failing. `--presets` also checks every
 * docs theme preset, with the CSS the playground gives an app. `--random` checks 12 themes of each style of the
 * playground's Random button, from a fixed seed so a failure repeats.
 *
 * A theme with a card or glass layout is also checked on the page background, in a section and in a card, as the
 * surface they end up as over the canvas. For glass that is over the plain canvas and over each spot of its gradient.
 *
 * The DOM lib reference is for the `page.evaluate` callback, which runs in the browser.
 */
import {compile} from '@tailwindcss/node'
import {chromium} from 'playwright-core'

import {readFileSync} from 'node:fs'
import {fileURLToPath} from 'node:url'

import {PRESETS, type PresetTokens, RANDOM_STYLES, expandTokens, getCanvasSamples, getRandomTokens, getThemeBlock} from '../../docs/.vitepress/themePresets.ts'

const ROOT = fileURLToPath(new URL('../..', import.meta.url))
const CSS_DIR = ROOT + 'package/tailwind-base/css/'

/** WCAG 2 minimums: 4.5 for text, 3 for large text, icons and the parts of a control that identify it. */
const TEXT = 4.5
const UI = 3

/** APCA Lc for the text on a fill: badges and button labels, so the minimum for body text rather than for headings. */
const ON_FILL = 60

/** `lightMin` replaces `min` when the fill takes black text; `apca` measures the pair by APCA Lc instead of WCAG. */
type Pair = {name: string, fg: string, bg: string, min: number, lightMin?: number, apca?: boolean, scope?: string}

const TONES = ['primary', 'negative', 'positive', 'warning', 'info']

/**
 * A light fill with black text, as warning's and a yellow primary's are, needs only to be told apart from the page:
 * the text on it and `text-tone` carry the contrast.
 */
const LIGHT_FILL = 1.5

/** Data tones: categories, not status, so only what makes them usable — readable text and a visible fill. */
const DATA_TONES = ['red', 'orange', 'amber', 'green', 'teal', 'cyan', 'blue', 'violet', 'fuchsia', 'pink', 'gray'].map(hue => 'data-' + hue)

const PAIRS: Pair[] = [
  {name: 'text-accent on surface', fg: 'text-accent', bg: 'bg-surface', min: 7},
  {name: 'text-accent on surface-muted', fg: 'text-accent', bg: 'bg-surface-muted', min: TEXT},
  {name: 'text-description on surface', fg: 'text-description', bg: 'bg-surface', min: TEXT},
  {name: 'text-description on surface-muted', fg: 'text-description', bg: 'bg-surface-muted', min: UI},
  {name: 'text-subtle on surface', fg: 'text-subtle', bg: 'bg-surface', min: 2},
  {name: 'text-accent on surface-raised', fg: 'text-accent', bg: 'bg-surface-raised', min: 7},
  {name: 'text-description on surface-raised', fg: 'text-description', bg: 'bg-surface-raised', min: TEXT},
  // Separators and field borders: visible, not WCAG 1.4.11's 3:1 — that would take gray-500 borders everywhere.
  {name: 'line on surface', fg: 'border-line', bg: 'bg-surface', min: 1.4},
  {name: 'line-subtle on surface', fg: 'border-line-subtle', bg: 'bg-surface', min: 1.2},
  // The edge of a dropdown against the page around it.
  {name: 'line-raised on surface', fg: 'border-line-raised', bg: 'bg-surface', min: 1.4},
  {name: 'focus on surface', fg: 'border-focus', bg: 'bg-surface', min: UI},
  {name: 'track on surface', fg: 'bg-track', bg: 'bg-surface', min: 1.3},
  ...TONES.flatMap(tone => [
    {name: `${ tone }: text-tone on surface`, fg: 'text-tone', bg: 'bg-surface', min: tone === 'warning' ? UI : TEXT, scope: 'tone-' + tone},
    {name: `${ tone }: border-tone-line on surface`, fg: 'border-tone-line', bg: 'bg-surface', min: UI, scope: 'tone-' + tone},
    {name: `${ tone }: text-tone-on on fill`, fg: 'text-tone-on', bg: 'bg-tone-fill', min: ON_FILL, apca: true, scope: 'tone-' + tone},
    {name: `${ tone }: fill on surface`, fg: 'bg-tone-fill', bg: 'bg-surface', min: UI, lightMin: LIGHT_FILL, scope: 'tone-' + tone},
    {name: `${ tone }: text-accent on soft`, fg: 'text-accent', bg: 'bg-tone-soft', min: 7, scope: 'tone-' + tone},
  ]),
  ...DATA_TONES.flatMap(tone => [
    {name: `${ tone }: text-tone on surface`, fg: 'text-tone', bg: 'bg-surface', min: TEXT, scope: 'tone-' + tone},
    {name: `${ tone }: text-tone-on on fill`, fg: 'text-tone-on', bg: 'bg-tone-fill', min: ON_FILL, apca: true, scope: 'tone-' + tone},
    {name: `${ tone }: fill on surface`, fg: 'bg-tone-fill', bg: 'bg-surface', min: tone === 'data-amber' ? 1.5 : UI, scope: 'tone-' + tone},
  ]),
]

const getPairsHtml = (prefix: string, only?: string[]) => PAIRS.map((pair, index) => only && !only.includes(pair.name) ? '' : `
  <div class="${ pair.scope ?? '' }">
    <div id="${ prefix }bg${ index }" class="${ pair.bg }"><div id="${ prefix }fg${ index }" class="${ pair.fg } ${ pair.lightMin ? 'text-tone-on' : '' } border">x</div></div>
  </div>`).join('')

/**
 * Where the pairs are measured: on the page, and for a card or glass layout in its containers and on its canvas. The
 * canvas carries the page's headings, and everything else sits in a section or a card: only the main text is checked
 * on it.
 */
type Context = {name: string, prefix: string, html: string}

const getContexts = (tokens: PresetTokens): Context[] => {
  const page = {name: '', prefix: 'page-', html: getPairsHtml('page-')}

  if (tokens.layout !== 'card' && tokens.layout !== 'glass') return [page]

  return [page, ...getCanvasSamples(tokens.layout, 'var(--test-canvas)').flatMap((canvas, index) => [
    {name: `on canvas ${ index }`, prefix: `c${ index }-`, html: `<div style="--w-surface: ${ canvas }">${ getPairsHtml(`c${ index }-`, ['text-accent on surface']) }</div>`},
    ...['surface-section', 'surface-card'].map(kind => ({
      name: `in ${ kind.slice(8) } ${ index }`,
      prefix: `${ kind }${ index }-`,
      html: `<div style="--w-canvas: ${ canvas }"><div class="${ kind }">${ getPairsHtml(`${ kind }${ index }-`) }</div></div>`,
    })),
  ])]
}

/** A theme's CSS as the playground gives it: the `@theme` block and the `w-*` tokens on `body`. */
const getThemeCss = (tokens: PresetTokens) => {
  const body = expandTokens(tokens).filter(([key]) => key.startsWith('w-'))

  return getThemeBlock(tokens) + (body.length ? `\nbody {${ body.map(([key, value]) => `--${ key }: ${ value };`).join(' ') }}` : '')
}

const html = getPairsHtml('page-')

/** Mulberry32: a small seeded generator, so the random themes are the same on every run. */
const seeded = (seed: number) => () => {
  seed = (seed + 0x6D2B79F5) | 0
  let value = Math.imul(seed ^ (seed >>> 15), 1 | seed)
  value = (value + Math.imul(value ^ (value >>> 7), 61 | value)) ^ value

  return ((value ^ (value >>> 14)) >>> 0) / 4294967296
}

const getSeededThemes = (count: number) => {
  const random = seeded(1)

  return RANDOM_STYLES.flatMap(style => Array.from({length: count}, () => {
    const tokens = getRandomTokens(style.id, undefined, random)

    return {name: `random ${ style.id } ${ getThemeBlock(tokens).split('\n').filter(line => !line.includes('gray-')).join(' ') }`, tokens}
  }))
}

// The canvas of the theme, read where it is defined, for the colors over it that the contexts mix.
const kitCss = '@import "tailwindcss";\n' + ['theme.css', 'roles.css', 'breakpoints.css', 'surfaces.css', 'default.css'].map(file => readFileSync(CSS_DIR + file, 'utf8')).join('\n') + '\n:root, .dark { --test-canvas: var(--w-canvas); }'
const candidates = [...new Set((html + ' surface-section surface-card').match(/[\w:/.#[\]-]+/g))]
const themes: {name: string, tokens: PresetTokens}[] = [
  {name: 'default', tokens: {}},
  ...process.argv.includes('--presets') ? PRESETS.filter(preset => preset.id !== 'default').map(preset => ({name: preset.id, tokens: preset.tokens as PresetTokens})) : [],
  ...process.argv.includes('--random') ? getSeededThemes(12) : [],
]

const browser = await chromium.launch()
const page = await browser.newPage()
const report = process.argv.includes('--report')
let failures = 0

for (const theme of themes) {
  const compiler = await compile(kitCss + '\n' + getThemeCss(theme.tokens), {base: ROOT, onDependency: () => {}})
  const css = compiler.build(candidates)

  for (const mode of ['light', 'dark']) for (const context of getContexts(theme.tokens)) {

    await page.setContent(`<html class="${ mode === 'dark' ? 'dark' : '' }"><style>${ css }</style><body class="bg-surface">${ context.html }</body></html>`)

    const ratios: {name: string, ratio: number, min: number}[] = await page.evaluate(({pairs, prefix}) => {
      const context = document.createElement('canvas').getContext('2d', {willReadFrequently: true}) as CanvasRenderingContext2D

      /** Any CSS color → sRGB 0–255 and alpha 0–1, via the canvas. */
      const toRgba = (color: string) => {
        context.clearRect(0, 0, 1, 1)
        context.fillStyle = color
        context.fillRect(0, 0, 1, 1)
        const [r, g, b, a] = context.getImageData(0, 0, 1, 1).data

        return {rgb: [r, g, b], alpha: a / 255}
      }
      const over = (top: string, bottom: number[]) => {
        const {rgb, alpha} = toRgba(top)

        return rgb.map((value, index) => value * alpha + bottom[index] * (1 - alpha))
      }
      const luminance = (rgb: number[]) => {
        const [r, g, b] = rgb.map(value => (value /= 255) <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4)

        return 0.2126 * r + 0.7152 * g + 0.0722 * b
      }
      /** APCA Lc of text on a background, as a positive number either way round. */
      const apca = (text: number[], background: number[]) => {
        const [t, bg] = [text, background].map(rgb => {
          const [r, g, b] = rgb.map(value => (value / 255) ** 2.4)
          const y = 0.2126729 * r + 0.7151522 * g + 0.0721750 * b

          return y > 0.022 ? y : y + (0.022 - y) ** 1.414
        })
        const lc = bg > t ? (bg ** 0.56 - t ** 0.57) * 1.14 : (t ** 0.62 - bg ** 0.65) * 1.14

        return lc < 0.001 ? 0 : (lc - 0.027) * 100
      }
      const bodyRgb = toRgba(getComputedStyle(document.body).backgroundColor).rgb

      return pairs.flatMap((pair, index) => {
        const fgElement = document.getElementById(prefix + 'fg' + index)

        if (!fgElement) return []

        const bgStyle = getComputedStyle(document.getElementById(prefix + 'bg' + index) as HTMLElement)
        const fgStyle = getComputedStyle(fgElement)
        const bg = over(bgStyle.backgroundColor, bodyRgb)
        const property = pair.fg.startsWith('border') ? fgStyle.borderTopColor : pair.fg.startsWith('bg') ? fgStyle.backgroundColor : fgStyle.color
        const fg = over(property, bg)
        if (pair.apca) return [{name: pair.name, ratio: apca(fg, bg), min: pair.min}]

        const [light, dark] = [luminance(fg), luminance(bg)].sort((a, b) => b - a)
        const blackText = pair.lightMin !== undefined && luminance(toRgba(fgStyle.color).rgb) < 0.5

        return [{name: pair.name, ratio: (light + 0.05) / (dark + 0.05), min: blackText ? pair.lightMin as number : pair.min}]
      })
    }, {pairs: PAIRS, prefix: context.prefix})

    console.log(`\n${ theme.name } ${ mode }${ context.name ? ' ' + context.name : '' }`)

    for (const {name, ratio, min} of ratios) {
      const ok = ratio >= min

      if (!ok) failures++
      if (report || !ok) console.log(`  ${ ok ? '  ' : '✗ ' }${ name.padEnd(36) } ${ ratio.toFixed(2).padStart(5) }  (min ${ min })`)
    }
  }
}

await browser.close()

console.log(`\n${ failures } pairs under their minimum`)
if (failures && !report) process.exitCode = 1
