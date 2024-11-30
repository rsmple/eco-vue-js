import plugin from './eslint/plugin.js'

export default [
  {
    name: 'app/files-to-lint',
    files: ['**/*.{ts,js,mts,tsx,vue,json}'],
  },

  {
    name: 'app/files-to-ignore',
    ignores: ['**/dist/**', '**/dist-ssr/**', '**/coverage/**'],
  },

  ...plugin.configs.recommended,

  {
    files: ['**/*.{ts,js,vue}'],
    rules: {
      'custom-rules/modal-import-async': 'off',
    },
  },
]
