import type {Config} from 'tailwindcss'

import colors from 'tailwindcss/colors.js'

import pluginContainerQueries from './plugins/container-queries.js'
import pluginDefault from './plugins/default.js'
import pluginInternalClasses from './plugins/internal-classes.js'
import pluginInternalVariables from './plugins/internal-variables.js'
import pluginInternalVariants from './plugins/internal-variants.js'
import pluginText from './plugins/text.js'
import pluginHoverCircle from './plugins/w-hover-circle.js'
import pluginRipple from './plugins/w-ripple.js'
import animations from './theme/animations.js'
import sizes from './theme/sizes.js'

const tailwindBase = {
  darkMode: ['variant', [
    '.dark &:not(:is(.light *))',
  ]],
  content: [
    './node_modules/eco-vue-js/dist/components/**/*.vue.js',
    './node_modules/eco-vue-js/dist/components/**/*.js',
  ],
  theme: {
    colors: {
      current: 'currentColor',
      transparent: 'transparent',

      default: '#ffffff',
      'default-dark': colors.zinc['900'], // '#101827',

      'primary-darkest': '#23222e',
      'primary-dark': '#5b4fc4',
      primary: '#9087e2',
      'primary-light': '#f4f3fc',

      black: {
        default: '#333333',
        light: '#4f4f4f',
      },

      gray: colors.gray,
      slate: colors.slate,

      negative: '#f35555',
      'negative-dark': '#cc3636',
      positive: '#77d460',
      'positive-dark': '#5bb245',
      warning: '#ffda56',
      'warning-dark': '#e6b919',
      info: '#82adff',
      'info-dark': '#407ae5',

      severity: {
        critical: {bg: '#ff757520', text: '#FF7171'},
        high: {bg: '#ffbc7035', text: '#FF9B63'},
        medium: {bg: '#fff06b45',text: '#F4CF4D'},
        low: {bg: '#8cff7330',text: '#6AD682'},
        info: {bg: '#75acff20',text: '#82ADFF'},
        resolved: {bg: '#8778fc15',text: '#4F4F4F'},
      },
      score: {
        critical: {bg: '#ff73bb30', text: '#f95f95'},
        high: {bg: '#ff757c25', text: '#f8808e'},
        medium: {bg: '#ffe57030', text: '#ebc17b'},
        low: {bg: '#93ff7330', text: '#88cd83'},
        negligible: {bg: '#70ffb030', text: '#38cba4'},
        nullable: {bg: '#73d5ff30', text: '#44b0ef'},
        undefinedly: {bg: '#7affff10', text: '#c9e3ef'},
      },
    },
    extend: {
      ...sizes,
      ...animations,
      screens: {
        xs: '480px',
        sm: '640px',
        md: '768px',
        lg: '1024px',
        xl: '1280px',
        '2xl': '1536px',
        '3xl': '1728px',
        '4xl': '1920px',
        '5xl': '2560px',

        'xs-not': {max: '479px'},
        'sm-not': {max: '639px'},
        'md-not': {max: '767px'},
        'lg-not': {max: '1023px'},
        'xl-not': {max: '1279px'},
        '2xl-not': {max: '1535px'},
        '3xl-not': {max: '1727px'},
        '4xl-not': {max: '1919px'},
        '5xl-not': {max: '2559px'},
      },
      scale: {
        120: '1.2',
        180: '1.8',
        190: '1.9',
        200: '2.0',
      },
      borderRadius: {
        '2.75xl': '1.375rem',
        '3.5xl': '1.75rem',
        '4xl': '2rem',
      },
      boxShadow: {
        md: '0px 0px 8px rgba(0, 0, 0, 0.15)',
      },
      dropShadow: {
        md: '0px 0px 8px rgba(0, 0, 0, 0.15)',
      },
      chunks: {
        110: '27.5rem',
        120: '30rem',
      },
      'chunk-span': {
        1: '1',
        2: '2',
        3: '3',
      },
      overflow: {
        overlay: 'overlay',
      },
      fontSize: {
        '4xs': ['0.4375rem', '1.3'],
        '3xs': ['0.5625rem', '1.3'],
        '2xs': ['0.625rem', '1.3'],
        '2.5xl': ['1.625rem', '2rem'],
        '7.5xl': ['5.25rem', '1.9'],
      },
    },
    fontFamily: {
      sans: ['MontSerrat', 'system-ui'],
      roboto: ['Roboto', 'system-ui'],
      mono: ['RobotoMono', 'system-ui'],
    },
  },
  plugins: [
    pluginDefault,
    pluginInternalVariables,
    pluginInternalVariants,
    pluginInternalClasses,
    pluginText,
    pluginRipple,
    pluginHoverCircle,
    pluginContainerQueries,
  ],
} satisfies Config

export default tailwindBase
