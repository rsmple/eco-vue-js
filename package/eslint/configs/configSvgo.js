import {parserPlain, plugin as pluginSVGO} from 'eslint-plugin-svgo'

export default [
  {
    name: 'svgo',
    files: ['**/*.svg'],
    plugins: {
      svgo: pluginSVGO,
    },
    languageOptions: {
      parser: parserPlain,
    },
    rules: {
      'svgo/svgo': [
        'error',
        {
          floatPrecision: 2,
          js2svg: {
            indent: 2,
            pretty: true,
          },
          plugins: [
            {
              name: 'preset-default',
              params: {
                overrides: {
                  cleanupIds: false,

                  sortAttrs: {
                    xmlnsOrder: 'alphabetical',
                    order: ['width', 'height', 'viewBox'],
                  },
                },
              },
            },
          ],
        },
      ],
    },
  },
]