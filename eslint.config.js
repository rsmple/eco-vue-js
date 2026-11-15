import path from 'node:path'

import plugin from './package/eslint/plugin.js'
import recommended from './package/eslint/recommended.js'

const textPropertyNames = ['title', 'caption', 'description', 'placeholder', 'message', 'text', 'subtitle', 'tooltip', 'tooltipText', 'hint', 'label', 'emptyStub', 'acceptText', 'cancelText', 'disableMessage', 'ariaLabel']
const textAttributes = ['title', 'aria-label', 'aria-placeholder', 'aria-roledescription', 'aria-valuetext', 'aria-description', 'alt', 'placeholder', 'label', 'text', 'tooltip-text', 'empty-stub', 'caption', 'description']

const humanText = '[value=/[A-Z]|[a-z],? [a-z]/]:not([value=/^[A-Z0-9]{2,5}$/], [value=/^https?:/], [value=/^[a-z]+([A-Z][a-z]*)+$/], [value=/^[^A-Z\\s]+(\\s+[^A-Z\\s]+)*$/][value=/[-:[\\/]/])'
const humanTemplate = 'TemplateElement[value.raw=/[A-Z][a-z]|[a-z]{2} [a-z]|(^|\\s)[a-z]{2,}(\\s|$)/]'
const textProperty = `Property[key.name=/^(${ textPropertyNames.join('|') })$|(Text|Label|Stub|Title|Message|Prefix)$/]`

const rawTextSelectors = [
  `${ textProperty } > Literal.value${ humanText }`,
  `${ textProperty } > :matches(ConditionalExpression, LogicalExpression, BinaryExpression) > Literal${ humanText }`,
  `${ textProperty } > TemplateLiteral.value > ${ humanTemplate }`,
  `VariableDeclarator[id.name=/(LABEL|TITLE|TEXT)S?$|(Label|Title|Text)(s|Map)?$/] Property > Literal.value${ humanText }`,
].map(selector => ({selector, message: 'Raw text in a UI text property, add it to Texts and use getText()'}))

const templateTextSelectors = [
  `VExpressionContainer > Literal${ humanText }`,
  `ConditionalExpression > Literal${ humanText }:not(.test)`,
  `LogicalExpression > Literal.right${ humanText }`,
  `:matches(VExpressionContainer, ConditionalExpression, LogicalExpression) > TemplateLiteral > ${ humanTemplate }`,
].map(selector => ({selector, message: 'Raw text in a template expression, add it to Texts and use getText()'}))

export default [
  {
    name: 'app/files-to-lint',
    files: ['**/*.{ts,js,mts,tsx,vue,json,svg,css}'],
  },

  {
    name: 'app/files-to-ignore',
    ignores: ['**/dist/**', '**/dist-temp/**', '**/src/imports/**', 'src/main.ts', 'docs/.vitepress/cache/**'],
  },

  ...recommended({
    noCustom: true,
    cssConfigPath: path.join(import.meta.dirname, 'src/assets/styles/index.css'),
    tsConfig: [
      'tsconfig.json',
      'tsconfig.node.json',
      'tsconfig.vue.json',
      'tsconfig.docs.json',
      'docs/.vitepress/tsconfig.json',
    ],
  }),

  ...plugin.configs.motion().map(item => ({...item, ignores: ['package/eslint/**']})),

  {
    files: ['**/*.{ts,js,vue}'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          name: '@/main',
          message: 'Import direcrlty',
        },
      ],
    },
  },

  {
    name: 'app/docs-examples',
    files: ['docs/examples/**/*.{ts,vue}', 'src/components/*/docs/**/*.vue', 'docs/.vitepress/theme/**/*.{ts,vue}'],
    rules: {
      // Examples and the docs theme import the kit the way consumers do; icons resolve through the ambient module declaration.
      'import-x/no-unresolved': ['error', {ignore: ['^eco-vue-js/dist/assets/icons/']}],
      // Example files are demos named after what they show, never registered as components.
      'vue/multi-word-component-names': 'off',
    },
  },

  {
    name: 'app/texts',
    files: ['src/components/**/*.{ts,vue}', 'src/utils/**/*.ts', 'src/composables/**/*.ts'],
    ignores: ['src/components/*/docs/**', 'src/utils/themeConfig.ts', 'src/utils/texts.ts'],
    rules: {
      'vue/no-bare-strings-in-template': ['error', {allowlist: ['(', ')', ',', '.', '&', '+', '-', '=', '*', '/', '#', '%', '!', '?', ':', '[', ']', '{', '}', '<', '>', '\u00b7', '\u2022', '\u2010', '\u2013', '\u2014', '\u2212', '|', '/^[^A-Za-z]*$/', '/^[A-Z0-9]{1,5}$/', 'Shift'], attributes: {'/.+/': textAttributes}, directives: ['v-text']}],
      'no-restricted-syntax': ['error', ...rawTextSelectors],
      'vue/no-restricted-syntax': ['error', ...templateTextSelectors],
    },
  },
]
