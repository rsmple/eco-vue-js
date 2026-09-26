import type {DefaultTheme} from 'vitepress'

import {globSync, readFileSync} from 'node:fs'
import path from 'node:path'

/**
 * The sidebar is built from the pages themselves: a page joins the group named by its `group` frontmatter,
 * sorted by `order` and then by title (its `title` frontmatter or first heading). Pages without `group`
 * (the home page) stay out of it. Nav icons for the groups are in DocsNav.
 */
export const GROUPS = ['Guide', 'Actions', 'Controls', 'Data', 'Overlays', 'Assets', 'Recipes'] as const

export type Group = typeof GROUPS[number]

const PAGE_GLOBS = ['docs/**/*.md', 'src/components/*/docs/*.md']
const PAGE_EXCLUDE = ['docs/.vitepress/**']

/** Guides and recipes keep their path under docs/; component pages drop their folder: Button/docs/button-group.md → components/button-group.md. */
export const rewrite = (file: string) => file
  .replace(/^docs\//, '')
  .replace(/^src\/components\/[^/]+\/docs\//, 'components/')

type Page = {group: string, order: number, title: string, link: string}

const readFrontmatter = (content: string): Record<string, string> => {
  const block = /^---\n([\s\S]*?)\n---/.exec(content)?.[1] ?? ''

  // Only flat `key: value` lines are needed here.
  return Object.fromEntries(block.split('\n').map(line => /^(\w+):\s*(.+)$/.exec(line)).filter(match => !!match).map(match => [match[1], match[2].trim()]))
}

const readPage = (root: string, file: string): Page | null => {
  const content = readFileSync(path.join(root, file), 'utf8')
  const frontmatter = readFrontmatter(content)

  if (!frontmatter.group) return null

  if (!(GROUPS as readonly string[]).includes(frontmatter.group)) {
    throw new Error(`${ file }: unknown group "${ frontmatter.group }", expected one of ${ GROUPS.join(', ') }`)
  }

  const title = frontmatter.title ?? /^# (.+)$/m.exec(content)?.[1]

  if (!title) throw new Error(`${ file }: no title frontmatter or heading for the sidebar`)

  return {
    group: frontmatter.group,
    order: frontmatter.order ? Number(frontmatter.order) : Infinity,
    title,
    link: '/' + rewrite(file).replace(/\.md$/, ''),
  }
}

export const buildSidebar = (root: string): DefaultTheme.SidebarItem[] => {
  const pages = globSync(PAGE_GLOBS, {cwd: root, exclude: PAGE_EXCLUDE})
    .map(file => readPage(root, file.split(path.sep).join('/')))
    .filter(page => !!page)
    .sort((a, b) => a.order - b.order || a.title.localeCompare(b.title))

  return GROUPS
    .map(group => ({
      text: group,
      items: pages.filter(page => page.group === group).map(page => ({text: page.title, link: page.link})),
    }))
    .filter(group => group.items.length)
}
