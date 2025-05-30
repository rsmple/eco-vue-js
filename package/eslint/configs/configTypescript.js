import stylistic from '@stylistic/eslint-plugin'
import unusedImports from 'eslint-plugin-unused-imports'
import pluginVue from 'eslint-plugin-vue'
import {parser as tseslintParser, plugin as tseslintPlugin} from 'typescript-eslint'

export default [
  {
    files: ['**/*.{ts,js,vue}'],
    plugins: {
      'unused-imports': unusedImports,
      '@stylistic': stylistic,
      '@typescript-eslint': tseslintPlugin,
    },
    languageOptions: {
      parser: pluginVue.parser,
      ecmaVersion: 'latest',
      sourceType: 'module',
    },
    rules: {
      semi: ['error', 'never'],
      quotes: ['error', 'single', {allowTemplateLiterals: true}],
      indent: ['error', 2, {SwitchCase: 1}],
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
      'unused-imports/no-unused-imports': 'error',
      'no-multiple-empty-lines': [1, {max: 1, maxEOF: 0, maxBOF: 0}],
      'keyword-spacing': 1,
      'key-spacing': 1,
      '@stylistic/function-call-spacing': 1,
      '@stylistic/member-delimiter-style': [1, {multiline: {delimiter: 'none'}, singleline: {delimiter: 'comma'}}],
      '@stylistic/type-annotation-spacing': [1, {before: false, after: true, overrides: {arrow: {before: true, after: true}}}],
      '@stylistic/quote-props': [1, 'as-needed'],

      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/no-unused-vars': ['error', {args: 'after-used', caughtErrors: 'none'}],
    },
  },

  {
    files: ['**/*.ts'],
    plugins: {
      '@typescript-eslint': tseslintPlugin,
    },
    languageOptions: {
      parser: tseslintParser,
      parserOptions: {
        projectService: true,
      },
    },
    rules: {
      '@typescript-eslint/naming-convention': [
        'error',
        {selector: 'enum', format: ['PascalCase']},
        {selector: 'enumMember', format: ['UPPER_CASE', 'snake_case']},
      ],
    },
  },

  {
    files: ['**/*.cjs'],
    rules: {
      '@typescript-eslint/no-require-imports': 'off',
    },
  },
]
