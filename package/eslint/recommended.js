import pluginQuery from '@tanstack/eslint-plugin-query'
import {
  defineConfigWithVueTs,
  vueTsConfigs,
} from '@vue/eslint-config-typescript'
import pluginVue from 'eslint-plugin-vue'

import configAstro from './configs/configAstro.js'
import configImports from './configs/configImports.js'
import configJson from './configs/configJson.js'
import configSvgo from './configs/configSvgo.js'
import configTailwind from './configs/configTailwind.js'
import configTypescript from './configs/configTypescript.js'
import configVue from './configs/configVue.js'

export default (config = {}) => [
  ...config.noVue ? [] : defineConfigWithVueTs(
    pluginVue.configs['flat/recommended'],
    vueTsConfigs.recommendedTypeChecked,
  ).map(item => ({...item, files: ['**/*.{ts,tsx,vue}']})),

  ...config.noVue ? [] : configVue,

  ...pluginQuery.configs['flat/recommended'],

  ...configJson,
  ...configTypescript(config),
  ...configTailwind(config),
  ...configImports(config),
  ...configSvgo,

  ...config.astro ? configAstro(config.astro) : [],
]
