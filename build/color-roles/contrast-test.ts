/// <reference lib="dom" />
/* eslint-disable no-console */
/**
 * WCAG contrast of every color role against what it sits on, in light and dark (plans/color-roles.md, phase 3).
 * Colors are resolved by the browser from the real `roles.css`, so overrides and derived values are measured as
 * rendered; translucent colors are composited over their background first.
 *
 *   node build/color-roles/contrast-test.ts [--report]
 *
 * Fails when a pair is under its minimum; `--report` prints every pair without failing.
 *
 * The DOM lib reference is for the `page.evaluate` callback, which runs in the browser.
 */
import {compile} from '@tailwindcss/node'
import {chromium} from 'playwright-core'

import {readFileSync} from 'node:fs'
import {fileURLToPath} from 'node:url'

const ROOT = fileURLToPath(new URL('../..', import.meta.url))
const CSS_DIR = ROOT + 'package/tailwind-base/css/'

/** WCAG 2 minimums: 4.5 for text, 3 for large text, icons and the parts of a control that identify it. */
const TEXT = 4.5
const UI = 3

type Pair = {name: string, fg: string, bg: string, min: number, scope?: string}

const TONES = ['primary', 'negative', 'positive', 'warning', 'info']

const PAIRS: Pair[] = [
  {name: 'text-accent on surface', fg: 'text-accent', bg: 'bg-surface', min: 7},
  {name: 'text-accent on surface-muted', fg: 'text-accent', bg: 'bg-surface-muted', min: TEXT},
  {name: 'text-description on surface', fg: 'text-description', bg: 'bg-surface', min: TEXT},
  {name: 'text-description on surface-muted', fg: 'text-description', bg: 'bg-surface-muted', min: UI},
  {name: 'text-subtle on surface', fg: 'text-subtle', bg: 'bg-surface', min: 2},
  // Separators and field borders: visible, not WCAG 1.4.11's 3:1 — that would take gray-500 borders everywhere.
  {name: 'line on surface', fg: 'border-line', bg: 'bg-surface', min: 1.4},
  {name: 'line-subtle on surface', fg: 'border-line-subtle', bg: 'bg-surface', min: 1.2},
  {name: 'focus on surface', fg: 'border-focus', bg: 'bg-surface', min: UI},
  {name: 'track on surface', fg: 'bg-track', bg: 'bg-surface', min: 1.3},
  ...TONES.flatMap(tone => [
    {name: `${ tone }: text-tone on surface`, fg: 'text-tone', bg: 'bg-surface', min: tone === 'warning' ? UI : TEXT, scope: 'tone-' + tone},
    {name: `${ tone }: text-tone-on on fill`, fg: 'text-tone-on', bg: 'bg-tone-fill', min: TEXT, scope: 'tone-' + tone},
    {name: `${ tone }: fill on surface`, fg: 'bg-tone-fill', bg: 'bg-surface', min: tone === 'warning' ? 1.5 : UI, scope: 'tone-' + tone},
    {name: `${ tone }: text-accent on soft`, fg: 'text-accent', bg: 'bg-tone-soft', min: 7, scope: 'tone-' + tone},
  ]),
]

const html = PAIRS.map((pair, index) => `
  <div class="${ pair.scope ?? '' }">
    <div id="bg${ index }" class="${ pair.bg }"><div id="fg${ index }" class="${ pair.fg } border">x</div></div>
  </div>`).join('')

const source = '@import "tailwindcss";\n' + ['theme.css', 'roles.css', 'default.css'].map(file => readFileSync(CSS_DIR + file, 'utf8')).join('\n')
const compiler = await compile(source, {base: ROOT, onDependency: () => {}})
const css = compiler.build([...new Set(html.match(/[\w:/.#[\]-]+/g))])

const browser = await chromium.launch()
const page = await browser.newPage()
const report = process.argv.includes('--report')
let failures = 0

for (const mode of ['light', 'dark']) {
  await page.setContent(`<html class="${ mode === 'dark' ? 'dark' : '' }"><style>${ css }</style><body class="bg-surface">${ html }</body></html>`)

  const ratios: {name: string, ratio: number, min: number}[] = await page.evaluate(pairs => {
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
    const bodyRgb = toRgba(getComputedStyle(document.body).backgroundColor).rgb

    return pairs.map((pair, index) => {
      const fgElement = document.getElementById('fg' + index) as HTMLElement
      const bgStyle = getComputedStyle(document.getElementById('bg' + index) as HTMLElement)
      const fgStyle = getComputedStyle(fgElement)
      const bg = over(bgStyle.backgroundColor, bodyRgb)
      const property = pair.fg.startsWith('border') ? fgStyle.borderTopColor : pair.fg.startsWith('bg') ? fgStyle.backgroundColor : fgStyle.color
      const fg = over(property, bg)
      const [light, dark] = [luminance(fg), luminance(bg)].sort((a, b) => b - a)

      return {name: pair.name, ratio: (light + 0.05) / (dark + 0.05), min: pair.min}
    })
  }, PAIRS)

  console.log(`\n${ mode }`)

  for (const {name, ratio, min} of ratios) {
    const ok = ratio >= min

    if (!ok) failures++
    if (report || !ok) console.log(`  ${ ok ? '  ' : '✗ ' }${ name.padEnd(36) } ${ ratio.toFixed(2).padStart(5) }  (min ${ min })`)
  }
}

await browser.close()

console.log(`\n${ failures } pairs under their minimum`)
if (failures && !report) process.exitCode = 1
