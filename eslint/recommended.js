import stylisticTs from '@stylistic/eslint-plugin-ts'
import pluginQuery from '@tanstack/eslint-plugin-query'
import vueTsEslintConfig from '@vue/eslint-config-typescript'
import importPlugin from 'eslint-plugin-import'
import tailwind from 'eslint-plugin-tailwindcss'
import unusedImports from 'eslint-plugin-unused-imports'
import pluginVue from 'eslint-plugin-vue'

export default [
  ...pluginVue.configs['flat/recommended'],
  ...tailwind.configs['flat/recommended'],
  ...pluginQuery.configs['flat/recommended'],
  ...vueTsEslintConfig(),

  {
    files: ['**/*.cjs'],
    rules: {
      '@typescript-eslint/no-require-imports': 'off',
    },
  },

  {
    files: ['**/*.{ts,js,mts,tsx,json}'],
    rules: {
      indent: ['error', 2, {
        SwitchCase: 1,
      }],
    },
  },

  {
    files: ['**/*.json'],
    rules: {
      quotes: ['error', 'double'],
      '@typescript-eslint/no-unused-expressions': 'off',
      'comma-dangle': ['error', 'never'],
    },
  },

  {
    files: ['**/*.ts'],
    rules: {
      '@typescript-eslint/naming-convention': [
        'error',
        {selector: 'enum', format: ['PascalCase']},
        {selector: 'enumMember', format: ['UPPER_CASE', 'snake_case']},
      ],
    },
  },

  {
    files: ['**/*.{ts,js,vue}'],
    plugins: {
      import: importPlugin,
    },
    languageOptions: {
      parser: pluginVue.parser,
      ecmaVersion: 'latest',
      sourceType: 'module',
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
    },
    settings: {
      'import/parsers': {
        '@typescript-eslint/parser': ['.ts', '.js'],
      },
      'import/resolver': {
        typescript: {
          alwaysTryTypes: true,
          project: './tsconfig.vue.json',
        },
        node: true,
      },
    },
  },

  {
    files: ['**/*.{ts,js,vue}'],
    plugins: {
      'unused-imports': unusedImports,
      '@stylistic/ts': stylisticTs,
    },
    languageOptions: {
      parser: pluginVue.parser,
      ecmaVersion: 'latest',
      sourceType: 'module',
    },
    rules: {
      semi: ['error', 'never'],
      quotes: ['error', 'single', {allowTemplateLiterals: true}],
      'comma-dangle': ['error', 'always-multiline'],
      'comma-spacing': ['error', {before: false, after: true}],
      'object-curly-spacing': ['error', 'never'],
      'func-call-spacing': 'off',
      'template-curly-spacing': ['error', 'always'],
      'space-before-function-paren': ['error', {anonymous: 'always', named: 'never', asyncArrow: 'always'}],
      'no-undef': 'off',
      'default-case-last': 'off',
      'no-console': ['warn'],
      'no-unused-vars': 'off',
      '@typescript-eslint/no-unused-vars': ['error', {args: 'after-used', caughtErrors: 'none'}],
      'unused-imports/no-unused-imports': 'error',
      'tailwindcss/no-custom-classname': 'off',
      'tailwindcss/migration-from-tailwind-2': 'off',
      'no-multiple-empty-lines': [1, {max: 1, maxEOF: 0, maxBOF: 0}],
      'keyword-spacing': 1,
      'key-spacing': 1,
      '@stylistic/ts/function-call-spacing': 1,
      '@stylistic/ts/member-delimiter-style': [1, {multiline: {delimiter: 'none'}, singleline: {delimiter: 'comma'}}],
      '@stylistic/ts/type-annotation-spacing': [1, {before: false, after: true, overrides: {arrow: {before: true, after: true}}}],
      '@stylistic/ts/quote-props': [1, 'as-needed'],
    },
  },

  {
    files: ['**/*.vue'],
    rules: {
      'vue/script-indent': ['error', 2, {
        baseIndent: 0,
        switchCase: 1,
        ignores: [],
      }],
      'vue/component-name-in-template-casing': ['error', 'PascalCase', {registeredComponentsOnly: false}],
      'vue/component-tags-order': ['error', {
        order: ['template', 'script[setup]', 'style'],
      }],
      'vue/multiline-html-element-content-newline': ['error', {
        ignoreWhenEmpty: true,
        ignores: ['pre', 'textarea', 'span', 'tspan'],
        allowEmptyLines: false,
      }],
      'vue/attributes-order': ['error', {
        order: [
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
        alphabetical: false,
      }],
      'vue/prefer-use-template-ref': 'error',
      'vue/require-macro-variable-name': ['error', {defineProps: 'props', defineEmits: 'emit', defineSlots: 'slots', useSlots: 'slots', useAttrs: 'attrs'}],
      'vue/require-typed-ref': 'error',
      'vue/padding-line-between-blocks': ['error', 'always'],
      'vue/block-tag-newline': [1, {
        singleline: 'always',
        multiline: 'always',
      }],
      'vue/no-lone-template': ['error', {ignoreAccessible: false}],
    },
  },
]
