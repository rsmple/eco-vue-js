import {createTypeScriptImportResolver} from 'eslint-import-resolver-typescript'
import importPlugin, {createNodeResolver} from 'eslint-plugin-import-x'

import {readFileSync} from 'fs'

const createConfig = (tsConfig, astro = false) => {
  const file = readFileSync(tsConfig, 'utf-8')
  const parsed = JSON.parse(file)

  return {
    files: parsed.include ?? (astro ? ['**/*.{ts,js,vue,astro}'] : ['**/*.{ts,js,vue}']),
    plugins: {
      'import-x': importPlugin,
    },
    rules: {
      ...importPlugin.flatConfigs.recommended.rules,
      'import-x/order': [
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
      'import-x/no-useless-path-segments': [1, {noUselessIndex: true}],
      // 'import-x/extensions': [1, 'never'],
      'import-x/first': 1,
      'import-x/newline-after-import': 1,
      'import-x/namespace': 'off',
      'import-x/named': 'off',
      'import-x/default': 'off',
      'import-x/no-named-as-default': 'off',
      'import-x/no-named-as-default-member': 'off',
    },
    settings: {
      'import-x/parsers': {
        '@typescript-eslint/parser': ['.ts', '.js'],
      },
      'import-x/resolver-next': [
        createTypeScriptImportResolver({
          alwaysTryTypes: true,
          project: tsConfig,
        }),
        createNodeResolver(),
      ],
    },
  }
}

export default ({tsConfig = './tsconfig.json', astro = false}) => [
  {
    files: astro ? ['**/*.{ts,js,vue,astro}'] : ['**/*.{ts,js,vue}'],
    plugins: {
      'import-x': importPlugin,
    },
    rules: {
      ...importPlugin.flatConfigs.recommended.rules,
      ...(astro ? {
        'import-x/named': 'off',
        'import-x/default': 'off',
      } : {}),
      'import-x/order': [
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
      'import-x/no-useless-path-segments': [1, {noUselessIndex: true}],
      // 'import-x/extensions': [1, 'never'],
      'import-x/first': 1,
      'import-x/newline-after-import': 1,
      'import-x/namespace': 'off',
    },
  },

  ...(Array.isArray(tsConfig) ? tsConfig : [tsConfig]).map(cfg => createConfig(cfg, astro)),
]
