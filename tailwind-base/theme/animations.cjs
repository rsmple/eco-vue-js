
module.exports = {
  keyframes: {
    ticker: {
      from: {
        transform: 'translateX(-100%)',
      },
      to: {
        transform: 'translateX(100%)',
      },
    },

    'move-horizontal': {
      from: {
        transform: 'translateX(-40px)',
      },
      to: {
        transform: 'translateX(0)',
      },
    },

    shake: {
      '15%': {
        transform: 'translate3d(-25%, 0, 0) rotate3d(0, 0, 1, -5deg)',
      },
      '30%': {
        transform: 'translate3d(20%, 0, 0) rotate3d(0, 0, 1, 3deg)',
      },
      '45%': {
        transform: 'translate3d(-15%, 0, 0) rotate3d(0, 0, 1, -3deg)',
      },
      '60%': {
        transform: 'translate3d(10%, 0, 0) rotate3d(0, 0, 1, 2deg)',
      },
      '75%': {
        transform: 'translate3d(-5%, 0, 0) rotate3d(0, 0, 1, -1deg)',
      },
    },

    'border-rotate': {
      from: {
        'stroke-dashoffset': '0',
      },
      to: {
        'stroke-dashoffset': '-8%',
      },
    },

    'dojo-logo-dashoffset': {
      from: {
        'stroke-dashoffset': '0',
      },
      to: {
        'stroke-dashoffset': '880',
      },
    },

    'spinner-dash': {
      '0%': {
        'stroke-dasharray': '1, 200',
        'stroke-dashoffset': '0',
      },
      '50%': {
        'stroke-dasharray': '89, 200',
        'stroke-dashoffset': '-35px',
      },
      '100%': {
        'stroke-dasharray': '89, 200',
        'stroke-dashoffset': '-124px',
      },
    },
    'ping-big': {
      '75%, 100%': {
        transform: 'scale(4)',
        opacity: '0',
      },
    },
  },
  animation: {
    ticker: 'ticker var(--tiker-duration, 0.8s) linear infinite',
    'move-horizontal': 'move-horizontal var(--tiker-duration, 0.8s) linear infinite',
    shake: 'shake .6s linear infinite',
    'border-rotate': 'border-rotate linear infinite 0.5s',
    'dojo-logo-dashoffset': 'dojo-logo-dashoffset 1.6s linear 1;',
    'spinner-dash': 'spinner-dash 1.6s linear infinite',
    'ping-fast': 'ping-big .5s cubic-bezier(0, 0, 0.2, 1)',
  },
}
