import flattenColorPalette from 'tailwindcss/lib/util/flattenColorPalette'
import plugin from 'tailwindcss/plugin.js'

const pluginDefault = plugin(function ({matchUtilities, theme, addBase}) {
  addBase({
    '.w-input-whitespace-pre-wrap': {'--w-input-whitespace': 'pre-wrap'},
  })

  matchUtilities(
    {
      'w-scroll-bar-color': value => ({'--w-scroll-bar-color': value}),
      'w-scroll-bar-color-hover': value => ({'--w-scroll-bar-color-hover': value}),
      'w-has-changes-color': value => ({'--has-changes-bg': value}),
      'w-input-bg': value => ({'--w-input-bg': value}),
      'w-slider-from': value => ({'--w-slider-from': value}),
      'w-slider-to': value => ({'--w-slider-to': value}),
      'w-toggle-caret': value => ({'--w-toggle-caret': value}),
      'w-checkbox-color': value => ({'--w-checkbox-color': value}),
      'w-nav-item-dot-color': value => ({'--w-nav-item-dot-color': value}),
      'w-date-picker-day': value => ({'--w-date-picker-day': value}),
    },
    {values: flattenColorPalette(theme('colors'))},
  )

  matchUtilities(
    {
      'w-ripple-opacity': value => ({'--w-ripple-opacity': value}),
      'w-hover-circle-opacity': value => ({'--w-hover-circle-opacity': value}),
      'w-skeleton-opacity': value => ({'--w-skeleton-opacity': value}),
    },
    {values: theme('opacity')},
  )

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
      'w-dropdown-x-min': value => ({'--w-dropdown-x-min': value}),
      'w-dropdown-x-max': value => ({'--w-dropdown-x-max': value}),
      'w-chart-size': value => ({'--w-chart-size': value}),
    },
    {values: theme('width')},
  )

  matchUtilities(
    {
      'w-skeleton-h': value => ({'--skeleton-height': value}),
      'w-input-h': value => ({'--w-input-height': value}),
      'w-input-min-h': value => ({'--w-input-min-height': value}),
      'w-textarea-h': value => ({'--w-textarea-height': value}),
      'w-button-h': value => ({'--w-button-height': value}),
      'w-dropdown-y-min': value => ({'--w-dropdown-y-min': value}),
      'w-dropdown-y-max': value => ({'--w-dropdown-y-max': value}),
    },
    {values: theme('height')},
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
      'w-button-action-rounded': value => ({'--w-button-action-rounded': value}),
    },
    {values: theme('borderRadius')},
  )

  matchUtilities(
    {
      'w-button-border': value => ({'--w-button-border': value}),
    },
    {values: theme('borderWidth')},
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
    {values: theme('gap')},
  )

  matchUtilities(
    {
      'w-expansion-duration': (value) => ({'--expansion-duration': value}),
    },
    {values: theme('transitionDuration')},
  )
})

export default pluginDefault
