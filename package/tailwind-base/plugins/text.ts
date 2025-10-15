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
})

export default pluginDefault
