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
      'import-x/default': 'off',
      'import-x/no-named-as-default': 'off',
      'import-x/no-named-as-default-member': 'off',
      'import-x/named': 'off',
      'import-x/namespace': 'off',
      indent: 'off',
      '@stylistic/indent': 'off',
    },
  },
]
