/* eslint-disable no-console */
/**
 * Pins what `generateSeededTheme` makes: apps store only a theme's seed and version, so a version must give the same
 * theme forever. Fails when a pinned seed's theme changes; keep the old version as it was and add a new one instead.
 *
 *   node build/theme-seed-test.ts [--write]
 *
 * `--write` records the current output, for a new version only.
 */
import {readFileSync, writeFileSync} from 'node:fs'
import {registerHooks} from 'node:module'
import {fileURLToPath} from 'node:url'

registerHooks({
  resolve: (specifier, context, nextResolve) => {
    const isRelative = specifier.startsWith('./') || specifier.startsWith('../')

    return nextResolve(isRelative && !/\.\w+$/.test(specifier) ? `${ specifier }.ts` : specifier, context)
  },
})

const {SEEDED_THEME_VERSIONS, generateSeededTheme} = await import('../src/utils/themeSeed.ts')

const SNAPSHOT_PATH = fileURLToPath(new URL('./theme-seed-snapshot.json', import.meta.url))

const SEEDS = [
  '0000000000000000000000000000000000000000000000000000000000000000',
  '9f86d081884c7d659a2feaa0c55ad015a3bf4f1b2b0b822cd15d6c15b0f00a08',
  'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
  '2c26b46b68ffc68ff99b453c1d30413413422d706483bfa0f98a5e886266e7ae',
  'fcde2b2edba56bf408601fb721fe9b5c338d10ee429ea04fae5511b68fbf8fb9',
  'baa5a0964d3320fbc0c6a922140453c8513ea24ab8fd0577034804a967248096',
  '5994471abb01112afcc18159f6cc74b4f511b99806da59b3caf5a9c173cacfc5',
  'ab'.repeat(32),
]

const current = Object.fromEntries(SEEDED_THEME_VERSIONS.map(version => [
  version,
  Object.fromEntries(SEEDS.map(seed => [seed, generateSeededTheme(seed, version)])),
]))

if (process.argv.includes('--write')) {
  writeFileSync(SNAPSHOT_PATH, JSON.stringify(current, null, 2) + '\n')
  console.log(`Wrote ${ SNAPSHOT_PATH }`)
  process.exit(0)
}

const pinned = JSON.parse(readFileSync(SNAPSHOT_PATH, 'utf-8')) as Record<string, Record<string, unknown>>
const failures: string[] = []

for (const version of SEEDED_THEME_VERSIONS) {
  if (!pinned[version]) {
    failures.push(`${ version } has no pinned themes: run with --write once it is final`)
    continue
  }

  for (const seed of SEEDS) {
    if (JSON.stringify(pinned[version][seed]) !== JSON.stringify(current[version]![seed])) failures.push(`${ version } ${ seed }`)
  }
}

if (failures.length) {
  console.error('Seeded themes changed, which would re-skin every stored theme:\n' + failures.map(line => `  ${ line }`).join('\n'))
  process.exit(1)
}

console.log(`Seeded themes unchanged: ${ SEEDED_THEME_VERSIONS.join(', ') } × ${ SEEDS.length } seeds`)
