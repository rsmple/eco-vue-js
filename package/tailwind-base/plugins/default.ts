import plugin from 'tailwindcss/plugin.js'

const pluginDefault = plugin(function ({matchUtilities, addVariant, addUtilities, addBase, theme, addComponents, config}) {
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
    {
      values: theme('width'),
    },
  )

  addUtilities({
    '.max-w-inner': {
      'max-width': 'calc(100vw - var(--actions-bar-width) - var(--nav-bar-width) - var(--inner-margin) - var(--inner-margin) - var(--scroll-bar-width))',
    },
    '.max-w-inner-no-actions': {
      'max-width': 'calc(100vw - var(--nav-bar-width) - var(--inner-margin) - var(--inner-margin) - var(--scroll-bar-width))',
    },
    '.w-inner': {
      width: 'calc(100vw - var(--actions-bar-width) - var(--nav-bar-width) - var(--inner-margin) - var(--inner-margin) - var(--scroll-bar-width))',
    },
    '.min-w-inner': {
      'min-width': 'calc(100vw - var(--actions-bar-width) - var(--nav-bar-width) - var(--inner-margin) - var(--inner-margin) - var(--scroll-bar-width))',
    },
    '.left-inner': {
      left: 'calc(var(--nav-bar-width) + var(--inner-margin))',
    },
    '.right-inner': {
      right: 'calc(var(--actions-bar-width) + var(--inner-margin))',
    },
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
  addVariant('card', ['.w-card &'])
  addVariant('card-l', ['&.w-card'])
  addVariant('list', ['.w-list &'])
  addVariant('list-l', ['&.w-list'])

  addBase({
    '.w-input': {
      outline: 'none',

      '--input-autofill-bg': theme('colors.default'),
      '--input-autofull-text': theme('colors.black.default'),
      [config('darkMode')[1][0]]: {
        '--input-autofill-bg': theme('colors.default-dark'),
        '--input-autofull-text': theme('colors.gray.100'),
      },

      '&:focus-visible': {
        outline: 'none',
      },

      '&[autocomplete="off"]': {
        '&::-webkit-contacts-auto-fill-button, &::-webkit-credentials-auto-fill-button': {
          visibility: 'hidden',
          display: 'none !important',
          'pointer-events': 'none',
          height: '0',
          width: '0',
          margin: '0',
        },
      },

      '&::-webkit-outer-spin-button, &::-webkit-inner-spin-button': {
        '-webkit-appearance': 'none',
        appearance: 'none',
        margin: '0',
      },

      '&:-webkit-autofill': {
        '&, &:hover, &:focus, &:active': {
          '-webkit-box-shadow': '0 0 0 30px var(--input-autofill-bg) inset !important',
          '-webkit-text-fill-color': 'var(--input-autofull-text) !important;',
        },
      },

      '&[type=number]': {
        '-moz-appearance': 'textfield',
        appearance: 'textfield',
      },

      '&::-webkit-textfield-decoration-container, &:focus::-webkit-textfield-decoration-container': {
        visibility: 'hidden',
        'pointer-events': 'none',
      },
    },
  })

  addBase({
    '.w-scrollbar': {
      '&::-webkit-scrollbar, & ::-webkit-scrollbar': {
        width: '12px',
        height: '12px',
        'z-index': '500',
      },
      '&::-webkit-scrollbar-button, & ::-webkit-scrollbar-button': {
        display: 'none',
      },
      '&::-webkit-scrollbar-thumb, & ::-webkit-scrollbar-thumb': {
        'border-radius': '5px',
        'border-color': 'transparent',
        'border-style': 'solid',
        'border-width': '2px',
        'background-clip': 'padding-box',
        'background-color': 'var(--w-scroll-bar-color)',
        '&:hover': {
          'background-color': 'var(--w-scroll-bar-color-hover)',
        },
      },
      '&::-webkit-scrollbar-track, & ::-webkit-scrollbar-track, &::-webkit-scrollbar-corner, & ::-webkit-scrollbar-corner': {
        background: 'transparent',
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
    'textarea::-webkit-resizer': {
      transform: 'scale(2)',
      'transform-origin': 'top left',
      'background-size': '7px 7px',
      'background-position': 'top',
      'background-image': 'linear-gradient(135deg, currentColor 10%, transparent 10%, transparent 50%, currentColor 50%, currentColor 60%, transparent 60%, transparent 100%)',
      color: theme('colors.gray.300'),
      [config('darkMode')[1][0]]: {
        color: theme('colors.gray.700'),
      },
    },
    '*:focus-visible': {
      outline: 'none',
    },
  })

  addBase({
    '.w-option': {
      'min-height': 'var(--w-option-height)',
      'border-radius': 'var(--w-option-rounded)',

      '--w-skeleton-height': 'var(--w-option-height)',
      '--w-skeleton-rounded': 'var(--w-option-rounded)',
    },
    '.w-option-has-bg, *:has(.w-option-has-bg) + .w-option-has-bg-input, .w-option-has-bg + .w-option-has-bg-input': {
      'padding-left': 'var(--w-option-padding)',
      'padding-right': 'var(--w-option-padding)',
    },
    '.w-option-has-bg .w-option-button': {
      'margin-right': 'calc(var(--w-option-rounded) * -1)',
    },
    '.w-select-option': {
      padding: 'calc(var(--w-select-option-padding) / 2) var(--w-select-option-padding)',
    },
    body: {
      '--w-option-height': 'calc(var(--w-input-height,2.75rem) - (var(--w-input-gap,0.25rem) * 2) - 2px)',
      '--w-option-rounded': 'calc(var(--w-input-rounded,0.75rem) - var(--w-input-gap,0.25rem))',
      '--w-option-padding': 'var(--w-input-rounded,0.75rem)',
      '--w-select-option-padding': 'calc(var(--w-option-padding) + var(--w-input-gap) + 1px)',
    },
  })

  matchUtilities(
    {
      'w-scroll-bar-color': value => {
        return {
          '--w-scroll-bar-color': value,
        }
      },
      'w-scroll-bar-color-hover': value => {
        return {
          '--w-scroll-bar-color-hover': value,
        }
      },
      'w-has-changes-color': value => {
        return {
          '--has-changes-bg': value,
        }
      },
    },
    {
      values: theme('colors'),
    },
  )

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

  addComponents({
    '.text-accent': {
      color: theme('colors.black.default'),
      [config('darkMode')[1][0]]: {
        color: theme('colors.gray.200'),
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

  addUtilities({
    '.w-ripple': {
      '&::before, &-has-only::before': {
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
        'transition-property': 'opacity',
        'transition-timing-function': 'cubic-bezier(0.4, 0, 0.2, 1)',
        'transition-duration': '100ms',
      },

      '&:active::before': {
        opacity: 'calc(var(--w-ripple-opacity, 0.10) * 2)',
      },
    },

    '.w-ripple-trigger:active': {
      '.w-ripple::before, &.w-ripple::before': {
        opacity: 'calc(var(--w-ripple-opacity, 0.10) * 2)',
      },
    },

    '.w-ripple-trigger-has:has(.w-ripple-has:active)': {
      '.w-ripple-has-only::before, &.w-ripple-has-only::before': {
        opacity: 'calc(var(--w-ripple-opacity, 0.10) * 2)',
      },
    },

    '.w-ripple-hover:not(:active):hover, .w-ripple-trigger:not(:active):hover .w-ripple-hover, .w-ripple-hover:not(:active):focus, .w-ripple-trigger:not(:active):focus .w-ripple-hover': {
      '& .w-ripple:not(:active)::before, &.w-ripple::before': {
        opacity: 'var(--w-ripple-opacity, 0.10)',
      },
    },

    '.w-ripple-trigger-has:has(.w-ripple-has:not(:active):hover) .w-ripple-hover, .w-ripple-trigger-has:has(.w-ripple-has:not(:active):focus) .w-ripple-hover': {
      '& .w-ripple-has-only:not(:active)::before, &.w-ripple-has-only::before': {
        opacity: 'var(--w-ripple-opacity, 0.10)',
      },
    },
  })

  addUtilities({
    '.w-hover-circle': {
      '&::after': {
        content: '""',
        position: 'absolute',
        top: '0',
        left: '0',
        height: '100%',
        width: '100%',
        'border-radius': '9999px',
        'z-index': '1',
        'background-color': 'currentColor',
        'pointer-events': 'none',
        'user-select': 'none',
        opacity: '0',
        transform: 'scaleX(0.5) scaleY(0.5)',
        'transition-property': 'opacity transform',
        'transition-timing-function': 'cubic-bezier(0.4, 0, 0.2, 1)',
        'transition-duration': '200ms',
      },

      '&:hover::after, .w-hover-circle-trigger:hover &::after, &:focus::after, .w-hover-circle-trigger:focus &::after': {
        opacity: 'var(--w-hover-circle-opacity, 0.10)',
        transform: 'scaleX(2.2) scaleY(2.2)',
      },

      '&:active::after, .w-hover-circle-trigger:active &::after': {
        opacity: 'var(--w-hover-circle-opacity, 0.10)',
        transform: 'scaleX(1.8) scaleY(1.8)',
      },
    },
  })

  matchUtilities(
    {
      'w-ripple-opacity': value => {
        return {
          '--w-ripple-opacity': value,
        }
      },
      'w-hover-circle-opacity': value => {
        return {
          '--w-hover-circle-opacity': value,
        }
      },
    },
    {
      values: theme('opacity'),
    },
  )

  addUtilities({
    '.w-progress-striped': {
      '&::before': {
        content: '""',
        'background-image': 'linear-gradient(135deg, hsla(0,0%,100%,.125) 25%, transparent 0, transparent 50%, hsla(0,0%,100%,.125) 0, hsla(0,0%,100%,.125) 75%, transparent 0, transparent)',
        position: 'absolute',
        top: '0',
        left: '0',
        width: 'calc(100% + 40px)',
        height: '100%',
        'background-repeat': 'repeat',
        'background-size': '40px 40px',
        animation: theme('animation.move-horizontal'),
      },
      [config('darkMode')[1][0]]: {
        '&::before': {
          'background-image': 'linear-gradient(135deg, hsla(0,0%,10%,.125) 25%, transparent 0, transparent 50%, hsla(0,0%,10%,.125) 0, hsla(0,0%,10%,.125) 75%, transparent 0, transparent)',
        },
      },
    },
  })

  addComponents({
    '.w-select-field': {
      'padding-top': '0.3125rem',
      'padding-bottom': '0.3125rem',
      'align-items': 'center',
      'white-space': 'nowrap',
      overflow: 'hidden',
      'text-overflow': 'ellipsis',
    },
    '.group\\/model .w-select-field': {
      'padding-left': '0.75rem',
      'padding-right': '0.75rem',
    },

    '.w-skeleton': {
      position: 'relative',
      width: 'var(--skeleton-width,var(--skeleton-width-internal,70%))',
      height: 'var(--skeleton-height)',
      'border-radius': 'var(--w-skeleton-rounded,0.5rem)',
      overflow: 'hidden',
      cursor: 'progress',
      '&:not(.w-skeleton-static):before': {
        content: '""',
        position: 'absolute',
        top: '0',
        width: '100%',
        height: '100%',
        'background-image': 'linear-gradient(90deg, rgba(255,255,255,0), rgba(255,255,255,.5), rgba(255,255,255,0))',
        animation: theme('animation.ticker'),

        [config('darkMode')[1][0]]: {
          'background-image': 'linear-gradient(90deg,rgba(255,255,255,0),rgba(255,255,255,.01),rgba(255,255,255,0))',
        },
      },
    },
    '.w-skeleton-static': {
      '& .w-skeleton:before, &.w-skeleton:before': {
        display: 'none',
        animation: 'none',
      },
    },
  })

  matchUtilities(
    {
      'w-skeleton-w': value => ({'--skeleton-width': value}),
      'w-list-card-w': value => ({'--w-list-card-width': value}),
      'w-checkbox-size': value => ({'--w-checkbox-size': value}),
      'w-input-gap': value => ({'--w-input-gap': value}),
      'w-spinner-size': value => ({'--w-spinner-size': value}),
      'w-modal-wrapper-p': value => ({'--w-modal-wrapper-padding': value}),
      'w-modal-wrapper-w': value => ({'--w-modal-wrapper-width': value}),
      'w-list-header-h': value => ({'--w-list-header-height': value}),
      'w-list-padding': value => ({'--w-list-padding': value}),
      'w-modal-confirm-w': value => ({'--w-modal-confirm-width': value}),
      'grid-cols-fill': value => ({'grid-template-columns': `repeat(auto-fill, minmax(${ value }, 1fr))`}),
    },
    {
      values: theme('width'),
    },
  )

  matchUtilities(
    {
      'w-skeleton-h': value => ({'--skeleton-height': value}),
      'w-input-h': value => ({'--w-input-height': value}),
      'w-textarea-h': value => ({'--w-textarea-height': value}),
      'w-button-h': value => ({'--w-button-height': value}),
    },
    {
      values: theme('height'),
    },
  )

  matchUtilities(
    {
      'w-input-rounded': value => ({'--w-input-rounded': value}),
      'w-button-rounded': value => ({'--w-button-rounded': value}),
      'w-skeleton-rounded': value => ({'--w-skeleton-rounded': value}),
      'w-ripple-rounded': value => ({'--w-ripple-rounded': value}),
      'w-list-rounded': value => ({'--w-list-rounded': value}),
      'w-option-rounded': value => ({'--w-option-rounded': value}),
      'w-modal-wrapper-rounded': value => ({'--w-modal-wrapper-rounded': value}),
      'w-list-header-rounded': value => ({'--w-list-header-rounded': value}),
    },
    {
      values: theme('borderRadius'),
    },
  )

  matchUtilities(
    {
      'w-list-gap': value => ({'--w-list-gap': value}),
    },
    {
      values: theme('gap'),
    },
  )

  addBase({
    'cols-span-full': {
      'grid-column': '1 / -1',
    },
    'row-span-full': {
      'grid-row': '1 / -1',
    },
  })
})

export default pluginDefault
