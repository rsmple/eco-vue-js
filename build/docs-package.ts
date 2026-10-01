/**
 * Copies the docs into `package/docs/` as plain Markdown, with an `llms.txt` index, so coding agents working in an app
 * read the docs of the version it has installed, without network.
 *
 * The source pages are complete on their own (see docs-generate.ts); this drops what only renders on the site: the
 * frontmatter, comments, live demos and `<llm-exclude>` blocks. Links between pages point to the copied files; links to
 * pages that are not copied (releases) go to the GitHub releases.
 */
import {existsSync, globSync, mkdirSync, readFileSync, rmSync, writeFileSync} from 'node:fs'
import path from 'node:path'

import {GROUPS, readFrontmatter, rewrite} from '../docs/.vitepress/sidebar.ts'

const ROOT = path.resolve(import.meta.dirname, '..')
const OUTPUT = path.join(ROOT, 'package/docs')
const PAGE_GLOBS = ['docs/**/*.md', 'src/components/*/docs/*.md']
const PAGE_EXCLUDE = ['docs/.vitepress/**', 'docs/index.md', 'docs/releases.md']
const SITE_URL = 'https://rsmple.github.io/eco-vue-js/'
const RELEASES_URL = 'https://github.com/rsmple/eco-vue-js/releases'

type Page = {file: string, out: string, group: string, order: number, title: string, description: string}

/** Outside code fences: drops comments, `<llm-exclude>` and `<ClientOnly>` blocks and lines holding only a component tag. */
const stripSiteOnly = (content: string): string => {
  const result: string[] = []
  let fence = false
  let skip: string | null = null

  for (const line of content.split('\n')) {
    if (/^\s*```/.test(line)) fence = !fence

    if (!fence) {
      if (skip) {
        if (line.trim() === skip) skip = null
        continue
      }

      const block = /^\s*<(llm-exclude|ClientOnly)>\s*$/.exec(line)
      if (block) {
        skip = `</${ block[1] }>`
        continue
      }

      if (/^\s*<!--.*-->\s*$/.test(line) || /^\s*<[A-Z][\w]*(\s[^>]*)?\/>\s*$/.test(line)) continue
    }

    result.push(line)
  }

  return dropEmptySections(result.join('\n').replace(/\n{3,}/g, '\n\n').trim()) + '\n'
}

/** A section that only held demos, like Theming's Preview, is left with its heading alone. */
const dropEmptySections = (content: string): string => content.replace(
  /^(#{2,6}) .+\n\n(?=(#{1,6}) )/gm,
  (match, level: string, next: string) => next.length <= level.length ? '' : match,
)

const rewriteLinks = (content: string, out: string, outputs: Set<string>): string => {
  const dir = path.posix.dirname(out)

  return content.replace(/\]\(([^)\s]+)\)/g, (match, target: string) => {
    if (/^(https?:|mailto:|#)/.test(target)) return match

    const [pathname, hash] = target.split('#', 2)
    const page = pathname.startsWith('/')
      ? pathname.slice(1)
      : path.posix.join(dir, pathname)
    const file = page.endsWith('.md') ? page : `${ page.replace(/\/$/, '') }.md`

    if (!outputs.has(file)) return `](${ page === 'releases' ? RELEASES_URL : SITE_URL + page }${ hash ? `#${ hash }` : '' })`

    const relative = path.posix.relative(dir, file)

    return `](${ relative.startsWith('.') ? relative : `./${ relative }` }${ hash ? `#${ hash }` : '' })`
  })
}

const readPages = (): Page[] => globSync(PAGE_GLOBS, {cwd: ROOT, exclude: PAGE_EXCLUDE})
  .map(file => file.split(path.sep).join('/'))
  .map(file => {
    const content = readFileSync(path.join(ROOT, file), 'utf8')
    const frontmatter = readFrontmatter(content)

    return {
      file,
      out: rewrite(file),
      group: frontmatter.group ?? '',
      order: frontmatter.order ? Number(frontmatter.order) : Infinity,
      title: frontmatter.title ?? /^# (.+)$/m.exec(content)?.[1] ?? file,
      description: frontmatter.description ?? '',
    }
  })
  .sort((a, b) => a.order - b.order || a.title.localeCompare(b.title))

const getIndex = (pages: Page[], version: string): string => {
  const sections = GROUPS
    .map(group => ({group, items: pages.filter(page => page.group === group)}))
    .filter(section => section.items.length)
    .map(section => `## ${ section.group }\n\n${ section.items.map(page => `- [${ page.title }](./${ page.out })${ page.description ? `: ${ page.description }` : '' }`).join('\n') }`)

  return [
    '# eco-vue-js',
    '',
    `> Vue 3 UI kit with Tailwind v4 — components, utilities, icons and recipes. These are the docs of version ${ version }, the one installed next to them. Start with Getting started and Conventions; each component page lists its props, events and slots with examples.`,
    '',
    `Release notes, for what changed between versions: ${ RELEASES_URL }. The docs site, with live demos: ${ SITE_URL }`,
    '',
    ...sections.join('\n\n').split('\n'),
    '',
  ].join('\n')
}

export const writeDocs = () => {
  const {version} = JSON.parse(readFileSync(path.join(ROOT, 'package.json'), 'utf8')) as {version: string}
  const pages = readPages()
  const outputs = new Set(pages.map(page => page.out))

  if (existsSync(OUTPUT)) rmSync(OUTPUT, {recursive: true, force: true})

  for (const page of pages) {
    const content = readFileSync(path.join(ROOT, page.file), 'utf8').replace(/^---\n[\s\S]*?\n---\n/, '')
    const target = path.join(OUTPUT, page.out)

    mkdirSync(path.dirname(target), {recursive: true})
    writeFileSync(target, rewriteLinks(stripSiteOnly(content), page.out, outputs))
  }

  writeFileSync(path.join(OUTPUT, 'llms.txt'), getIndex(pages, version))
}
