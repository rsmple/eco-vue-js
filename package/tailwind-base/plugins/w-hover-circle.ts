import plugin from 'tailwindcss/plugin.js'

const pluginDefault = plugin(function ({addBase, theme, config}) {
  addBase({
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
})

export default pluginDefault
