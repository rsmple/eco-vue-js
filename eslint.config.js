import recommended from './package/eslint/recommended.js'

export default [
  {
    name: 'app/files-to-lint',
    files: ['**/*.{ts,js,mts,tsx,vue,json}'],
  },

  {
    name: 'app/files-to-ignore',
    ignores: ['**/dist/**', '**/dist-ssr/**', '**/coverage/**', '**/src/imports/**'],
  },

  ...recommended,

  {
    files: ['**/*.{ts,js,vue}'],
    rules: {
      'custom-rules/modal-import-async': 'off',
    },
  },
]
