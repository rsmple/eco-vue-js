import plugin from 'tailwindcss/plugin.js'

const pluginRipple = plugin(function ({matchUtilities, addUtilities, addBase}) {
  const configRipple = {
    'w-ripple': () => ({
      '&::before': {
        content: '""',
        position: 'absolute',
        top: '0',
        left: '0',
        height: '100%',
        width: '100%',
        'border-radius': 'var(--w-ripple-rounded,inherit)',
        'background-color': 'currentColor',
        'pointer-events': 'none',
        'user-select': 'none',
        opacity: '0',
      },

      '&:active::before': {
        opacity: 'calc(var(--w-ripple-opacity, 0.10) * 2)',
      },
    }),

    'w-ripple-trigger': (value: string) => {
      value = value ? `-${ value }` : ''

      return {
        [`&:active .w-ripple${ value }::before, &:active.w-ripple${ value }::before`]: {
          opacity: 'calc(var(--w-ripple-opacity, 0.10) * 2)',
        },
      }
    },

    'w-ripple-hover': (value: string) => {
      value = value ? `-${ value }` : ''

      return {
        [`&:not(:active):hover, .w-ripple-trigger${ value }:not(:active):hover &,
          &:not(:active):focus, .w-ripple-trigger${ value }:not(:active):focus &,
          &:not(:active):focus-within, .w-ripple-trigger${ value }:not(:active):focus-within &`]: {
          [`& .w-ripple${ value }:not(:active)::before, &.w-ripple${ value }::before`]: {
            opacity: 'var(--w-ripple-opacity, 0.10)',
          },
        },
      }
    }, 

    'w-ripple-active:not(:active)': () => ({
      '&::before': {
        animation: 'ripple-active infinite linear alternate 0.5s',
      },
    }),
  }

  matchUtilities(configRipple, {
    type: 'generic-name',
    respectPrefix: false,
    values: {
      list: 'list',
    },
  })

  addUtilities(Object.keys(configRipple).reduce((result, key) => {
    result[`.${ key }`] = configRipple[key as keyof typeof configRipple]('')
    return result
  }, {} as Record<string, ReturnType<typeof configRipple[keyof typeof configRipple]>>))

  addBase({
    '@keyframes ripple-active': {
      '0%': {
        opacity: '0',
      },
      '100%': {
        opacity: '0.15',
      },
    },
  })
})

export default pluginRipple
