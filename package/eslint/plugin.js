import motionCss from './processors/motion-css.js'
import recommended from './recommended.js'
import modalDeclaration from './rules/modal-declaration.js'
import modalImportAsync from './rules/modal-import-async.js'
import modalImport from './rules/modal-import.js'
import motionSafe from './rules/motion-safe.js'
import uiKitImports from './rules/ui-kit-imports.js'

const plugin = {
  rules: {
    'modal-declaration': modalDeclaration,
    'modal-import-async': modalImportAsync,
    'modal-import': modalImport,
    'motion-safe': motionSafe,
    'ui-kit-imports': uiKitImports,
  },

  processors: {
    'motion-css': motionCss(),
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

const motionRules = (config = {}) => [
  {
    name: 'custom-rules/motion',
    files: config.astro ? ['**/*.{ts,js,vue,astro}'] : ['**/*.{ts,js,vue}'],
    plugins: {
      'custom-rules': plugin,
    },
    rules: {
      'custom-rules/motion-safe': ['warn'],
    },
  },
  {
    name: 'custom-rules/motion-css',
    files: ['**/*.css'],
    plugins: {
      'custom-rules': plugin,
    },
    processor: 'custom-rules/motion-css',
  },
]

plugin.configs.motion = motionRules

plugin.configs.recommended = (config = {}) => [
  ...recommended(config),

  ...config.noCustom ? [] : [customRules, ...motionRules(config)],
]

export default plugin