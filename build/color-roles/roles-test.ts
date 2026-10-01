/// <reference lib="dom" />
/* eslint-disable no-console */
/**
 * Checks that every color role renders exactly like the palette classes it replaces (plans/color-roles.md), and that
 * tones, scopes and mode islands behave — in Chromium, Firefox and WebKit, light and dark, with the CSS as Tailwind
 * emits it and as Vite 8's lightningcss minify lowers it (`light-dark()` → `--lightningcss-*` toggles).
 *
 *   node build/color-roles/roles-test.ts
 *
 * Add a row to `EQUIVALENT` for every role the codemod maps to.
 *
 * The DOM lib reference is for the `page.evaluate` callbacks, which run in the browser.
 */
import {compile} from '@tailwindcss/node'
import browserslist from 'browserslist'
import {browserslistToTargets, transform} from 'lightningcss'
import {chromium, firefox, webkit} from 'playwright-core'

import {readFileSync} from 'node:fs'
import {fileURLToPath} from 'node:url'

const ROOT = fileURLToPath(new URL('../..', import.meta.url))
const CSS_DIR = ROOT + 'package/tailwind-base/css/'

/** Vite 8's default `build.cssTarget`, which lowers `light-dark()`. */
const VITE_TARGETS = ['chrome 111', 'edge 111', 'firefox 114', 'safari 16.4']

/** [new classes, old classes]: computed colors must match in both modes. */
const EQUIVALENT: [string, string][] = [
  ['text-accent', 'text-black-default dark:text-default'],
  ['text-description', 'text-gray-400 dark:text-gray-500'],
  ['text-subtle', 'text-gray-400 dark:text-gray-600'],
  ['bg-surface', 'bg-default dark:bg-default-dark'],
  ['bg-surface-muted', 'bg-gray-100 dark:bg-gray-800'],
  ['bg-surface-inset', 'bg-gray-200 dark:bg-gray-700'],
  ['bg-overlay', 'bg-default/40 dark:bg-default-dark/60'],
  ['bg-track', 'bg-gray-300 dark:bg-gray-700'],
  ['bg-track-strong', 'bg-gray-400 dark:bg-gray-500'],
  ['border border-line', 'border border-gray-300 dark:border-gray-700'],
  ['border border-line-subtle', 'border border-gray-200 dark:border-gray-700'],
  ['border border-line/50', 'border border-gray-300/50 dark:border-gray-700/50'],
  ['outline outline-line-raised', 'outline outline-gray-100 dark:outline-gray-800'],
  ['border border-focus outline outline-focus/20', 'border border-primary dark:border-primary-dark outline outline-primary/20 dark:outline-primary-dark/20'],
  ['bg-backdrop', 'bg-primary-light/40 dark:bg-primary-darkest/40'],
  ['text-surface', 'text-default dark:text-default-dark'],
  ['tone-primary bg-tone-soft/30', 'bg-primary-light/30 dark:bg-primary-darkest/30'],
  ['tone-primary text-tone', 'text-primary dark:text-primary-dark'],
  ['tone-primary border border-tone', 'border border-primary dark:border-primary-dark'],
  ['tone-primary bg-tone-fill text-tone-on', 'bg-primary dark:bg-primary-dark text-default'],
  ['tone-primary surface-fill', 'bg-primary dark:bg-primary-dark text-default'],
  ['tone-primary bg-tone/10', 'bg-primary/10 dark:bg-primary-dark/10'],
  ['tone-primary bg-tone-soft', 'bg-primary-light dark:bg-primary-darkest'],
  ['tone-negative text-tone', 'text-negative dark:text-negative-dark'],
  ['tone-negative surface-fill', 'bg-negative dark:bg-negative-dark text-default'],
  ['tone-negative surface-soft', 'bg-negative/10 dark:bg-negative-dark/10'],
  ['tone-positive surface-fill', 'bg-positive dark:bg-positive-dark text-default'],
  ['tone-positive bg-tone-soft', 'bg-positive/10 dark:bg-positive-dark/10'],
  ['tone-info surface-fill', 'bg-info dark:bg-info-dark text-default'],
  ['tone-info bg-tone-soft', 'bg-info/10 dark:bg-info-dark/10'],
  ['tone-warning surface-fill', 'bg-warning dark:bg-warning-dark text-black-default dark:text-default-dark'],
  ['tone-warning bg-tone-soft', 'bg-warning/20 dark:bg-warning-dark/10'],
]

const HTML = `
${ EQUIVALENT.map(([next, prev], index) => `<div id="n${ index }" class="${ next }">x</div><div id="o${ index }" class="${ prev }">x</div>`).join('\n') }
<div class="tone-negative surface-fill">
  <span id="fill-accent" class="text-accent">a</span><span id="fill-description" class="text-description">d</span>
  <div class="surface"><span id="reset-accent" class="text-accent">r</span></div>
</div>
<div id="on-teal" class="tone-[#0f766e] surface-fill">t</div>
<div id="on-yellow" class="tone-[#ffda56] surface-fill">y</div>
<div id="derived-soft" class="tone-[#0f766e] surface-soft">s</div>
<div class="light"><div id="island-surface" class="bg-surface">i</div><div id="island-tone" class="tone-negative text-tone">n</div></div>
<span id="ref-white" class="text-default">w</span>`

type Colors = Record<string, {color: string, background: string, border: string, outline: string}>

const buildCss = async () => {
  const source = '@import "tailwindcss";\n' + ['theme.css', 'roles.css', 'default.css'].map(file => readFileSync(CSS_DIR + file, 'utf8')).join('\n')
  const compiler = await compile(source, {base: ROOT, onDependency: () => {}})
  const native = compiler.build([...new Set(HTML.match(/[\w:/.#[\]-]+/g))])
  const lowered = transform({filename: 'roles.css', code: Buffer.from(native), minify: true, targets: browserslistToTargets(browserslist(VITE_TARGETS))}).code.toString()

  if (!lowered.includes('--lightningcss-light')) throw new Error('Expected lightningcss to lower light-dark() at Vite targets')

  return {native, lowered}
}

const check = (colors: Colors, dark: boolean) => {
  const errors: string[] = []
  const white = colors['ref-white'].color

  EQUIVALENT.forEach(([next, prev], index) => {
    const a = colors['n' + index]
    const b = colors['o' + index]

    for (const key of ['color', 'background', 'border', 'outline'] as const) {
      if (key === 'outline' && !next.includes('outline')) continue
      if (a[key] !== b[key]) errors.push(`${ next } ≠ ${ prev } [${ key }] ${ a[key] } vs ${ b[key] }`)
    }
  })

  if (colors['fill-accent'].color !== white) errors.push(`text-accent inside surface-fill: ${ colors['fill-accent'].color }`)
  if (colors['fill-description'].color === white) errors.push('text-description inside surface-fill is not muted')
  if (!dark && colors['reset-accent'].color === white) errors.push('surface does not reset roles inside surface-fill')
  if (!/oklch\(1 0 0\)|255, 255, 255/.test(colors['on-teal'].color)) errors.push(`derived on-color on teal: ${ colors['on-teal'].color }`)
  if (!/oklch\(0 0 0\)|\(0, 0, 0\)/.test(colors['on-yellow'].color)) errors.push(`derived on-color on yellow: ${ colors['on-yellow'].color }`)
  if (colors['derived-soft'].background === 'rgba(0, 0, 0, 0)') errors.push('derived surface-soft is empty')
  if (dark && colors['island-surface'].background !== 'rgb(255, 255, 255)') errors.push(`.light island surface: ${ colors['island-surface'].background }`)
  if (dark && colors['island-tone'].color !== 'rgb(243, 85, 85)') errors.push(`.light island tone: ${ colors['island-tone'].color }`)

  return errors
}

const css = await buildCss()
let failures = 0

for (const browserType of [chromium, firefox, webkit]) {
  const browser = await browserType.launch()
  const page = await browser.newPage()

  for (const [variant, styles] of Object.entries(css)) {
    for (const mode of ['light', 'dark']) {
      await page.setContent(`<html class="${ mode === 'dark' ? 'dark' : '' }"><style>${ styles }</style><body>${ HTML }</body></html>`)

      const colors: Colors = await page.evaluate(() => Object.fromEntries([...document.querySelectorAll('[id]')].map(element => {
        const style = getComputedStyle(element)

        return [element.id, {color: style.color, background: style.backgroundColor, border: style.borderTopColor, outline: style.outlineColor}]
      })))
      const errors = check(colors, mode === 'dark')

      failures += errors.length
      console.log(browserType.name().padEnd(9), variant.padEnd(8), mode.padEnd(6), errors.length ? 'FAIL\n  ' + errors.join('\n  ') : 'ok')
    }
  }

  await browser.close()
}

if (failures) process.exitCode = 1
