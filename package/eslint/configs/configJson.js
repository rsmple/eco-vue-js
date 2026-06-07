import eslintPluginJsonc from 'eslint-plugin-jsonc'

export default [
  ...eslintPluginJsonc.configs['flat/recommended-with-json'],
  {
    files: ['**/*.json'],
    rules: {
      'jsonc/indent': ['warn', 2, {}],
      'jsonc/key-spacing': ['warn', {beforeColon: false, afterColon: true, mode: 'strict'}],
      'jsonc/comma-style': ['error', 'last'],
      'jsonc/object-curly-newline': ['warn', 'always'],
      'jsonc/object-property-newline': 'warn',
    },
  },
]
