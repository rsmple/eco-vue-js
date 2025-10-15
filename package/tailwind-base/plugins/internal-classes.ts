import plugin from 'tailwindcss/plugin.js'

const pluginDefault = plugin(function ({addBase, theme, config}) {
  addBase({
    '*': {
      '--w-left-inner': 'calc(var(--nav-bar-width, 0px) + var(--inner-margin, 0px))',
      '--w-right-inner': 'calc(var(--actions-bar-width, 0px) + var(--inner-margin, 0px))',
      '--w-width-inner': 'calc(100vw - var(--w-left-inner, 0px) - var(--w-right-inner, 0px) - var(--scroll-bar-width, 0px))',

      '--w-top-inner': 'calc(var(--header-height, 0px) + var(--infinite-list-header-height, 0px))',
      '--w-bottom-inner': 'var(--scroll-bar-width, 0px)',
      '--w-height-inner': 'calc(100vh - var(--w-top-inner, 0px) - var(--w-bottom-inner, 0px))',
    },
    '.w-modal-wrapper *': {
      '--w-left-inner': 'var(--w-modal-wrapper-padding, 0px)',
      '--w-right-inner': 'calc(var(--w-modal-wrapper-padding, 0px))',
      '--w-width-inner': 'calc(var(--w-modal-wrapper-width, 35rem) - var(--w-left-inner, 0px) - var(--w-right-inner, 0px) - var(--scroll-bar-width, 0px))',

      '--w-top-inner': 'calc(var(--w-modal-header-height, 0px) + var(--infinite-list-header-height, 0px))',
      '--w-bottom-inner': 'calc(var(--w-modal-footer-height, 0px) + var(--scroll-bar-width, 0px))',
      '--w-height-inner': 'calc(var(--w-modal-content-height, 0px) - var(--w-top-inner, 0px) - var(--w-bottom-inner, 0px))',
    },
  })

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

  addBase({
    '.w-tooltip-center-x': {
      transform: 'translate(calc(min(100vw - var(--dropdown-x, 0px) - 50% - 12px, max((var(--dropdown-x, 0px) - 50% - 12px) * -1, 0px))), 0)',
    },
    '.w-tooltip-center-y': {
      transform: 'translate(0, calc(min(100vh - var(--dropdown-y, 0px) - 50% - 12px, max((var(--dropdown-y, 0px) - 50% - 12px) * -1, 0px))))',
    },
  })

  addBase({
    '.w-shine': {},
    '.w-shine-hidden': {
      '.w-shine': {display: 'none'},
    },
  })

  addBase({
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

  addBase({
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
})

export default pluginDefault
