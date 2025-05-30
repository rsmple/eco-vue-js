import pluginQuery from '@tanstack/eslint-plugin-query'
import {
  defineConfigWithVueTs,
  vueTsConfigs,
} from '@vue/eslint-config-typescript'
import pluginVue from 'eslint-plugin-vue'

import configImports from './configs/configImports.js'
import configJson from './configs/configJson.js'
import configTailwind from './configs/configTailwind.js'
import configTypescript from './configs/configTypescript.js'
import configVue from './configs/configVue.js'
import modalDeclaration from './rules/modal-declaration.js'
import modalImportAsync from './rules/modal-import-async.js'
import modalImport from './rules/modal-import.js'
import uiKitImports from './rules/ui-kit-imports.js'

const plugin = {
  rules: {
    'modal-declaration': modalDeclaration,
    'modal-import-async': modalImportAsync,
    'modal-import': modalImport,
    'ui-kit-imports': uiKitImports,
  },

  configs: {},
}

const customRules = {
  name: 'custom-rules',
  plugins: {
    'custom-rules': plugin,
  },
  files: ['**/*.{ts,js,vue}'],
  rules: {
    'custom-rules/modal-declaration': ['error'],
    'custom-rules/modal-import-async': ['error'],
    'custom-rules/modal-import': ['error'],
    'custom-rules/ui-kit-imports': ['error'],

    'no-restricted-imports': [
      'error',
      {
        name: 'eco-vue-js',
        message: 'Use import eco-vue-js/dist/',
      },
      {
        name: '@/main',
        message: 'Import direcrlty',
      },
    ],
  },
}

plugin.configs.recommended = (config = {}) => [
  ...config.noVue ? [] : defineConfigWithVueTs(
    pluginVue.configs['flat/recommended'],
    vueTsConfigs.recommendedTypeChecked,
  ).map(item => ({...item, files: ['**/*.{ts,tsx,vue}']})),

  ...config.noVue ? [] : configVue,
  
  ...pluginQuery.configs['flat/recommended'],

  ...configJson,
  ...configTypescript,
  ...configTailwind,
  ...configImports(config),

  ...config.noCustom ? [] : [customRules],
]

export default plugin