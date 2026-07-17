import importPlugin from 'eslint-plugin-import'

import {readFileSync} from 'fs'

const createConfig = (tsConfig, astro = false) => {
  const file = readFileSync(tsConfig, 'utf-8')
  const parsed = JSON.parse(file)

  return {
    files: parsed.include ?? (astro ? ['**/*.{ts,js,vue,astro}'] : ['**/*.{ts,js,vue}']),
    plugins: {
      import: importPlugin,
    },
    rules: {
      ...importPlugin.flatConfigs.recommended.rules,
      'import/order': [
        1,
        {
          'newlines-between': 'always',
          named: true,
          groups: ['type', 'external', 'builtin', 'internal', 'sibling', 'parent', 'index'],
          distinctGroup: true,
          pathGroups: [
            {pattern: 'eco-vue-js/**/W**', group: 'builtin', position: 'before'},
            {pattern: '**/W**', group: 'builtin', position: 'before'},
            {pattern: 'eco-vue-js/**/Icon**', group: 'builtin', position: 'before'},
            {pattern: '**/Icon**', group: 'builtin', position: 'before'},
            {pattern: 'eco-vue-js/**', group: 'external', position: 'after'},
          ],
          pathGroupsExcludedImportTypes: ['builtin'],
          alphabetize: {order: 'asc', caseInsensitive: false},
        },
      ],
      'import/no-useless-path-segments': [1, {noUselessIndex: true}],
      // 'import/extensions': [1, 'never'],
      'import/first': 1,
      'import/newline-after-import': 1,
      'import/namespace': 'off',
      'import/named': 'off',
      'import/default': 'off',
      'import/no-named-as-default': 'off',
      'import/no-named-as-default-member': 'off',
    },
    settings: {
      'import/parsers': {
        '@typescript-eslint/parser': ['.ts', '.js'],
      },
      'import/resolver': {
        typescript: {
          alwaysTryTypes: true,
          project: tsConfig,
        },
        node: true,
      },
    },
  }
}

export default ({tsConfig = './tsconfig.json', astro = false}) => [
  {
    files: astro ? ['**/*.{ts,js,vue,astro}'] : ['**/*.{ts,js,vue}'],
    plugins: {
      import: importPlugin,
    },
    rules: {
      ...importPlugin.flatConfigs.recommended.rules,
      ...(astro ? {
        'import/named': 'off',
        'import/default': 'off',
      } : {}),
      'import/order': [
        1,
        {
          'newlines-between': 'always',
          named: true,
          groups: ['type', 'external', 'builtin', 'internal', 'sibling', 'parent', 'index'],
          distinctGroup: true,
          pathGroups: [
            {pattern: 'eco-vue-js/**/W**', group: 'builtin', position: 'before'},
            {pattern: '**/W**', group: 'builtin', position: 'before'},
            {pattern: 'eco-vue-js/**/Icon**', group: 'builtin', position: 'before'},
            {pattern: '**/Icon**', group: 'builtin', position: 'before'},
            {pattern: 'eco-vue-js/**', group: 'external', position: 'after'},
          ],
          pathGroupsExcludedImportTypes: ['builtin'],
          alphabetize: {order: 'asc', caseInsensitive: false},
        },
      ],
      'import/no-useless-path-segments': [1, {noUselessIndex: true}],
      // 'import/extensions': [1, 'never'],
      'import/first': 1,
      'import/newline-after-import': 1,
      'import/namespace': 'off',
    },
  },

  ...(Array.isArray(tsConfig) ? tsConfig : [tsConfig]).map(cfg => createConfig(cfg, astro)),
]
