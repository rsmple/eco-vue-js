/* eslint-disable no-console */
/**
 * Writes docs/releases.md from the GitHub releases, which are the changelog. The file is generated on every docs
 * build rather than committed: the docs deploy on `release: published`, so the release that triggered it is included.
 *
 * Bare component names in the notes (WTabs) link to their docs page, found by the `@api` markers.
 * Uses GITHUB_TOKEN when set. Without network the page falls back to a link, except on CI, where it fails.
 */
import {existsSync} from 'node:fs'
import {glob, readFile, writeFile} from 'node:fs/promises'
import path from 'node:path'

import {rewrite} from '../docs/.vitepress/sidebar.ts'

const ROOT = path.resolve(import.meta.dirname, '..')
const OUTPUT = path.join(ROOT, 'docs/releases.md')
const REPO = 'rsmple/eco-vue-js'
const RELEASES_URL = `https://github.com/${ REPO }/releases`

type Release = {tag_name: string, html_url: string, body: string | null, draft: boolean, prerelease: boolean, published_at: string}

const fetchReleases = async (): Promise<Release[]> => {
  const headers: Record<string, string> = {Accept: 'application/vnd.github+json', 'X-GitHub-Api-Version': '2022-11-28'}
  if (process.env.GITHUB_TOKEN) headers.Authorization = `Bearer ${ process.env.GITHUB_TOKEN }`

  const result: Release[] = []

  for (let page = 1; ; page++) {
    const response = await fetch(`https://api.github.com/repos/${ REPO }/releases?per_page=100&page=${ page }`, {headers})
    if (!response.ok) throw new Error(`GitHub API responded ${ response.status } ${ response.statusText }`)

    const list = await response.json() as Release[]
    result.push(...list)
    if (list.length < 100) return result
  }
}

const findComponentPages = async (): Promise<Map<string, string>> => {
  const pages = new Map<string, string>()

  for await (const file of glob('src/components/*/docs/*.md', {cwd: ROOT})) {
    const link = '/' + rewrite(file.split(path.sep).join('/')).replace(/\.md$/, '')

    for (const match of (await readFile(path.join(ROOT, file), 'utf8')).matchAll(/<!-- @api (\w+) -->/g)) {
      if (!pages.has(match[1])) pages.set(match[1], link)
    }
  }

  return pages
}

// Links the first mention of each component in a release, and escapes `{{` so hand-written notes are never compiled
// as a Vue interpolation. Code spans are left alone: VitePress already escapes them, and
// `eco-vue-js/dist/components/List/WListCard.vue` stays a path.
const formatBody = (body: string, pages: Map<string, string>) => {
  const linked = new Set<string>()

  return body
    .split(/(`[^`\n]*`)/)
    .map(part => part.startsWith('`') ? part : part
      .replace(/\{\{/g, '&#123;&#123;')
      .replace(/\bW[A-Z]\w*\b/g, name => {
        if (!pages.has(name) || linked.has(name)) return name
        linked.add(name)
        return `[${ name }](${ pages.get(name) })`
      }))
    .join('')
}

const renderRelease = (release: Release, pages: Map<string, string>) => {
  const body = (release.body ?? '').replace(/\r\n/g, '\n').trim()
  const breaking = /\*\*Breaking\*\*/.test(body) ? ' <Badge type="danger" text="breaking" />' : ''

  return [
    `### ${ release.tag_name }${ breaking }`,
    '',
    `<small>${ release.published_at.slice(0, 10) } · [GitHub](${ release.html_url })</small>`,
    '',
    body ? formatBody(body, pages) : '_No notes._',
  ].join('\n')
}

const renderPage = (releases: Release[], pages: Map<string, string>) => {
  const minors = new Map<string, Release[]>()

  for (const release of releases) {
    const minor = release.tag_name.replace(/^v/, '').split('.').slice(0, 2).join('.')
    minors.set(minor, [...minors.get(minor) ?? [], release])
  }

  return [
    '---',
    'group: Guide',
    'order: 99',
    'title: Releases',
    'description: Release notes for every eco-vue-js version, newest first — what changed in each component and what breaks on upgrade.',
    '---',
    '',
    '# Releases',
    '',
    `Every version published to npm, newest first. The same notes are on [GitHub Releases](${ RELEASES_URL }).`,
    ...[...minors].flatMap(([minor, list]) => ['', `## ${ minor }`, ...list.map(release => `\n${ renderRelease(release, pages) }`)]),
    '',
  ].join('\n')
}

const fallbackPage = (reason: string) => [
  '---',
  'group: Guide',
  'order: 99',
  'title: Releases',
  '---',
  '',
  '# Releases',
  '',
  `Release notes could not be loaded (${ reason }). See [GitHub Releases](${ RELEASES_URL }).`,
  '',
].join('\n')

let content: string

try {
  const releases = (await fetchReleases())
    .filter(release => !release.draft && !release.prerelease)
    .sort((a, b) => b.published_at.localeCompare(a.published_at))

  content = renderPage(releases, await findComponentPages())
  console.log(`Wrote ${ releases.length } releases to ${ path.relative(ROOT, OUTPUT) }`)
} catch (error) {
  if (process.env.CI) throw error

  const reason = error instanceof Error ? error.message : String(error)

  // Keep a page fetched earlier rather than replacing it with the fallback.
  if (existsSync(OUTPUT)) {
    console.warn(`Could not fetch releases (${ reason }), keeping the existing ${ path.relative(ROOT, OUTPUT) }`)
    process.exit(0)
  }

  content = fallbackPage(reason)
  console.warn(`Could not fetch releases (${ reason }), wrote a fallback page`)
}

await writeFile(OUTPUT, content, 'utf8')
