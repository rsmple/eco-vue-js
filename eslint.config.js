import path from 'node:path'

import recommended from './package/eslint/recommended.js'

export default [
  {
    name: 'app/files-to-lint',
    files: ['**/*.{ts,js,mts,tsx,vue,json,svg}'],
  },

  {
    name: 'app/files-to-ignore',
    ignores: ['**/dist/**', '**/dist-temp/**', '**/src/imports/**', 'src/main.ts'],
  },

  ...recommended({
    noCustom: true,
    cssConfigPath: path.join(import.meta.dirname, 'src/assets/styles/index.css'),
    tsConfig: [
      'tsconfig.json',
      'tsconfig.node.json',
      'tsconfig.vue.json',
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
]
