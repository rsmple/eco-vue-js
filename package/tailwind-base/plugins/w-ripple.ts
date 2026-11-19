import plugin from 'tailwindcss/plugin.js'

/**
 * In a list row or card (the `-list` variant), a press that starts on a `.w-ripple-stop` element (a control inside the
 * row: its checkbox, its menu, photo arrows) does not count as a press of the row: the row keeps its hover look.
 * Only that variant pays for the `:has()`; the other ripples have no controls inside.
 */
const pressed = (value: string) => value === '-list' ? ':active:not(:has(.w-ripple-stop:active))' : ':active'
const notPressed = (value: string) => value === '-list' ? ':is(:not(:active), :has(.w-ripple-stop:active))' : ':not(:active)'

const pluginRipple = plugin(function ({matchUtilities, addUtilities, addBase}) {
  const configRipple = {
    'w-ripple': (value: string) => ({
      '&::before': {
        content: '""',
        position: 'absolute',
        inset: 'calc(var(--w-ripple-border, 0px) * -1)',
        'border-radius': 'var(--w-ripple-rounded,inherit)',
        'background-color': 'currentColor',
        'pointer-events': 'none',
        'user-select': 'none',
        opacity: '0',
      },

      [`&${ pressed(value ? `-${ value }` : '') }::before`]: {
        opacity: 'calc(var(--w-ripple-opacity, 0.10) * 2)',
      },
    }),

    'w-ripple-trigger': (value: string) => {
      value = value ? `-${ value }` : ''

      return {
        [`&${ pressed(value) } .w-ripple${ value }::before, &${ pressed(value) }.w-ripple${ value }::before`]: {
          opacity: 'calc(var(--w-ripple-opacity, 0.10) * 2)',
        },
      }
    },

    'w-ripple-hover': (value: string) => {
      value = value ? `-${ value }` : ''

      return {
        [`&${ notPressed(value) }:hover, .w-ripple-trigger${ value }${ notPressed(value) }:hover &,
          &${ notPressed(value) }:focus, .w-ripple-trigger${ value }${ notPressed(value) }:focus &,
          &${ notPressed(value) }:focus-within, .w-ripple-trigger${ value }${ notPressed(value) }:focus-within &`]: {
          [`& .w-ripple${ value }:not(:active)::before, &.w-ripple${ value }::before`]: {
            opacity: 'var(--w-ripple-opacity, 0.10)',
          },
        },
      }
    }, 

  }

  const configRippleStatic = {
    'w-ripple-active:not(:active)': () => ({
      '&::before': {
        '@media (prefers-reduced-motion: no-preference)': {
          animation: 'ripple-active infinite linear alternate 0.5s',
        },
      },
    }),
  }

  matchUtilities(configRipple, {
    type: 'generic-name',
    values: {
      list: 'list',
    },
  })

  const staticUtilities = {...configRipple, ...configRippleStatic}

  addUtilities(Object.keys(staticUtilities).reduce((result, key) => {
    result[`.${ key }`] = staticUtilities[key as keyof typeof staticUtilities]('')
    return result
  }, {} as Record<string, ReturnType<typeof staticUtilities[keyof typeof staticUtilities]>>))

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
