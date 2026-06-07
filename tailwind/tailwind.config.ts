import type {Config} from 'tailwindcss'

import tailwindBase from '../package/tailwind-base'

export default {
  mode: 'jit',
  content: [
    './src/**/*.{vue,ts}',
  ],
  presets: [
    tailwindBase,
  ],
} satisfies Config
