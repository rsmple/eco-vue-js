/// <reference lib="dom" />
/* eslint-disable no-console */
/**
 * Compares the computed colors of every element on every docs page, in light and dark, between two docs builds — the
 * gate for the color roles migration (plans/color-roles.md). Unlike a pixel diff it names the element and the property
 * that changed.
 *
 *   npx vitepress build docs --outDir <dir>
 *   node build/color-roles/color-diff.ts dump <dir> <out.json>
 *   node build/color-roles/color-diff.ts diff <base.json> <new.json>
 *
 * Elements are matched by their path in the DOM, so both builds must render the same markup.
 *
 * The DOM lib reference is for the `page.evaluate` callbacks, which run in the browser.
 */
import {chromium} from 'playwright-core'

import {createReadStream, existsSync, globSync, readFileSync, statSync, writeFileSync} from 'node:fs'
import {createServer} from 'node:http'
import {type AddressInfo} from 'node:net'
import {extname, join} from 'node:path'

type Row = [path: string, ...values: string[]]
type Snapshot = {props: string[], result: Record<string, Row[]>}

const BASE = '/eco-vue-js/'

const PROPS = [
  'color',
  'background-color',
  'background-image',
  'border-top-color',
  'border-right-color',
  'border-bottom-color',
  'border-left-color',
  'outline-color',
  'box-shadow',
  'fill',
  'stroke',
  'text-decoration-color',
  'caret-color',
  '-webkit-text-fill-color',
]

const TYPES: Record<string, string> = {
  '.html': 'text/html',
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.svg': 'image/svg+xml',
  '.json': 'application/json',
  '.woff2': 'font/woff2',
  '.png': 'image/png',
}

/** Serves a VitePress build under its base, with clean URLs. */
const serve = (dist: string) => createServer((req, res) => {
  let file = join(dist, decodeURIComponent((req.url ?? '/').split('?')[0]).replace(BASE, '/'))

  if (existsSync(file) && statSync(file).isDirectory()) file = join(file, 'index.html')
  if (!existsSync(file) && existsSync(file + '.html')) file += '.html'
  if (!existsSync(file)) {
    res.writeHead(404).end()
    return
  }

  res.writeHead(200, {'content-type': TYPES[extname(file)] ?? 'application/octet-stream'})
  createReadStream(file).pipe(res)
}).listen(0)

const dump = async (dist: string, out: string) => {
  const server = serve(dist)
  const origin = `http://localhost:${ (server.address() as AddressInfo).port }`
  const pages = globSync('**/*.html', {cwd: dist}).filter(page => page !== '404.html').map(page => page.replace(/(index)?\.html$/, ''))
  const browser = await chromium.launch()
  const result: Snapshot['result'] = {}

  for (const mode of ['light', 'dark'] as const) {
    const context = await browser.newContext({viewport: {width: 1280, height: 900}, reducedMotion: 'reduce', colorScheme: mode})
    await context.addInitScript(value => localStorage.setItem('vitepress-theme-appearance', value), mode)
    const page = await context.newPage()

    for (const path of pages) {
      await page.goto(origin + BASE + path, {waitUntil: 'networkidle'})
      await page.waitForTimeout(300)

      result[`${ mode } /${ path }`] = await page.evaluate(props => {
        const getPath = (element: Element) => {
          const parts: string[] = []

          for (let item: Element | null = element; item && item !== document.body; item = item.parentElement) {
            parts.unshift(`${ item.tagName.toLowerCase() }${ item.id ? '#' + item.id : '' }:${ [...item.parentElement?.children ?? []].indexOf(item) }`)
          }

          return parts.join('>')
        }

        return [...document.body.querySelectorAll('*')].map(element => {
          const style = getComputedStyle(element)

          return [getPath(element), ...props.map(prop => style.getPropertyValue(prop))] as Row
        })
      }, PROPS)
    }

    await context.close()
  }

  writeFileSync(out, JSON.stringify({props: PROPS, result} satisfies Snapshot))
  console.log(`${ pages.length } pages, ${ Object.keys(result).length } snapshots → ${ out }`)

  await browser.close()
  server.close()
}

/** Prints changes grouped by `property: before → after`, most frequent first. Exits 1 when anything changed. */
const diff = (fileA: string, fileB: string) => {
  const a = JSON.parse(readFileSync(fileA, 'utf8')) as Snapshot
  const b = JSON.parse(readFileSync(fileB, 'utf8')) as Snapshot
  const groups = new Map<string, {count: number, examples: string[]}>()
  let unmatched = 0

  for (const [snapshot, rowsA] of Object.entries(a.result)) {
    const rowsB = b.result[snapshot]

    if (!rowsB) {
      console.log('missing snapshot', snapshot)
      continue
    }

    const byPath = new Map(rowsB.map(row => [row[0], row]))

    for (const rowA of rowsA) {
      const rowB = byPath.get(rowA[0])

      if (!rowB) {
        unmatched++
        continue
      }

      a.props.forEach((prop, index) => {
        if (rowA[index + 1] === rowB[index + 1]) return

        const key = `${ prop }: ${ rowA[index + 1] } → ${ rowB[index + 1] }`
        const group = groups.get(key) ?? {count: 0, examples: []}

        group.count++
        if (group.examples.length < 3) group.examples.push(`${ snapshot } ${ rowA[0].split('>').slice(-3).join('>') }`)
        groups.set(key, group)
      })
    }
  }

  const sorted = [...groups].sort((x, y) => y[1].count - x[1].count)

  console.log(`${ sorted.length } changed groups, ${ unmatched } unmatched elements`)

  for (const [key, group] of sorted) {
    console.log(String(group.count).padStart(5), key)
    for (const example of group.examples) console.log('        ', example)
  }

  if (sorted.length || unmatched) process.exitCode = 1
}

const [command, first, second] = process.argv.slice(2)

if (command === 'dump' && first && second) await dump(first, second)
else if (command === 'diff' && first && second) diff(first, second)
else {
  console.log('Usage: color-diff.ts dump <distDir> <out.json> | diff <base.json> <new.json>')
  process.exitCode = 1
}
