/** @type {import('tailwindcss').Config} */
const colors = require('tailwindcss/colors')

module.exports = {
  mode: 'jit',
  darkMode: 'class',
  content: [
    './src/**/*.{vue,ts}',
  ],
  presets: [
    require('../tailwind-base/index.cjs')
  ],
}
