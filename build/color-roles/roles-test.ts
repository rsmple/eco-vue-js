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
  ['text-description', 'text-gray-500 dark:text-gray-400'],
  ['text-subtle', 'text-gray-400 dark:text-gray-600'],
  ['text-surface', 'text-default dark:text-default-dark'],
  ['bg-surface', 'bg-default dark:bg-default-dark'],
  ['bg-surface-muted', 'bg-gray-100 dark:bg-gray-800'],
  ['bg-surface-inset', 'bg-gray-200 dark:bg-gray-700'],
  ['bg-overlay', 'bg-default/40 dark:bg-default-dark/60'],
  ['bg-backdrop', 'bg-primary-light/40 dark:bg-primary-darkest/40'],
  ['bg-track', 'bg-gray-300 dark:bg-gray-700'],
  ['bg-track-strong', 'bg-gray-400 dark:bg-gray-500'],
  ['border border-line', 'border border-gray-300 dark:border-gray-700'],
  ['border border-line/50', 'border border-gray-300/50 dark:border-gray-700/50'],
  ['border border-line-subtle', 'border border-gray-200 dark:border-gray-700'],
  ['outline outline-line-raised', 'outline outline-gray-100 dark:outline-gray-800'],
  ['border border-focus outline outline-focus/20', 'border border-primary dark:border-primary-dark outline outline-primary/20 dark:outline-primary-dark/20'],
  ['tone-primary bg-tone-fill text-tone-on', 'bg-primary dark:bg-primary-dark text-white'],
  ['tone-primary surface-fill', 'bg-primary dark:bg-primary-dark text-white'],
  ['tone-primary border border-tone-fill', 'border border-primary dark:border-primary-dark'],
  ['tone-negative surface-fill', 'bg-negative dark:bg-negative-dark text-white'],
  ['tone-positive surface-fill', 'bg-positive dark:bg-positive-dark text-white'],
  ['tone-info surface-fill', 'bg-info dark:bg-info-dark text-white'],
  ['tone-warning surface-fill', 'bg-warning dark:bg-warning-dark text-black'],
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
<div id="root-surface" class="bg-surface">i</div><div id="root-tone" class="tone-negative text-tone">n</div>
<span id="ref-white" class="text-white">w</span>`

type Colors = Record<string, {color: string, background: string, border: string, outline: string}>

const buildCss = async () => {
  // White and black are references for derived on-colors; the kit's theme resets the palette, so they're added here.
  const source = '@import "tailwindcss";\n' + ['theme.css', 'roles.css', 'default.css'].map(file => readFileSync(CSS_DIR + file, 'utf8')).join('\n') + '\n@theme { --color-white: #fff; --color-black: #000; }'
  const compiler = await compile(source, {base: ROOT, onDependency: () => {}})
  const native = compiler.build([...new Set(HTML.match(/[\w:/.#[\]-]+/g))])
  const lowered = transform({filename: 'roles.css', code: Buffer.from(native), minify: true, targets: browserslistToTargets(browserslist(VITE_TARGETS))}).code.toString()

  if (!lowered.includes('--lightningcss-light')) throw new Error('Expected lightningcss to lower light-dark() at Vite targets')

  return {native, lowered}
}

/** Derived tone colors aren't palette classes: islands are checked against the same elements in the light run. */
const check = (colors: Colors, dark: boolean, light?: Colors) => {
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
  if (colors['on-teal'].color !== '255,255,255,255') errors.push(`derived on-color on teal: ${ colors['on-teal'].color }`)
  if (colors['on-yellow'].color !== '0,0,0,255') errors.push(`derived on-color on yellow: ${ colors['on-yellow'].color }`)
  if (colors['derived-soft'].background === '0,0,0,0') errors.push('derived surface-soft is empty')
  if (dark && light && colors['island-surface'].background !== light['root-surface'].background) errors.push(`.light island surface: ${ colors['island-surface'].background }`)
  if (dark && light && colors['island-tone'].color !== light['root-tone'].color) errors.push(`.light island tone: ${ colors['island-tone'].color }`)

  return errors
}

const css = await buildCss()
let failures = 0

for (const browserType of [chromium, firefox, webkit]) {
  const browser = await browserType.launch()
  const page = await browser.newPage()

  for (const [variant, styles] of Object.entries(css)) {
    let light: Colors | undefined

    for (const mode of ['light', 'dark']) {
      await page.setContent(`<html class="${ mode === 'dark' ? 'dark' : '' }"><style>${ styles }</style><body>${ HTML }</body></html>`)

      // Normalized to sRGB through a canvas: a derived `oklch(1 0 0)` and a palette `#fff` are the same color.
      const colors: Colors = await page.evaluate(() => {
        const context = document.createElement('canvas').getContext('2d', {willReadFrequently: true}) as CanvasRenderingContext2D
        const rgba = (color: string) => {
          context.clearRect(0, 0, 1, 1)
          context.fillStyle = color
          context.fillRect(0, 0, 1, 1)

          return context.getImageData(0, 0, 1, 1).data.join(',')
        }

        return Object.fromEntries([...document.querySelectorAll('[id]')].map(element => {
          const style = getComputedStyle(element)

          return [element.id, {color: rgba(style.color), background: rgba(style.backgroundColor), border: rgba(style.borderTopColor), outline: rgba(style.outlineColor)}]
        }))
      })
      const errors = check(colors, mode === 'dark', light)

      if (mode === 'light') light = colors

      failures += errors.length
      console.log(browserType.name().padEnd(9), variant.padEnd(8), mode.padEnd(6), errors.length ? 'FAIL\n  ' + errors.join('\n  ') : 'ok')
    }
  }

  await browser.close()
}

if (failures) process.exitCode = 1
