/**
 * The docs site's theme presets, and the `@theme` CSS a set of theme tokens makes. No browser or Vue code, so
 * `build/color-roles/contrast-test.ts` checks the presets with the same CSS an app would copy.
 */

/** Tailwind's neutral scales. The kit's `gray-*` is zinc; a theme swaps in another one whole. */
export const NEUTRAL_SCALES = {
  zinc: ['98.5% 0 0', '96.7% 0.001 286.375', '92% 0.004 286.32', '87.1% 0.006 286.286', '70.5% 0.015 286.067', '55.2% 0.016 285.938', '44.2% 0.017 285.786', '37% 0.013 285.805', '27.4% 0.006 286.033', '21% 0.006 285.885', '14.1% 0.005 285.823'],
  slate: ['98.4% 0.003 247.858', '96.8% 0.007 247.896', '92.9% 0.013 255.508', '86.9% 0.022 252.894', '70.4% 0.04 256.788', '55.4% 0.046 257.417', '44.6% 0.043 257.281', '37.2% 0.044 257.287', '27.9% 0.041 260.031', '20.8% 0.042 265.755', '12.9% 0.042 264.695'],
  gray: ['98.5% 0.002 247.839', '96.7% 0.003 264.542', '92.8% 0.006 264.531', '87.2% 0.01 258.338', '70.7% 0.022 261.325', '55.1% 0.027 264.364', '44.6% 0.03 256.802', '37.3% 0.034 259.733', '27.8% 0.033 256.848', '21% 0.034 264.665', '13% 0.028 261.692'],
  neutral: ['98.5% 0 0', '97% 0 0', '92.2% 0 0', '87% 0 0', '70.8% 0 0', '55.6% 0 0', '43.9% 0 0', '37.1% 0 0', '26.9% 0 0', '20.5% 0 0', '14.5% 0 0'],
  stone: ['98.5% 0.001 106.423', '97% 0.001 106.424', '92.3% 0.003 48.717', '86.9% 0.005 56.366', '70.9% 0.01 56.259', '55.3% 0.013 58.071', '44.4% 0.011 73.639', '37.4% 0.01 67.558', '26.8% 0.007 34.298', '21.6% 0.006 56.043', '14.7% 0.004 49.25'],
} as const

export type NeutralScale = keyof typeof NEUTRAL_SCALES

export const NEUTRAL_STEPS = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950] as const

export const isNeutralScale = (value: unknown): value is NeutralScale => typeof value === 'string' && value in NEUTRAL_SCALES

/**
 * Keys are CSS variable names without `--`: `color-*` and `role-*` go in the app's `@theme`, `w-*` on `body`.
 * `neutral` names a scale from `NEUTRAL_SCALES` and becomes the `gray-*` colors.
 */
export type PresetTokens = Record<string, string>

export const PRESETS = [
  {id: 'default', name: 'Default', look: 'The kit\'s violet on zinc, as this site ships', tokens: {}},
  {
    id: 'ocean',
    name: 'Ocean',
    look: 'Blue primary, cyan info, slate neutrals',
    tokens: {
      neutral: 'slate',
      'color-primary': 'oklch(54% 0.15 250)',
      'color-info': 'oklch(55% 0.11 215)',
    },
  },
  {
    id: 'forest',
    name: 'Forest',
    look: 'Green primary, lime positive, stone neutrals, pill-shaped fields and buttons',
    tokens: {
      neutral: 'stone',
      'color-primary': 'oklch(52% 0.11 165)',
      'color-positive': 'oklch(55% 0.15 135)',
      'w-input-rounded': '1.125rem',
      'w-button-rounded': '1.125rem',
    },
  },
  {
    id: 'sunset',
    name: 'Sunset',
    look: 'Orange primary, rose negative, stone neutrals',
    tokens: {
      neutral: 'stone',
      'color-primary': 'oklch(57% 0.17 45)',
      'color-negative': 'oklch(55% 0.21 10)',
      'color-warning': 'oklch(80% 0.15 75)',
    },
  },
  {
    id: 'compact',
    name: 'Compact',
    look: 'Monochrome: near-black primary that turns light in dark mode, no tint, 2rem fields and buttons, small radii',
    tokens: {
      neutral: 'neutral',
      'color-primary': 'oklch(30% 0 0)',
      'color-primary-dark': 'oklch(88% 0 0)',
      'w-input-height': '2rem',
      'w-input-rounded': '0.25rem',
      'w-input-gap': '0.125rem',
      'w-button-height': '2rem',
      'w-button-rounded': '0.25rem',
      'w-list-header-height': '2rem',
      'w-list-header-rounded': '0.25rem',
    },
  },
] as const satisfies {id: string, name: string, look: string, tokens: PresetTokens}[]

export type PresetId = typeof PRESETS[number]['id']

/**
 * `neutral` expanded to the `gray-*` colors it stands for, and the dark background to the scale's 900 unless the
 * theme sets its own; other tokens as they are. The kit keeps `default-dark` fixed, since apps that set their own
 * `gray-900` use the two as different surfaces.
 */
export const expandNeutral = (tokens: PresetTokens): [key: string, value: string][] => Object.entries(tokens).flatMap(([key, value]): [string, string][] => {
  if (key !== 'neutral') return [[key, value]]
  if (!isNeutralScale(value)) return []

  const scale = NEUTRAL_SCALES[value].map((color, index): [string, string] => [`color-gray-${ NEUTRAL_STEPS[index] }`, `oklch(${ color })`])

  return 'color-default-dark' in tokens ? scale : [...scale, ['color-default-dark', 'var(--color-gray-900)']]
})

/** The `@theme` block for the color tokens of a theme, or an empty string when there are none. */
export const getThemeBlock = (tokens: PresetTokens) => {
  const entries = expandNeutral(tokens).filter(([key]) => !key.startsWith('w-'))

  return entries.length ? ['@theme {', ...entries.map(([key, value]) => `  --${ key }: ${ value };`), '}'].join('\n') : ''
}
