import type {ToolbarAction} from '../types'

import {markRaw} from 'vue'

import IconBold from '@/assets/icons/IconBold.svg?component'
import IconCodeBlock from '@/assets/icons/IconCodeBlock.svg?component'
import IconCodeInline from '@/assets/icons/IconCodeInline.svg?component'
import IconHeading from '@/assets/icons/IconHeading.svg?component'
import IconItalic from '@/assets/icons/IconItalic.svg?component'
import IconLink from '@/assets/icons/IconLink.svg?component'
import IconListBullet from '@/assets/icons/IconListBullet.svg?component'
import IconListCheckbox from '@/assets/icons/IconListCheckbox.svg?component'
import IconListDecrease from '@/assets/icons/IconListDecrease.svg?component'
import IconListIncrease from '@/assets/icons/IconListIncrease.svg?component'
import IconListNumbered from '@/assets/icons/IconListNumbered.svg?component'
import IconQuote from '@/assets/icons/IconQuote.svg?component'
import IconStrikethrough from '@/assets/icons/IconStrikethrough.svg?component'
import IconTable from '@/assets/icons/IconTable.svg?component'

import {WrapSelectionType} from '@/utils/utils'

export const linePrefixRegex = /^-\s|^>\s|^\d+\.\s|^\[ \]\s|^#{1,6}\s/
export const indentRegex = /^(\s*)/

export const preserveIndentation = (line: string, newPrefix: string): string => {
  const indent = line.match(indentRegex)?.[1] ?? ''
  return indent + newPrefix + (indent ? line.slice(indent.length) : line).replace(linePrefixRegex, '')
}

const indent = '  '

export const toolbarActionList: ToolbarAction[] = [
  {
    icon: markRaw(IconBold),
    value: {type: WrapSelectionType.TOGGLE, start: '**', end: '**'},
    tooltip: 'Bold',
  },
  {
    icon: markRaw(IconItalic),
    value: {type: WrapSelectionType.TOGGLE, start: ' _', end: '_ '},
    tooltip: 'Italic',
  },
  {
    icon: markRaw(IconStrikethrough),
    value: {type: WrapSelectionType.TOGGLE, start: '~~', end: '~~'},
    tooltip: 'Strikethrough',
  },
  {
    icon: markRaw(IconCodeInline),
    value: {type: WrapSelectionType.TOGGLE, start: '`', end: '`'},
    tooltip: 'Inline code',
  },
  {
    icon: markRaw(IconCodeBlock),
    value: {type: WrapSelectionType.TOGGLE, start: '\n```\n', end: '\n```\n'},
    tooltip: 'Code block',
  },
  {
    icon: markRaw(IconLink),
    value: {type: WrapSelectionType.TOGGLE, start: '[', end: '](url)'},
    tooltip: 'Insert link',
  },
  {
    icon: markRaw(IconListBullet),
    value: {type: WrapSelectionType.LINE_PREFIX, linePrefix: '- '},
    tooltip: 'Bullet list',
  },
  {
    icon: markRaw(IconListNumbered),
    value: {
      type: WrapSelectionType.LINE_PREFIX,
      detectPattern: /^\d+\.\s/,
      lineTransform: (line, index) => preserveIndentation(line, `${ index + 1 }. `),
    },
    tooltip: 'Numbered list',
  },
  {
    icon: markRaw(IconListCheckbox),
    value: {type: WrapSelectionType.LINE_PREFIX, linePrefix: '[ ] '},
    tooltip: 'Checkbox list',
  },
  {
    icon: markRaw(IconListIncrease),
    value: {type: WrapSelectionType.LINE_PREFIX, lineTransform: line => indent + line},
    tooltip: 'Increase indent',
  },
  {
    icon: markRaw(IconListDecrease),
    value: {type: WrapSelectionType.LINE_PREFIX, lineTransform: line => line.startsWith(indent) ? line.slice(indent.length) : line},
    tooltip: 'Decrease indent',
  },
  {
    icon: markRaw(IconQuote),
    value: {type: WrapSelectionType.LINE_PREFIX, linePrefix: '> '},
    tooltip: 'Quote',
  },
  {
    icon: markRaw(IconTable),
    value: {type: WrapSelectionType.LINE_PREFIX, lineTransform: (line, index, _lines) => {
      const lines = _lines as string[] & {indent: string, maxLength: number}
      if (lines.indent === undefined || lines.maxLength === undefined) {
        lines.indent = ''
        lines.maxLength = 0
        lines.forEach((item) => {
          const match = item.match(indentRegex)?.[1] ?? ''
          if (match.length > lines.indent.length) lines.indent = match
          const length = item.length - match.length
          if (length > lines.maxLength) lines.maxLength = length
        }, '')
      }
      
      const cleanLine = line.replace(indentRegex, '').replace(linePrefixRegex, '') || (index === 0 ? 'header' : '')
      return `${ lines.indent }| ${ cleanLine.padEnd(lines.maxLength, ' ') } |${ index === 0 ? `\n${ lines.indent }| ${ '-'.repeat(lines.maxLength) } |` : '' }${ lines.length === 1 ? `\n${ lines.indent }| ${ ' '.repeat(lines.maxLength) } |` : '' }`
    }},
    tooltip: 'Insert table',
  },
  {
    icon: markRaw(IconHeading),
    value: Array(6).fill(null).map((_, index) => ({
      title: `H${ index + 1 }`,
      value: {type: WrapSelectionType.LINE_PREFIX, linePrefix: `${ '#'.repeat(index + 1) } `},
    })),
  },
]