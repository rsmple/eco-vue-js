import plugin from 'tailwindcss/plugin.js'

const pluginDefault = plugin(function ({addBase, addUtilities, theme}) {
  addUtilities({
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
      backgroundColor: 'light-dark(rgb(229 231 235 / 0.5), rgb(75 85 99 / 0.5))',
      borderRadius: theme('borderRadius.DEFAULT'),
      userSelect: 'text',
      fontWeight: theme('fontWeight.normal'),
    },
    '.code-inline.bg-positive': {
      backgroundColor: 'color-mix(in srgb, light-dark(var(--color-positive), var(--color-positive-dark)) 30.2%, transparent)',
    },
    '.code-inline.bg-negative': {
      backgroundColor: 'color-mix(in srgb, light-dark(var(--color-negative), var(--color-negative-dark)) 30.2%, transparent)',
    },
  })
})

export default pluginDefault
