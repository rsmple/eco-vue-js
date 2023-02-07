/** @type {import('tailwindcss').Config} */

module.exports = {
  mode: 'jit',
  darkMode: 'class',
  content: [
    './src/**/*.{vue,ts}',
  ],
  presets: [
    require('../tailwind-base/index.cjs'),
  ],
}
