import eslintPluginJsonc from 'eslint-plugin-jsonc'

export default [
  ...eslintPluginJsonc.configs['flat/recommended-with-json'],
  {
    files: ['**/*.json'],
    rules: {
      'jsonc/indent': ['error', 2, {}],
      'jsonc/key-spacing': ['error', {beforeColon: false, afterColon: true, mode: 'strict'}],
      'jsonc/comma-style': ['error', 'last'],
      'jsonc/object-curly-newline': ['error', 'always'],
      'jsonc/object-property-newline': 'error',
    },
  },
]
