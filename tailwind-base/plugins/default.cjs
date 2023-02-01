const plugin = require('tailwindcss/plugin')

module.exports = plugin(function ({matchUtilities, addVariant, addUtilities, addBase, theme, addComponents}) {
  matchUtilities(
    {
      square: (value) => {
        return {
          minWidth: value,
          maxWidth: value,
          width: value,
          height: value,
          maxHeight: value,
          minHeight: value,
        }
      },
      height: (value) => {
        return {
          height: value,
          maxHeight: value,
          minHeight: value,
        }
      },
      width: (value) => {
        return {
          minWidth: value,
          maxWidth: value,
          width: value,
        }
      },
      'chunk-gap': (value) => {
        return {
          '--split-to-chunks-gap': value,
        }
      },
    },
    {
      values: theme('width'),
    },
  )

  matchUtilities(
    {
      'split-to-chunks': (width) => {
        const value = Number.parseFloat(width)
        const unit = width.replace(value.toString(), '')

        return Array(4).fill(undefined).reduce(
          (current, _, index) => {
            const widthValue = `calc(((100% / ${index + 2}) * var(--split-to-chunks-span, 1)) - (var(--split-to-chunks-gap, 16px) * ${(index + 1)} / ${(index + 2)}))`

            return {
              ...current,
              [`@media (min-width: ${value * (index + 2) + 25.25}${unit})`]: {
                width: widthValue,
                minWidth: widthValue,
              },
            }
          },
          {
            width: '100%',
            minWidth: '100%',
          },
        )
      },
    },
    {
      values: theme('chunks'),
    },
  )

  matchUtilities(
    {
      'chunk-span': (value) => {
        return {
          '--split-to-chunks-span': value,
        }
      },
    },
    {
      values: theme('chunk-span'),
    },
  )

  addVariant('supports-backdrop', '@supports ((-webkit-backdrop-filter: none) or (backdrop-filter: none))')
  addVariant('supports-overlay', '@supports (overflow: overlay)')
  addVariant('supports-overlay-not', '@supports (not (overflow: overlay))')

  addBase({
    'input': {
      'outline': 'none',

      '--input-autofill-bg': theme('colors.default'),
      '--input-autofull-text': theme('colors.black.default'),
      '.dark &':{
        '--input-autofill-bg': theme('colors.default-dark'),
        '--input-autofull-text': theme('colors.gray.100')
      },

      '&::-webkit-textfield-decoration-container': {
        'pointer-events': 'none',
      },

      '&[autocomplete="off"]': {
        '&::-webkit-contacts-auto-fill-button, &::-webkit-credentials-auto-fill-button': {
          'visibility': 'hidden',
          'display': 'none !important',
          'pointer-events': 'none',
          'height': '0',
          'width': '0',
          'margin': '0',
        }
      },

      '&::-webkit-outer-spin-button, &::-webkit-inner-spin-button': {
        '-webkit-appearance': 'none',
        'appearance': 'none',
        'margin': '0',
      },

      '&:-webkit-autofill': {
        '&, &:hover, &:focus, &:active': {
          '-webkit-box-shadow': '0 0 0 30px var(--input-autofill-bg) inset !important',
          '-webkit-text-fill-color': 'var(--input-autofull-text) !important;',
        },
      },

      '&[type=number]': {
        '-moz-appearance': 'textfield',
        'appearance': 'textfield',
      }
    },
  })

  addUtilities({
    '.rounded-inherit': {
      'border-radius': 'inherit',
    },
    '.no-scrollbar': {
      '&::-webkit-scrollbar': {
         'display': 'none',
      }
    },
    '.overflow-y-overlay': {
      '@supports (overflow: overlay)': {
        'overflow-y': 'overlay',
      },
      '@supports (not (overflow: overlay))': {
        'overflow-y': 'auto',
      }
    }
  })

  addComponents({
    '.text-accent': {
      'color': theme('colors.black.default'),
      '.dark &': {
        'color': theme('colors.gray.200'),
      }
    },
    '.text-description': {
      'color': theme('colors.gray.400'),
      '.dark &': {
        'color': theme('colors.gray.500'),
      }
    }
  })
})
