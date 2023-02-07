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
        '--input-autofull-text': theme('colors.gray.100'),
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
        },
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
      },
    },
  })

  addBase({
    '.w-scrollbar': {
      '&::-webkit-scrollbar, & ::-webkit-scrollbar': {
        'width': '12px',
        'height': '12px',
        'z-index': '500',
      },
      '&::-webkit-scrollbar-button, & ::-webkit-scrollbar-button': {
        'display': 'none',
      },
      '&::-webkit-scrollbar-thumb, & ::-webkit-scrollbar-thumb': {
        'border-radius': '5px',
        'border-color': 'transparent',
        'border-style': 'solid',
        'border-width': '2px',
        'background-clip': 'padding-box',
        'background-color': theme('colors.gray.300'),
        'opacity': '0.6',
        '&:hover': {
          'opacity': '1',
        },
        '.dark &': {
          'background-color': theme('colors.gray.600'),
          'opacity': '0.4',
          '&:hover': {
            'opacity': '1',
          },
        },
      },
      '&::-webkit-scrollbar-track, & ::-webkit-scrollbar-track, &::-webkit-scrollbar-corner, & ::-webkit-scrollbar-corner, &::-webkit-resizer, & ::-webkit-resizer': {
        'background': 'transparent',
      },
    },
    'html.w-scrollbar': {
      '@supports (overflow: overlay)': {
        'overflow-y': 'overlay',
      },
      '@supports (not (overflow: overlay))': {
        'overflow-y': 'auto',
      },
    },
  })

  addUtilities({
    '.rounded-inherit': {
      'border-radius': 'inherit',
    },
    '.no-scrollbar': {
      '&::-webkit-scrollbar': {
         'display': 'none',
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
  })

  addComponents({
    '.text-accent': {
      'color': theme('colors.black.default'),
      '.dark &': {
        'color': theme('colors.gray.200'),
      },
    },
    '.text-description': {
      'color': theme('colors.gray.400'),
      '.dark &': {
        'color': theme('colors.gray.500'),
      },
    },
  })

  addUtilities({
    '.w-ripple': {
      '&::before': {
        'content': '""',
        'position': 'absolute',
        'top': '0',
        'left': '0',
        'height': '100%',
        'width': '100%',
        'border-radius': 'inherit',
        'background-color': 'currentColor',
        'pointer-events': 'none',
        'user-select': 'none',
        'opacity': '0',
        'transition-property': 'opacity',
        'transition-timing-function': 'cubic-bezier(0.4, 0, 0.2, 1)',
        'transition-duration': '100ms',
      },

      '&:active::before, .w-ripple-trigger:active &::before': {
        'opacity': '0.10',
      },
    },

    '.w-ripple-hover:hover': {
      '& .w-ripple:not(:active)::before, &.w-ripple:not(:active)::before': {
        'opacity': '0.05',
      },
    },
  })

  addUtilities({
    '.w-hover-circle': {
      '&::after': {
        'content': '""',
        'position': 'absolute',
        'top': '0',
        'left': '0',
        'height': '100%',
        'width': '100%',
        'border-radius': '9999px',
        'z-index': '1',
        'background-color': 'currentColor',
        'pointer-events': 'none',
        'user-select': 'none',
        'opacity': '0',
        'transform': 'scaleX(0.5) scaleY(0.5)',
        'transition-property': 'opacity transform',
        'transition-timing-function': 'cubic-bezier(0.4, 0, 0.2, 1)',
        'transition-duration': '200ms',
      },

      '&:hover::after, .w-hover-circle-trigger:hover &::after': {
        'opacity': '0.05',
        'transform': 'scaleX(2) scaleY(2)',
      },

      '&:active::after, .w-hover-circle-trigger:active &::after': {
        'opacity': '0.05',
        'transform': 'scaleX(1.8) scaleY(1.8)',
      },
    },
  })

  addUtilities({
    '.w-progress-striped': {
      '&::before': {
        'content': '""',
        'background-image': 'linear-gradient(135deg, hsla(0,0%,100%,.125) 25%, transparent 0, transparent 50%, hsla(0,0%,100%,.125) 0, hsla(0,0%,100%,.125) 75%, transparent 0, transparent)',
        'position': 'absolute',
        'top': '0',
        'left': '0',
        'width': 'calc(100% + 40px)',
        'height': '100%',
        'background-repeat': 'repeat',
        'background-size': '40px 40px',
        'animation': 'move-horizontal var(--tiker-duration, 0.8s) linear infinite',
      },
      '.dark &::before': {
        'background-image': 'linear-gradient(135deg, hsla(0,0%,10%,.125) 25%, transparent 0, transparent 50%, hsla(0,0%,10%,.125) 0, hsla(0,0%,10%,.125) 75%, transparent 0, transparent)',
      },
    },
  })

  addComponents({
    '.w-select-field': {
      'padding-top': '0.3125rem',
      'padding-bottom': '0.3125rem',
      'padding-left': '0.75rem',
      'padding-right': '0.75rem',
      'display': 'flex',
      'align-items': 'center',
      'white-space': 'nowrap',
    },

    '.w-list-row-item, .w-list-header-item': {
      'padding-right': '1.5rem',
      '&:first-of-type': {
        'padding-left': '1rem',
      },
      '&:last-of-type': {
        'padding-right': '1rem',
      },
    },

    '.w-list-header-item': {
      'height': '3rem',
      'border-top-width': '1px',
      'border-bottom-width': '1px',
      'border-style': 'solid',
      'background-color': theme('colors.primary.light'),
      'border-color': theme('colors.gray.300'),
      '.dark &': {
        'background-color': theme('colors.primary.darkest'),
        'border-color': theme('colors.gray.700'),
      },
      '&:first-of-type': {
        'border-left-width': '1px',
        'border-top-left-radius': '1rem',
        'border-bottom-left-radius': '1rem',
      },
      '&:last-of-type': {
        'border-right-width': '1px',
        'border-top-right-radius': '1rem',
        'border-bottom-right-radius': '1rem',
      },
    },
  })
})
