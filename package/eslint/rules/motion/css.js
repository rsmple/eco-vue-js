import {fork} from '@eslint/css-tree'
import {tailwind4} from 'tailwind-csstree'

import {FADE_PROPERTIES, findUngated} from './classes.js'

const {parse, generate} = fork(tailwind4)

const GATES = [
  /prefers-reduced-motion:\s*(?:no-preference|reduce)/,
]

const isGate = atrule => {
  const name = atrule.name.toLowerCase()
  const prelude = atrule.prelude ? generate(atrule.prelude) : ''

  if (name === 'media') return GATES.some(gate => gate.test(prelude))
  if (name === 'variant') return /^motion-(?:safe|reduce)$/.test(prelude.trim())

  return false
}

const unprefixed = property => property.toLowerCase().replace(/^-(?:webkit|moz|ms|o)-/, '')

const splitTopLevel = value => {
  const parts = []
  let depth = 0
  let start = 0

  for (let i = 0; i < value.length; i++) {
    const char = value[i]
    if (char === '(') depth++
    else if (char === ')') depth--
    else if (char === ',' && depth === 0) {
      parts.push(value.slice(start, i).trim())
      start = i + 1
    }
  }

  parts.push(value.slice(start).trim())

  return parts.filter(Boolean)
}

const RESET = /^(?:none|initial|unset|revert|revert-layer)$/i
const ZERO = /^(?:0|0?\.0+|0+)(?:m?s)?$/

const transitionedProperties = (property, value) => {
  if (property === 'transition-property') return splitTopLevel(value)

  return splitTopLevel(value).map(item => {
    const words = item.split(/\s+/).filter(word => !/^[\d.]/.test(word) && !/\(/.test(word))
    return words.find(word => !/^(?:ease|ease-in|ease-out|ease-in-out|linear|step-start|step-end|normal|allow-discrete)$/i.test(word)) ?? 'all'
  })
}

/**
 * Walks a parsed stylesheet and reports motion that is not inside a reduced-motion query.
 * `report(node, token)` gets the offending declaration or `@apply` rule.
 */
export const checkStylesheet = (stylesheet, report, allow = []) => {
  const checkDeclaration = (declaration, siblings) => {
    const property = unprefixed(declaration.property)
    const value = generate(declaration.value).trim()

    if (property === 'scroll-behavior') {
      if (value.toLowerCase() === 'smooth') report(declaration, 'scroll-behavior: smooth')
      return
    }

    if (property === 'animation' || property === 'animation-name') {
      if (!RESET.test(value)) report(declaration, `${ declaration.property }: ${ value }`)
      return
    }

    if (property === 'transition' || property === 'transition-property') {
      if (RESET.test(value)) return

      const properties = transitionedProperties(property, value).map(item => item.toLowerCase())
      if (properties.every(item => FADE_PROPERTIES.includes(item))) return

      report(declaration, `${ declaration.property }: ${ value }`)
      return
    }

    if (property === 'transition-duration') {
      if (splitTopLevel(value).every(item => ZERO.test(item))) return
      if (siblings.some(item => ['transition', 'transition-property'].includes(unprefixed(item.property)))) return

      report(declaration, `${ declaration.property }: ${ value } (transitions all properties)`)
    }
  }

  const visitChildren = (list, gated) => {
    const nodes = Array.isArray(list) ? list : list?.toArray?.() ?? []
    const declarations = nodes.filter(node => node.type === 'Declaration')

    for (const node of nodes) {
      if (node.type === 'Declaration') {
        if (!gated) checkDeclaration(node, declarations)
      } else {
        visit(node, gated)
      }
    }
  }

  const visit = (node, gated) => {
    switch (node.type) {
      case 'StyleSheet':
      case 'Block':
        visitChildren(node.children, gated)
        break
      case 'Rule':
        visit(node.block, gated)
        break
      case 'Atrule': {
        const name = node.name.toLowerCase()

        if (name === 'keyframes' || name.endsWith('-keyframes')) return

        if (name === 'apply') {
          if (gated || !node.prelude) return
          for (const token of findUngated(generate(node.prelude), allow)) report(node, token)
          return
        }

        if (node.block) visit(node.block, gated || isGate(node))
        break
      }
    }
  }

  visit(stylesheet, false)
}

const STYLE_BLOCK = /<style\b([^>]*)>([\s\S]*?)<\/style\s*>/gi
const SKIPPED_LANG = /\blang\s*=\s*["']?(?:scss|sass|less|stylus|styl)\b/i
const DISABLE = /eslint-disable(-next-line|-line)?(?:\s+([^*]+?))?\s*$/

const isDisabledBy = (comment, ruleId) => {
  const match = comment.match(DISABLE)
  if (!match) return null
  const rules = match[2]?.split(',').map(item => item.trim()).filter(Boolean)
  if (rules?.length && !rules.includes(ruleId)) return null
  return match[1] ?? ''
}

/**
 * Checks CSS text that starts at `startLine`/`startColumn` (1-based line, 0-based column) of its file.
 * `/* eslint-disable *\/`, `/* eslint-disable-line <rule> *\/` and `/* eslint-disable-next-line <rule> *\/` work inside it.
 */
export const checkCss = (css, {startLine = 1, startColumn = 0, ruleId, allow = []}, report) => {
  const disabledLines = new Set()
  let disabledAll = false

  const stylesheet = parse(css, {
    positions: true,
    onParseError: () => {},
    onComment: (value, loc) => {
      const kind = isDisabledBy(value.trim(), ruleId)
      if (kind === null) return
      if (kind === '') disabledAll = true
      else if (kind === '-line') disabledLines.add(loc.start.line)
      else disabledLines.add(loc.end.line + 1)
    },
  })

  if (disabledAll) return

  checkStylesheet(stylesheet, (node, token) => {
    const {start, end} = node.loc
    if (disabledLines.has(start.line)) return

    const toLoc = point => ({
      line: startLine + point.line - 1,
      column: point.line === 1 ? startColumn + point.column - 1 : point.column - 1,
    })

    report({start: toLoc(start), end: toLoc(end)}, token)
  }, allow)
}

/**
 * Finds `<style>` blocks in a Vue or Astro file and checks each like a CSS file.
 */
export const checkStyleBlocks = (text, options, report) => {
  for (const match of text.matchAll(STYLE_BLOCK)) {
    if (SKIPPED_LANG.test(match[1])) continue

    const offset = match.index + match[0].indexOf('>') + 1
    const before = text.slice(0, offset).split('\n')

    checkCss(match[2], {...options, startLine: before.length, startColumn: before.at(-1).length}, report)
  }
}
