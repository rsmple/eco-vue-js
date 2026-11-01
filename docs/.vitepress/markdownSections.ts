import type MarkdownIt from 'markdown-it'
import type Token from 'markdown-it/lib/token.mjs'

/**
 * Splits a docs page into sections, so the layout style contains it as it does an app's content: a section per `##`
 * heading, one per example (the live demo and its code, between `<!-- @example … -->` and `<!-- @example-end -->`,
 * or a `<DocsDemo />` on its own), and one per run of code blocks — except code right under a heading, which stays in
 * the heading's section.
 * The page is their `surface-stack`: in flat they paint nothing and run together, in card and glass they are separate
 * surfaces. Pages with their own layout (`home`, `page`) are left as they are.
 */

const SECTION_CLASS = 'surface-section docs-section'
const EXAMPLE_CLASS = 'surface-section docs-section docs-example'
const CODE_CLASS = 'surface-section docs-section docs-code'

/** A code block longer than this is collapsed to `COLLAPSED_LINES` (style.css), with a button to show all of it. */
const COLLAPSE_LINES = 24

const EXAMPLE_START = /<!--\s*@example\s/
const EXAMPLE_END = /<!--\s*@example-end\s*-->/
/** A demo placed without the markers, with no code under it: an example of its own too. */
const DEMO = /^\s*<DocsDemo\b[^>]*\/>\s*$/

const VOID_TAGS = new Set(['area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input', 'link', 'meta', 'source', 'track', 'wbr'])

/**
 * How many elements an HTML block leaves open: a section can only start or end outside of them, or it would cut a
 * wrapper such as `<div>` … markdown … `</div>` in two.
 */
const getOpenDelta = (html: string) => {
  let delta = 0

  for (const match of html.replace(/<!--[\s\S]*?-->/g, '').matchAll(/<(\/?)([A-Za-z][\w.:-]*)\b[^>]*?(\/?)>/g)) {
    const [, closing, tag, selfClosing] = match

    if (selfClosing || VOID_TAGS.has(tag.toLowerCase())) continue

    delta += closing ? -1 : 1
  }

  return delta
}

/** HTML on its own lines: VitePress makes a component tag alone on a line an `html_inline` at the top level. */
const isHtml = (token: Token) => token.type === 'html_block' || token.type === 'html_inline'

/** `<script>` and `<style>` blocks, which VitePress lifts out of the page: they don't start a section of their own. */
const isHoisted = (token: Token) => isHtml(token) && /^\s*<(script|style)\b/i.test(token.content)

/** What renders nothing, such as the empty inline VitePress leaves after a component tag: it doesn't start a section. */
const isBlank = (token: Token) => !token.content.trim() && (token.type === 'inline' || token.type === 'text' || token.type === 'softbreak')

/** An HTML comment, such as a `<!-- @source … -->` marker: it renders nothing, so it neither starts nor ends a section. */
const isComment = (token: Token) => isHtml(token) && /^\s*<!--[\s\S]*-->\s*$/.test(token.content)

/** A code block, or a group of them in tabs (`::: code-group`, whose blocks are inside it, a level down). */
const isCode = (token: Token) => token.type === 'fence' || token.type.startsWith('container_code-group_')

/**
 * Collapses a long code block: a checkbox in a label at its bottom shows all of it, with no script, so it works before
 * the page hydrates. Inside the block's own element, so a block is still one element for the section's edge rules.
 */
const collapseLongFences = (md: MarkdownIt) => {
  const fence = md.renderer.rules.fence!

  md.renderer.rules.fence = (tokens, idx, options, env, self) => {
    const html = fence(tokens, idx, options, env, self)
    const lines = tokens[idx].content.replace(/\n$/, '').split('\n').length

    if (lines <= COLLAPSE_LINES) return html

    const more = `<label class="docs-code-more"><input type="checkbox"><span class="docs-code-show">Show all ${ lines } lines</span><span class="docs-code-hide">Collapse</span></label>`

    return html
      .replace(/^<div class="/, '<div class="docs-code-long ')
      .replace(/<\/div>\s*$/, `${ more }</div>\n`)
  }
}

export const markdownSections = (md: MarkdownIt) => {
  collapseLongFences(md)

  md.core.ruler.push('docs_sections', state => {
    const env = state.env as {relativePath?: string, frontmatter?: Record<string, unknown>}

    // Only a page: titles and other fragments are rendered on their own too, such as a `::: details` summary.
    if (state.inlineMode || !env.relativePath) return

    const frontmatter = env.frontmatter ?? {}

    if ((frontmatter.layout && frontmatter.layout !== 'doc') || frontmatter.markdownStyles === false) return

    const html = (content: string) => Object.assign(new state.Token('html_block', '', 0), {content, block: true})

    const tokens: Token[] = []
    let open: 'text' | 'example' | 'code' | null = null
    let depth = 0
    /** The last top-level token that renders: code right under a heading stays in the heading's section. */
    let last: Token | null = null

    const close = () => {
      if (open) tokens.push(html('</section>\n'))
      open = null
    }

    const start = (kind: 'text' | 'example' | 'code') => {
      close()
      tokens.push(html(`<section class="${ kind === 'example' ? EXAMPLE_CLASS : kind === 'code' ? CODE_CLASS : SECTION_CLASS }">\n`))
      open = kind
    }

    for (const token of state.tokens) {
      const isTop = depth === 0 && token.level === 0
      const isDemo = isTop && open !== 'example' && isHtml(token) && DEMO.test(token.content)

      if (isTop) {
        if (isDemo || (token.type === 'html_block' && EXAMPLE_START.test(token.content))) {
          start('example')
        } else if (open === 'example' || isHoisted(token) || isBlank(token) || isComment(token)) {
          // Stays where it is.
        } else if (isCode(token)) {
          // Under a heading, or after code that stayed under one, it stays where it is.
          if (open !== 'code' && last?.type !== 'heading_close' && !(last && isCode(last))) start('code')
        } else if ((token.type === 'heading_open' && token.tag === 'h2') || open !== 'text') {
          start('text')
        }
      }

      tokens.push(token)

      if (isTop && !isHoisted(token) && !isBlank(token) && !isComment(token)) last = token

      if (token.level === 0 && isHtml(token)) depth = Math.max(0, depth + getOpenDelta(token.content))

      if (isDemo || (depth === 0 && token.level === 0 && token.type === 'html_block' && EXAMPLE_END.test(token.content))) close()
    }

    close()

    state.tokens = tokens
  })
}
