import plugin from 'tailwindcss/plugin.js'

const pluginDefault = plugin(function ({addBase, theme, config}) {
  addBase({
    '.text-accent': {
      color: theme('colors.black.default'),
      [config('darkMode')[1][0]]: {
        color: theme('colors.default'),
      },
    },
    '.text-description': {
      color: theme('colors.gray.400'),
      [config('darkMode')[1][0]]: {
        color: theme('colors.gray.500'),
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
      [config('darkMode')[1][0]]: {
        backgroundColor: 'rgb(75 85 99 / 0.5)',
      },
    },
    '.code-inline.bg-positive': {
      backgroundColor: `${theme('colors.positive')}4d`,
      [config('darkMode')[1][0]]: {
        backgroundColor: `${theme('colors.positive-dark')}4d`,
      },
    },
    '.code-inline.bg-negative': {
      backgroundColor: `${theme('colors.negative')}4d`,
      [config('darkMode')[1][0]]: {
        backgroundColor: `${theme('colors.negative-dark')}4d`,
      },
    },
  })
})

export default pluginDefault
