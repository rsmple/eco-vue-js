import recommended from './package/eslint/recommended.js'

export default [
  {
    name: 'app/files-to-lint',
    files: ['**/*.{ts,js,mts,tsx,vue,json,svg}'],
  },

  {
    name: 'app/files-to-ignore',
    ignores: ['**/dist/**', '**/dist-temp/**', '**/src/imports/**'],
  },

  ...recommended({
    noCustom: true,
    tsConfig: [
      'tsconfig.node.json',
      'tsconfig.vue.json',
    ],
  }),
]
