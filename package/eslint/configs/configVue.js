export default [
  {
    files: ['**/*.vue'],
    rules: {
      'vue/script-indent': ['warn', 2, {
        baseIndent: 0,
        switchCase: 1,
        ignores: [],
      }],
      'vue/component-name-in-template-casing': ['error', 'PascalCase', {registeredComponentsOnly: false}],
      'vue/block-order': ['error', {
        order: ['template', 'script[setup]', 'style'],
      }],
      'vue/multiline-html-element-content-newline': ['warn', {
        ignoreWhenEmpty: true,
        ignores: ['pre', 'textarea', 'span', 'tspan', 'template'],
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
