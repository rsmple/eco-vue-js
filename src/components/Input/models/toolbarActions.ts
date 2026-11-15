import type {ToolbarAction} from '../types'

import {markRaw} from 'vue'

import IconBold from '@/assets/icons/IconBold.svg?component'
import IconCodeBlock from '@/assets/icons/IconCodeBlock.svg?component'
import IconCodeInline from '@/assets/icons/IconCodeInline.svg?component'
import IconHeading from '@/assets/icons/IconHeading.svg?component'
import IconItalic from '@/assets/icons/IconItalic.svg?component'
import IconLink from '@/assets/icons/IconLink.svg?component'
import IconListBullet from '@/assets/icons/IconListBullet.svg?component'
// import IconListCheckbox from '@/assets/icons/IconListCheckbox.svg?component'
import IconListDecrease from '@/assets/icons/IconListDecrease.svg?component'
import IconListIncrease from '@/assets/icons/IconListIncrease.svg?component'
import IconListNumbered from '@/assets/icons/IconListNumbered.svg?component'
import IconQuote from '@/assets/icons/IconQuote.svg?component'
import IconStrikethrough from '@/assets/icons/IconStrikethrough.svg?component'
import IconTable from '@/assets/icons/IconTable.svg?component'
import IconTableCollapsed from '@/assets/icons/IconTableCollapsed.svg?component'
// import IconUnderline from '@/assets/icons/IconUnderline.svg?component'

import {getText} from '@/utils/texts'
import {WrapSelectionType} from '@/utils/utils'

export const linePrefixRegex = /^-\s|^>\s|^\d+\.\s|^\[ \]\s|^#{1,6}\s/
export const indentRegex = /^(\s*)/
const tableDividerRowRegex = /^\s*\|(\s*-+\s*\|)+\s*$/

export const preserveIndentation = (line: string, newPrefix: string): string => {
  const indent = line.match(indentRegex)?.[1] ?? ''
  return indent + newPrefix + (indent ? line.slice(indent.length) : line).replace(linePrefixRegex, '')
}

const indent = '  '

const insertTable = (lines: string[], collapsed?: boolean): string => {
  let indent = ''
  const columns: number[] = []
  const items: string[][] = []

  if (lines.length === 1 && !lines[0]!.trim()) lines.push('header|header')
  else if (lines[1] && tableDividerRowRegex.test(lines[1])) lines.splice(1, 1)

  for (const item of lines) {
    const match = item.match(indentRegex)?.[1] ?? ''
    if (match.length > indent.length) indent = match

    const currentItems: string[] = []
    items.push(currentItems)

    const splitted = item.trim().split('|')
    if (splitted[0] === '') splitted.shift()
    if (splitted[splitted.length - 1] === '') splitted.pop()
    for (let col = 0; col < splitted.length; col++) {
      const prepared = splitted[col]!.trim()
      currentItems.push(prepared)

      const length = collapsed ? 0 : prepared.length
      if (columns[col] === undefined) {
        columns.push(length)
      } else if (!collapsed && columns[col]! < length) {
        columns.splice(col, 1, length)
      }
    }
  }

  const s = collapsed ? '' : ' '

  return items.map((splitted, index) => `${
    indent
  }${
    columns.reduce((result, length, col) => `${ result }${ s }${ (splitted[col] ?? '').padEnd(length, ' ') }${ s }|`, '|')
  }${
    index === 0 ? `\n${ indent }${ columns.reduce((result, length) => `${ result }${ s }${ '-'.repeat(length || 1) }${ s }|`, '|') }` : ''
  }${
    lines.length === 1 ? `\n${ indent }| ${ columns.reduce((result, length) => `${ result }${ s }${ length === 0 ? '' : ' '.repeat(length) }${ s }|`, '|') } |` : ''
  }`).join('\n')
}

export const toolbarActionList: ToolbarAction[] = [
  {
    icon: markRaw(IconBold),
    value: {type: WrapSelectionType.TOGGLE, start: '**', end: '**'},
    get tooltip() { return getText('bold') },
  },
  {
    icon: markRaw(IconItalic),
    value: {type: WrapSelectionType.TOGGLE, start: ' _', end: '_ '},
    get tooltip() { return getText('italic') },
  },
  {
    icon: markRaw(IconStrikethrough),
    value: {type: WrapSelectionType.TOGGLE, start: '~~', end: '~~'},
    get tooltip() { return getText('strikethrough') },
  },
  // {
  //   icon: markRaw(IconUnderline),
  //   value: {type: WrapSelectionType.TOGGLE, start: '++', end: '++'},
  //   tooltip: 'Underline',
  // },
  {
    icon: markRaw(IconCodeInline),
    value: {type: WrapSelectionType.TOGGLE, start: '`', end: '`'},
    get tooltip() { return getText('inlineCode') },
  },
  {
    icon: markRaw(IconCodeBlock),
    value: {type: WrapSelectionType.TOGGLE, start: '\n```\n', end: '\n```\n'},
    get tooltip() { return getText('codeBlock') },
  },
  {
    icon: markRaw(IconLink),
    value: {type: WrapSelectionType.TOGGLE, start: '[', end: '](url)'},
    get tooltip() { return getText('insertLink') },
  },
  {
    icon: markRaw(IconListBullet),
    value: {type: WrapSelectionType.LINE_PREFIX, linePrefix: '- '},
    get tooltip() { return getText('bulletList') },
  },
  {
    icon: markRaw(IconListNumbered),
    value: {
      type: WrapSelectionType.LINE_PREFIX,
      detectPattern: /^\d+\.\s/,
      lineTransform: (line, index) => preserveIndentation(line, `${ index + 1 }. `),
    },
    get tooltip() { return getText('numberedList') },
  },
  // {
  //   icon: markRaw(IconListCheckbox),
  //   value: {type: WrapSelectionType.LINE_PREFIX, linePrefix: '[ ] '},
  //   tooltip: 'Checkbox list',
  // },
  {
    icon: markRaw(IconListIncrease),
    value: {type: WrapSelectionType.LINE_PREFIX, lineTransform: line => indent + line},
    get tooltip() { return getText('increaseIndent') },
  },
  {
    icon: markRaw(IconListDecrease),
    value: {type: WrapSelectionType.LINE_PREFIX, lineTransform: line => line.startsWith(indent) ? line.slice(indent.length) : line},
    get tooltip() { return getText('decreaseIndent') },
  },
  {
    icon: markRaw(IconQuote),
    value: {type: WrapSelectionType.LINE_PREFIX, linePrefix: '> '},
    get tooltip() { return getText('quote') },
  },
  {
    icon: markRaw(IconTable),
    value: {type: WrapSelectionType.LINE_PREFIX, lineTransformAll: insertTable},
    get tooltip() { return getText('insertTable') },
  },
  {
    icon: markRaw(IconTableCollapsed),
    value: {type: WrapSelectionType.LINE_PREFIX, lineTransformAll: lines => insertTable(lines, true)},
    get tooltip() { return getText('collapseTable') },
  },
  {
    icon: markRaw(IconHeading),
    value: Array(6).fill(null).map((_, index) => ({
      title: `H${ index + 1 }`,
      value: {type: WrapSelectionType.LINE_PREFIX, linePrefix: `${ '#'.repeat(index + 1) } `},
      get label() { return `${ getText('heading') } ${ index + 1 }` },
    })),
    get label() { return getText('heading') },
  },
]