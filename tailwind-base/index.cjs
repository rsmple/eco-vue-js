/** @type {import('tailwindcss').Config} */
const colors = require('tailwindcss/colors')

module.exports = {
  theme: {
    colors: {
      current: 'currentColor',
      default: '#ffffff',
      'default-dark': colors.zinc['900'], // '#101827',

      primary: {
        darkest: '#23222e',
        dark: '#5b4fc4', // '#4d42ad',
        default: '#9087e2',
        light: '#f4f3fc',
      },

      secondary: {
        default: '#ffffff',
      },

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

      severity: require('./theme/severity.cjs'),
      score: require('./theme/score.cjs'),
    },
    extend: {
      ...require('./theme/sizes.cjs'),
      ...require('./theme/animations.cjs'),
      screens: {
        xs: '480px',
        '3xl': '1728px',
        '4xl': '1920px',
        '5xl': '2560px',
      },
      scale: {
        120: '1.2',
        180: '1.8',
        190: '1.9',
        200: '2.0',
      },
      borderRadius: {
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
        'overlay': 'overlay',
      },
    },
    fontFamily: {
      sans: ['MontSerrat', 'Arial'],
      roboto: ['Roboto'],
      mono: ['RobotoMono'],
    },
  },
  plugins: [
    require('./plugins/default.cjs'),
  ],
}
