/** @type {import('tailwindcss').Config} */

module.exports = {
  mode: 'jit',
  darkMode: ['variant', [
    '.dark &:not(:is(.light *))',
  ]],
  content: [
    './src/**/*.{vue,ts}',
  ],
  presets: [
    require('../tailwind-base/index.cjs'),
  ],
}
