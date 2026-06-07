import tailwind from 'eslint-plugin-tailwindcss'

export default (config = {}) => [
  ...tailwind.configs['flat/recommended'],

  {
    files: config.astro ? ['**/*.{ts,js,vue,astro}'] : ['**/*.{ts,js,vue}'],
    rules: {
      'tailwindcss/no-custom-classname': 'off',
      'tailwindcss/migration-from-tailwind-2': 'off',
      'tailwindcss/enforces-negative-arbitrary-values': 'off',
    },
  },
]
