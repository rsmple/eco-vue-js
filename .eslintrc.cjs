/* eslint-env node */
require('@rushstack/eslint-patch/modern-module-resolution')

module.exports = {
  root: true,
  'extends': [
    '@vue/typescript/recommended',
    '@vue/eslint-config-typescript',
    'plugin:vue/vue3-recommended',
    'plugin:vue/vue3-essential',
  ],
  parserOptions: {
    ecmaVersion: 'latest',
  },
  env: {
    'vue/setup-compiler-macros': true,
  },
  rules: {
    '@typescript-eslint/semi': ['error', 'never'],
    quotes: ['error', 'single', {allowTemplateLiterals: true}],
    'unused-imports/no-unused-imports-ts': 'error',
    'comma-dangle': ['error', 'always-multiline'],
    'object-curly-spacing': [2, 'never'],
    'func-call-spacing': 'off',
    '@typescript-eslint/func-call-spacing': ['error'],
    'space-before-function-paren': ['error', {anonymous: 'always', named: 'never', asyncArrow: 'always'}],
    'vue/no-lone-template': ['error', {
      ignoreAccessible: false,
    }],
    'no-undef': 'off',
    'default-case-last': 'off',
    '@typescript-eslint/no-unused-vars': ['error', {vars: 'all', args: 'none', ignoreRestSiblings: false}],
    'no-empty': ['error', {'allowEmptyCatch': true}],
  },
  plugins: [
    'unused-imports',
  ],
}
