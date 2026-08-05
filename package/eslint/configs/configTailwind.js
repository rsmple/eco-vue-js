import tailwind from 'eslint-plugin-tailwindcss'

const DEFAULT_CSS_CONFIG_PATH = 'src/assets/styles/styles.css'

export default (config = {}) => [
  {
    files: config.astro ? ['**/*.{ts,js,vue,astro}'] : ['**/*.{ts,js,vue}'],
    plugins: {tailwindcss: tailwind},
    settings: {
      tailwindcss: {
        cssConfigPath: config.cssConfigPath ?? DEFAULT_CSS_CONFIG_PATH,
      },
    },
    rules: {
      ...tailwind.configs.recommended.rules,

      'tailwindcss/no-custom-classname': 'off',
      'tailwindcss/enforces-negative-arbitrary-values': 'off',
    },
  },
]
