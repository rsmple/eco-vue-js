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
  
  addBase({
    '*': {
      '--w-left-inner': 'calc(var(--nav-bar-width) + var(--inner-margin))',
      '--w-right-inner': 'calc(var(--actions-bar-width) + var(--inner-margin))',
      '--w-width-inner': 'calc(100vw - var(--actions-bar-width) - var(--nav-bar-width) - var(--inner-margin) - var(--inner-margin) - var(--scroll-bar-width))',
      '--w-height-inner': 'calc(100vh - var(--header-height) - var(--infinite-list-header-height, 0px) - var(--scroll-bar-width))',
    },
    '.w-modal-wrapper *': {
      '--w-left-inner': 'var(--w-modal-wrapper-padding)',
      '--w-right-inner': 'var(--w-modal-wrapper-padding)',
      '--w-width-inner': 'calc(var(--w-modal-wrapper-width, 35rem) - var(--w-modal-wrapper-padding) - var(--w-modal-wrapper-padding) - var(--scroll-bar-width))',
      '--w-height-inner': 'calc(var(--w-modal-content-height) - var(--w-modal-header-height) - var(--w-modal-footer-height) - var(--infinite-list-header-height, 0px) - var(--scroll-bar-width))',
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
    '*::-webkit-resizer': {
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
    '*': {
      '--w-option-height': 'calc(var(--w-input-height,2.75rem) - (var(--w-input-gap,0.25rem) * 2) - 2px)',
      '--w-option-rounded': 'calc(var(--w-input-rounded,0.75rem) - var(--w-input-gap,0.25rem) - 1px)',
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
      height: 'var(--skeleton-height,1em)',
      'border-radius': 'var(--w-skeleton-rounded,0.5rem)',
      overflow: 'hidden',
      cursor: 'progress',
      display: 'inline-block',
      '&:not(.w-skeleton-static):before': {
        content: '""',
        position: 'absolute',
        top: '0',
        width: '100%',
        height: '100%',
        'background-image': 'linear-gradient(90deg, rgba(255,255,255,0), rgba(255,255,255, var(--w-skeleton-opacity)), rgba(255,255,255,0))',
        animation: theme('animation.ticker'),
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
      'grid-cols-fit': value => ({'grid-template-columns': `repeat(auto-fit, minmax(${ value }, 1fr))`}),
      'w-tabs-side-width': value => ({'--w-tabs-side-width': value}),
    },
    {
      values: theme('width'),
    },
  )

  matchUtilities(
    {
      'w-skeleton-h': value => ({'--skeleton-height': value}),
      'w-input-h': value => ({'--w-input-height': value}),
      'w-input-min-h': value => ({'--w-input-min-height': value}),
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
      'w-button-border': value => ({'--w-button-border': value}),
    },
    {
      values: theme('borderWidth'),
    },
  )

  matchUtilities(
    {
      'w-skeleton-opacity': value => ({'--w-skeleton-opacity': value}),
    },
    {
      values: theme('opacity'),
    },
  )

  matchUtilities(
    {
      'w-svg-stroke-width': value => ({'& path': {'stroke-width': value}}),
    },
    {
      values: {
        '3xs': '0.5',
        '2xs': '0.75',
        xs: '1',
        sm: '1.25',
        md: '1.5',
      },
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

  matchUtilities(
    {
      'w-input-bg': value => ({'--w-input-bg': value}),
    },
    {
      values: theme('colors'),
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

  addVariant(
    'not-print', '@media not print',
  )
})

export default pluginDefault
