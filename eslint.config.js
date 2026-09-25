import path from 'node:path'

import recommended from './package/eslint/recommended.js'

export default [
  {
    name: 'app/files-to-lint',
    files: ['**/*.{ts,js,mts,tsx,vue,json,svg}'],
  },

  {
    name: 'app/files-to-ignore',
    ignores: ['**/dist/**', '**/dist-temp/**', '**/src/imports/**', 'src/main.ts', 'docs/.vitepress/cache/**'],
  },

  ...recommended({
    noCustom: true,
    cssConfigPath: path.join(import.meta.dirname, 'src/assets/styles/index.css'),
    tsConfig: [
      'tsconfig.json',
      'tsconfig.node.json',
      'tsconfig.vue.json',
      'tsconfig.docs.json',
      'docs/.vitepress/tsconfig.json',
    ],
  }),

  {
    files: ['**/*.{ts,js,vue}'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          name: '@/main',
          message: 'Import direcrlty',
        },
      ],
    },
  },

  {
    name: 'app/docs-examples',
    files: ['docs/examples/**/*.{ts,vue}', 'src/components/*/docs/**/*.vue'],
    rules: {
      // Examples import the kit the way consumers do; icons resolve through the ambient module declaration.
      'import-x/no-unresolved': ['error', {ignore: ['^eco-vue-js/dist/assets/icons/']}],
      // Example files are demos named after what they show, never registered as components.
      'vue/multi-word-component-names': 'off',
    },
  },
]
