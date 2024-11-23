import pluginVue from 'eslint-plugin-vue'
import vueTsEslintConfig from '@vue/eslint-config-typescript'
import unusedImports from 'eslint-plugin-unused-imports'
import tailwind from 'eslint-plugin-tailwindcss'
import pluginQuery from '@tanstack/eslint-plugin-query'

export default [
  {
    name: 'app/files-to-lint',
    files: ['**/*.{ts,js,mts,tsx,vue,json}'],
  },

  {
    name: 'app/files-to-ignore',
    ignores: ['**/dist/**', '**/dist-ssr/**', '**/coverage/**'],
  },

  ...pluginVue.configs['flat/recommended'],
  ...tailwind.configs['flat/recommended'],
  ...pluginQuery.configs['flat/recommended'],
  ...vueTsEslintConfig(),

  {
    files: ['tailwind/**', 'eslint/**', 'tailwind-base/**'],
    rules: {
      '@typescript-eslint/no-require-imports': 'off',
    },
  },

  {
    files: ['**/*.{ts,js,mts,tsx,json}'],
    rules: {
      'indent': ['error', 2, {
        'SwitchCase': 1,
      }],
    },
  },

  {
    files: ['**/*.json'],
    rules: {
      'quotes': ['error', 'double'],
      '@typescript-eslint/no-unused-expressions': 'off',
      'comma-dangle': ['error', 'never'],
    },
  },

  {
    files: ['**/*.ts'],
    rules: {
      '@typescript-eslint/naming-convention': [
        'error',
        {'selector': 'enum', 'format': ['PascalCase']},
        {'selector': 'enumMember', 'format': ['UPPER_CASE', 'snake_case']},
      ],
    },
  },

  {
    files: ['**/*.{ts,js,mts,tsx,vue}'],
    plugins: {
      'unused-imports': unusedImports,
    },
    rules: {
      'semi': ['error', 'never'],
      'quotes': ['error', 'single', {allowTemplateLiterals: true}],
      'comma-dangle': ['error', 'always-multiline'],
      'comma-spacing': ['error', {'before': false, 'after': true}],
      'object-curly-spacing': ['error', 'never'],
      'func-call-spacing': 'off',
      // 'template-curly-spacing': ['error', 'always'],
      'space-before-function-paren': ['error', {anonymous: 'always', named: 'never', asyncArrow: 'always'}],
      'vue/no-lone-template': ['error', {
        ignoreAccessible: false,
      }],
      'no-undef': 'off',
      'default-case-last': 'off',
      'no-console': ['warn'],
      'no-unused-vars': 'off',
      '@typescript-eslint/no-unused-vars': ['error', {'args': 'after-used', 'caughtErrors': 'none'}],
      'unused-imports/no-unused-imports': 'error',
      'tailwindcss/classnames-order': 'off', // 'error',
      'tailwindcss/no-custom-classname': 'off',
      'tailwindcss/migration-from-tailwind-2': 'off',
      'tailwindcss/enforces-shorthand': 'off', // 'error',
      'tailwindcss/no-unnecessary-arbitrary-value': 'off', // 'error',
      'no-restricted-imports': [
        'error',
        {
          name: 'eco-vue-js',
          message: 'Use import eco-vue-js/dist/',
        },
      ],
    },
  },

  {
    files: ['**/*.vue'],
    rules: {
      'vue/script-indent': ['error', 2, {
        'baseIndent': 0,
        'switchCase': 1,
        'ignores': [],
      }],
      'vue/component-name-in-template-casing': ['error', 'PascalCase', {registeredComponentsOnly: false}],
      'vue/component-tags-order': ['error', {
        'order': ['template', 'script[setup]', 'style'],
      }],
      'vue/multiline-html-element-content-newline': ['error', {
        'ignoreWhenEmpty': true,
        'ignores': ['pre', 'textarea', 'span', 'tspan'],
        'allowEmptyLines': false,
      }],
      'vue/attributes-order': ['error', {
        'order': [
          'DEFINITION',
          'LIST_RENDERING',
          'CONDITIONALS',
          'RENDER_MODIFIERS',
          'GLOBAL',
          ['UNIQUE', 'SLOT'],
          'TWO_WAY_BINDING',
          'OTHER_DIRECTIVES',
          ['ATTR_DYNAMIC', 'ATTR_STATIC', 'ATTR_SHORTHAND_BOOL'],
          'EVENTS',
          'CONTENT',
        ],
        'alphabetical': false,
      }],
      // 'vue/prefer-use-template-ref': 'error',
      'vue/require-macro-variable-name': ['error', {'defineProps': 'props', 'defineEmits': 'emit', 'defineSlots': 'slots', 'useSlots': 'slots', 'useAttrs': 'attrs'}],
      'vue/require-typed-ref': 'error',
    },
  },
]
