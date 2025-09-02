import {markRaw} from 'vue'

import IconBold from '@/assets/icons/IconBold.svg?component'
import IconCodeBlock from '@/assets/icons/IconCodeBlock.svg?component'
import IconCodeInline from '@/assets/icons/IconCodeInline.svg?component'
import IconHeading from '@/assets/icons/IconHeading.svg?component'
import IconItalic from '@/assets/icons/IconItalic.svg?component'
import IconLink from '@/assets/icons/IconLink.svg?component'
import IconListBullet from '@/assets/icons/IconListBullet.svg?component'
import IconListCheckbox from '@/assets/icons/IconListCheckbox.svg?component'
import IconListNumbered from '@/assets/icons/IconListNumbered.svg?component'
import IconQuote from '@/assets/icons/IconQuote.svg?component'
import IconStrikethrough from '@/assets/icons/IconStrikethrough.svg?component'

import {type ToolbarAction, WrapSelectionType} from '../types'

export const linePrefixRegex = /^-\s|^>\s|^\d+\.\s|^\[ \]\s|^#{1,6}\s/

export const toolbarActionList: ToolbarAction[] = [
  {
    icon: markRaw(IconBold),
    value: {
      type: WrapSelectionType.TOGGLE,
      start: '**',
      end: '**',
    },
    tooltip: 'Bold',
  },
  {
    icon: markRaw(IconItalic),
    value: {
      type: WrapSelectionType.TOGGLE,
      start: '_',
      end: '_',
    },
    tooltip: 'Italic',
  },
  {
    icon: markRaw(IconStrikethrough),
    value: {
      type: WrapSelectionType.TOGGLE,
      start: '~~',
      end: '~~',
    },
    tooltip: 'Strikethrough',
  },
  {
    icon: markRaw(IconCodeInline),
    value: {
      type: WrapSelectionType.TOGGLE,
      start: '`',
      end: '`',
    },
    tooltip: 'Inline code',
  },
  {
    icon: markRaw(IconCodeBlock),
    value: {
      type: WrapSelectionType.TOGGLE,
      start: '```\n',
      end: '\n```',
    },
    tooltip: 'Code block',
  },
  {
    icon: markRaw(IconLink),
    value: {
      type: WrapSelectionType.WRAP,
      start: '[',
      end: '](url)',
      cursorOffset: -4,
    },
    tooltip: 'Insert link',
  },
  {
    icon: markRaw(IconListBullet),
    value: {
      type: WrapSelectionType.LINE_PREFIX,
      linePrefix: '- ',
    },
    tooltip: 'Bullet list',
  },
  {
    icon: markRaw(IconListNumbered),
    value: {
      type: WrapSelectionType.LINE_PREFIX,
      detectPattern: /^\d+\.\s/,
      lineTransform: (line: string, index: number) => `${ index + 1 }. ${ line.replace(linePrefixRegex, '') }`,
    },
    tooltip: 'Numbered list',
  },
  {
    icon: markRaw(IconListCheckbox),
    value: {
      type: WrapSelectionType.LINE_PREFIX,
      linePrefix: '[ ] ',
    },
    tooltip: 'Checkbox list',
  },
  {
    icon: markRaw(IconQuote),
    value: {
      type: WrapSelectionType.LINE_PREFIX,
      linePrefix: '> ',
    },
    tooltip: 'Quote',
  },
  {
    icon: markRaw(IconHeading),
    value: Array(6).fill(null).map((_, index) => ({
      title: `H${ index + 1 }`,
      value: {
        type: WrapSelectionType.LINE_PREFIX,
        linePrefix: `${ '#'.repeat(index + 1) } `,
      },
    })),
  },
]