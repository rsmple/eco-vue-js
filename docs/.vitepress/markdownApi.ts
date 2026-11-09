import type MarkdownIt from 'markdown-it'
import type Token from 'markdown-it/lib/token.mjs'

/**
 * Renders a generated `<!-- @api Name -->` region as a `<DocsApi>` panel: its `#### Props`, `#### Events` and `#### Slots`
 * become tabs, and each `::: details Inherited from …` block under Props a group of its own next to the component's own
 * props. Only the rendered page changes — the Markdown stays the plain tables that search and llms.txt read.
 *
 * Runs before `markdownSections`, so the panel is one element of the section around it.
 */

const API_START = /^<!--\s*@api\s+(\S+)\s*-->/
const API_END = /^<!--\s*@api-end\s*-->/
const INHERITED = /Inherited from `([^`]+)`/

export type ApiGroup = {label: string, count: number, source?: string}
export type ApiTab = {key: string, label: string, groups: ApiGroup[]}

/** `src/components/FieldWrapper/types.ts` → `FieldWrapper`, `src/components/Button/WButton.vue` → `WButton`. */
const sourceLabel = (source: string) => {
  const parts = source.split('/')
  const base = parts.at(-1)!.replace(/\.\w+$/, '')

  return ['types', 'index', 'models'].includes(base) ? parts.at(-2) ?? base : base
}

const countRows = (tokens: Token[]) => {
  let rows = 0
  let tbody = false

  for (const token of tokens) {
    if (token.type === 'tbody_open') tbody = true
    else if (token.type === 'tbody_close') tbody = false
    else if (tbody && token.type === 'tr_open') rows++
  }

  return rows
}

/**
 * Gives each body cell its column's header as `data-label`, and an empty one (`—`) `data-empty`, so a narrow screen can
 * lay a row out as a card without the header row: the labels come from the Markdown, and work before the page hydrates.
 */
const labelCells = (tokens: Token[]) => {
  let headers: string[] = []
  let column = 0

  tokens.forEach((token, index) => {
    if (token.type === 'thead_open') headers = []
    else if (token.type === 'th_open') headers.push(tokens[index + 1]?.content.trim() ?? '')
    else if (token.type === 'tr_open') column = 0
    else if (token.type === 'td_open') {
      token.attrSet('data-label', headers[column++] ?? '')
      if (tokens[index + 1]?.content.trim() === '—') token.attrSet('data-empty', '')
    }
  })
}

const attr = (value: unknown) => JSON.stringify(value).replace(/&/g, '&amp;').replace(/'/g, '&#39;')

type Group = ApiGroup & {tokens: Token[]}
type Tab = {key: string, label: string, groups: Group[]}

const renderPanel = (state: {Token: typeof Token}, name: string, tabs: Tab[]): Token[] => {
  const html = (content: string) => Object.assign(new state.Token('html_block', '', 0), {content, block: true})
  const meta: ApiTab[] = tabs.map(tab => ({
    key: tab.key,
    label: tab.label,
    groups: tab.groups.map(({label, count, source}) => ({label, count, ...source ? {source} : {}})),
  }))

  const result = [html(`<DocsApi name="${ name }" :tabs='${ attr(meta) }'>\n`)]

  for (const tab of tabs) {
    tab.groups.forEach((group, index) => {
      result.push(html(`<template #${ tab.key }-${ index }>\n`), ...group.tokens, html('</template>\n'))
    })
  }

  result.push(html('</DocsApi>\n'))

  return result
}

export const markdownApi = (md: MarkdownIt) => {
  md.core.ruler.push('docs_api', state => {
    if (state.inlineMode) return

    const tokens: Token[] = []
    let name: string | null = null
    let tabs: Tab[] = []
    /** Where the current content goes: the last group of the last tab, or straight to the page before the first tab. */
    let target: Token[] = tokens

    const startGroup = (group: ApiGroup) => {
      const tab = tabs.at(-1)!
      const next: Group = {...group, tokens: []}

      tab.groups.push(next)
      target = next.tokens
    }

    for (let index = 0; index < state.tokens.length; index++) {
      const token = state.tokens[index]
      const isTop = token.level === 0

      if (isTop && token.type === 'html_block' && !name) {
        const match = token.content.match(API_START)

        if (match) {
          name = match[1]
          tabs = []
          target = tokens
          tokens.push(token)
          continue
        }
      }

      if (!name) {
        tokens.push(token)
        continue
      }

      if (isTop && token.type === 'html_block' && API_END.test(token.content)) {
        for (const tab of tabs) {
          for (const group of tab.groups) {
            group.count = countRows(group.tokens)
            labelCells(group.tokens)
          }
          // Only inherited props: the empty own group (`_No props._`) would be a tab stop with nothing in it.
          if (tab.groups.length > 1) tab.groups = tab.groups.filter(group => group.count)
        }

        if (tabs.length) tokens.push(...renderPanel(state, name, tabs.filter(tab => tab.groups.length)))
        tokens.push(token)
        name = null
        target = tokens
        continue
      }

      // `#### Props` → a tab: its heading is the tab's label, so it doesn't render.
      if (isTop && token.type === 'heading_open' && token.tag === 'h4') {
        const label = state.tokens[index + 1]?.content.trim() ?? ''

        tabs.push({key: label.toLowerCase().replace(/\W+/g, '-'), label, groups: []})
        startGroup({label: name, count: 0})
        index += 2
        continue
      }

      // `::: details Inherited from …` under a tab → a group of that tab, without the details block around it.
      if (isTop && tabs.length && token.type === 'container_details_open') {
        const source = token.info.match(INHERITED)?.[1]

        startGroup({label: source ? sourceLabel(source) : token.info.replace(/^\s*details\s*/, ''), count: 0, source})
        continue
      }

      if (isTop && tabs.length && token.type === 'container_details_close') continue

      target.push(token)
    }

    state.tokens = tokens
  })
}
