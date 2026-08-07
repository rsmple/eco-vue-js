import plugin from 'tailwindcss/plugin.js'

import {DARK_SELECTOR} from '../constants.js'

const pluginDefault = plugin(function ({addBase, addUtilities, theme}) {
  addUtilities({
    '.text-accent': {
      color: theme('colors.black-default'),
      [DARK_SELECTOR]: {
        color: theme('colors.default'),
      },
    },
    '.text-description': {
      color: theme('colors.gray-400'),
      [DARK_SELECTOR]: {
        color: theme('colors.gray-500'),
      },
    },
    '.text-secure': {
      'text-security': 'disc',
      '-webkit-text-security': 'disc',
    },
  })

  addBase({
    '.code-inline': {
      fontFamily: theme('fontFamily.mono'),
      paddingLeft: theme('spacing.1'),
      paddingRight: theme('spacing.1'),
      backgroundColor: 'rgb(229 231 235 / 0.5)',
      borderRadius: theme('borderRadius.DEFAULT'),
      userSelect: 'text',
      fontWeight: theme('fontWeight.normal'),
      [DARK_SELECTOR]: {
        backgroundColor: 'rgb(75 85 99 / 0.5)',
      },
    },
    '.code-inline.bg-positive': {
      backgroundColor: `${ theme('colors.positive') }4d`,
      [DARK_SELECTOR]: {
        backgroundColor: `${ theme('colors.positive-dark') }4d`,
      },
    },
    '.code-inline.bg-negative': {
      backgroundColor: `${ theme('colors.negative') }4d`,
      [DARK_SELECTOR]: {
        backgroundColor: `${ theme('colors.negative-dark') }4d`,
      },
    },
  })
})

export default pluginDefault
