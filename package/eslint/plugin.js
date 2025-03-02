import recommended from './recommended.js'
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

plugin.configs.recommended = [
  ...recommended,
  {
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
  },
]

export default plugin