import colors from 'tailwindcss/colors.js'
import plugin from 'tailwindcss/plugin.js'

import {DARK_SELECTOR} from './constants.js'
import pluginDefault from './plugins/default.js'
import pluginInternalClasses from './plugins/internal-classes.js'
import pluginInternalVariables from './plugins/internal-variables.js'
import pluginInternalVariants from './plugins/internal-variants.js'
import pluginText from './plugins/text.js'
import pluginHoverCircle from './plugins/w-hover-circle.js'
import pluginRipple from './plugins/w-ripple.js'
import animations from './theme/animations.js'
import sizes from './theme/sizes.js'

const shades = (prefix: string, palette: Record<string, string>): Record<string, string> =>
  Object.fromEntries(Object.entries(palette).map(([shade, value]) => [`${ prefix }-${ shade }`, value]))

const tailwindBase = plugin(
  function ({addVariant}) {
    addVariant('dark', DARK_SELECTOR)
  },
  {
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

        'black-default': '#333333',
        'black-light': '#4f4f4f',

        ...shades('gray', {...colors.gray, 850: '#1c1e26'}),
        ...shades('slate', colors.slate),

        negative: '#f35555',
        'negative-dark': '#cc3636',
        positive: '#77d460',
        'positive-dark': '#5bb245',
        warning: '#ffda56',
        'warning-dark': '#e6b919',
        info: '#82adff',
        'info-dark': '#407ae5',

        'severity-critical-bg': '#ff757520',
        'severity-critical-text': '#FF7171',
        'severity-high-bg': '#ffbc7035',
        'severity-high-text': '#FF9B63',
        'severity-medium-bg': '#fff06b45',
        'severity-medium-text': '#F4CF4D',
        'severity-low-bg': '#8cff7330',
        'severity-low-text': '#6AD682',
        'severity-info-bg': '#75acff20',
        'severity-info-text': '#82ADFF',
        'severity-resolved-bg': '#8778fc15',
        'severity-resolved-text': '#4F4F4F',

        'score-critical-bg': '#ff73bb30',
        'score-critical-text': '#f95f95',
        'score-high-bg': '#ff757c25',
        'score-high-text': '#f8808e',
        'score-medium-bg': '#ffe57030',
        'score-medium-text': '#ebc17b',
        'score-low-bg': '#93ff7330',
        'score-low-text': '#88cd83',
        'score-negligible-bg': '#70ffb030',
        'score-negligible-text': '#38cba4',
        'score-nullable-bg': '#73d5ff30',
        'score-nullable-text': '#44b0ef',
        'score-undefinedly-bg': '#7affff10',
        'score-undefinedly-text': '#c9e3ef',
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
  },
)

export const plugins = [
  tailwindBase,
  pluginDefault,
  pluginInternalVariables,
  pluginInternalVariants,
  pluginInternalClasses,
  pluginText,
  pluginRipple,
  pluginHoverCircle,
]

export default tailwindBase
