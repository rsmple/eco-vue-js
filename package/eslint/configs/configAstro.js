import {parser as tsParser} from 'typescript-eslint'

export default (astroParser) => [
  {
    files: ['**/*.astro'],
    languageOptions: {
      parser: astroParser,
      parserOptions: {
        parser: tsParser,
        extraFileExtensions: ['.astro'],
      },
    },
    rules: {
      'import/default': 'off',
      'import/no-named-as-default': 'off',
      'import/no-named-as-default-member': 'off',
      'import/named': 'off',
      'import/namespace': 'off',
      indent: 'off',
      '@stylistic/indent': 'off',
    },
  },
]
