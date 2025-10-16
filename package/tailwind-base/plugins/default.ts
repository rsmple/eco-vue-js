import flattenColorPalette from 'tailwindcss/lib/util/flattenColorPalette'
import plugin from 'tailwindcss/plugin.js'

const pluginDefault = plugin(function ({matchUtilities, addVariant, addUtilities, addBase, theme}) {
  matchUtilities(
    {
      square: value => {
        return {
          minWidth: value,
          maxWidth: value,
          width: value,
          height: value,
          maxHeight: value,
          minHeight: value,
        }
      },
      height: value => {
        return {
          height: value,
          maxHeight: value,
          minHeight: value,
        }
      },
      width: value => {
        return {
          minWidth: value,
          maxWidth: value,
          width: value,
        }
      },
    },
    {values: theme('width')},
  )

  matchUtilities(
    {
      'stop-color': (value) => ({'stop-color': value}),
    },
    {values: flattenColorPalette(theme('colors'))},
  )

  addBase({
    'cols-span-full': {'grid-column': '1 / -1'},
    'row-span-full': {'grid-row': '1 / -1'},
  })

  addVariant('supports-backdrop', '@supports ((-webkit-backdrop-filter: none) or (backdrop-filter: none))')
  addVariant('supports-overlay', '@supports (overflow: overlay)')
  addVariant('supports-overlay-not', '@supports (not (overflow: overlay))')
  addVariant('touch', '.touch &')
  addVariant('touch-not', '.touch-not &')
  addVariant('focus-within-not', '&:not(:focus-within)')
  addVariant('resizer', '&::-webkit-resizer')
  addVariant('last-not', '&:not(:last-child)')
  addVariant('first-not', '&:not(:first-child)')
  addVariant('not-print', '@media not print')

  addUtilities({
    '.rounded-inherit': {
      'border-radius': 'inherit',
    },
    '.no-scrollbar': {
      '&::-webkit-scrollbar': {
        display: 'none',
      },
    },
    '.overflow-y-overlay': {
      '@supports (overflow: overlay)': {
        'overflow-y': 'overlay',
      },
      '@supports (not (overflow: overlay))': {
        'overflow-y': 'auto',
      },
    },
    '.overflow-x-overlay': {
      '@supports (overflow: overlay)': {
        'overflow-x': 'overlay',
      },
      '@supports (not (overflow: overlay))': {
        'overflow-x': 'auto',
      },
    },
  })
})

export default pluginDefault
