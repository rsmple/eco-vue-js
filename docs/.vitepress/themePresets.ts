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

/** A neutral scale whose tint suits a hue: slate for blues, zinc for violets, stone for warm hues. */
const neutralForHue = (hue: number, random: () => number): NeutralScale => {
  if (hue >= 200 && hue < 275) return 'slate'
  if (hue >= 275 && hue < 330) return 'zinc'
  if (hue >= 20 && hue < 120) return 'stone'

  return (['zinc', 'gray', 'neutral'] as const)[Math.floor(random() * 3)]
}

const SIZES = [
  {height: 2, header: 2, gap: 0.125},
  {height: 2.25, header: 2.25, gap: 0.125},
  {height: 2.5, header: 2.25, gap: 0.25},
] as const

/** Input radii; the last one is a pill. Buttons and list headers take half as much again, up to a pill. */
const RADII = [0.25, 0.5, 0.75, Infinity] as const

const pick = <T>(list: readonly T[], random: () => number): T => list[Math.floor(random() * list.length)]

const rem = (value: number) => `${ +value.toFixed(4) }rem`

/** Linear sRGB of an OKLCH color, or null outside the sRGB gamut. */
const toLinearRgb = (l: number, c: number, h: number): [number, number, number] | null => {
  const a = c * Math.cos(h * Math.PI / 180)
  const b = c * Math.sin(h * Math.PI / 180)
  const [lms1, lms2, lms3] = [l + 0.3963377774 * a + 0.2158037573 * b, l - 0.1055613458 * a - 0.0638541728 * b, l - 0.0894841775 * a - 1.2914855480 * b].map(value => value ** 3)
  const rgb: [number, number, number] = [
    4.0767416621 * lms1 - 3.3077115913 * lms2 + 0.2309699292 * lms3,
    -1.2684380046 * lms1 + 2.6097574011 * lms2 - 0.3413193965 * lms3,
    -0.0041960863 * lms1 - 0.7034186147 * lms2 + 1.7076147010 * lms3,
  ]

  return rgb.every(value => value >= -0.0001 && value <= 1.0001) ? rgb : null
}

const luminance = ([r, g, b]: [number, number, number]) => 0.2126 * r + 0.7152 * g + 0.0722 * b

const contrast = (first: number, second: number) => (Math.max(first, second) + 0.05) / (Math.min(first, second) + 0.05)

/** Lightness of `oklch(L% C H)` strings: the scales and the kit's default. */
const parseLightness = (color: string) => Number.parseFloat(color) / 100

/** The highest chroma of this lightness and hue that stays in sRGB. */
const maxChroma = (l: number, hue: number) => {
  let low = 0
  let high = 0.4

  for (let step = 0; step < 16; step++) {
    const middle = (low + high) / 2

    if (toLinearRgb(l, middle, hue)) low = middle
    else high = middle
  }

  return low
}

/** Below this chroma a fill reads as a tinted gray rather than a color. */
const MIN_CHROMA = 0.08

/** Past this chroma violets and pinks turn neon. */
const MAX_CHROMA = 0.26

/**
 * Fills that are brown or olive at any chroma: ambers, yellows and yellow-greens dark enough for 3:1 on a white page,
 * and dark oranges. Bright yellows only pass on the dark page, so they never come up as a light primary.
 */
const isMuddy = (l: number, hue: number) => (hue >= 55 && hue < 140) || (hue >= 35 && hue < 55 && l < 0.55)

type Fill = {l: number, c: number}

/**
 * Fills of this hue, at `saturation` of the most chroma each lightness allows, that pass the kit's contrast checks on
 * a page of `pageLuminance`: 3:1 against the page, and 4.5:1 for the black or white text `text-tone-on` puts on it
 * (white below L 0.58).
 */
const passingFills = (hue: number, saturation: number, pageLuminance: number) => {
  const result: Fill[] = []

  for (let l = 0.4; l <= 0.8; l += 0.005) {
    const c = Math.min(maxChroma(l, hue) * saturation, MAX_CHROMA)
    if (c < MIN_CHROMA || isMuddy(l, hue)) continue

    const fill = luminance(toLinearRgb(l, c, hue) as [number, number, number])
    const text = l < 0.58 ? 1 : 0

    if (contrast(fill, pageLuminance) >= 3.1 && contrast(fill, text) >= 4.6) result.push({l, c})
  }

  return result
}

/**
 * A theme from one random primary, the neutral scale that suits its hue, and a size with a radius. The primary is
 * close to the most saturated its lightness allows, and that lightness is picked where the fill passes the contrast
 * checks on a white page; when it fails on the dark page, the nearest fill that passes there becomes
 * `color-primary-dark`.
 */
export const getRandomTokens = (random: () => number = Math.random): PresetTokens => {
  for (;;) {
    const hue = Math.round(random() * 360)
    const saturation = 0.85 + random() * 0.15
    const neutral = neutralForHue(hue, random)
    const darkPage = toLinearRgb(parseLightness(NEUTRAL_SCALES[neutral][9]), 0, 0) as [number, number, number]
    const light = passingFills(hue, saturation, 1)
    const dark = passingFills(hue, saturation, luminance(darkPage))

    if (!light.length || !dark.length) continue

    // Deep fills with white text and bright ones with black text, equally often: the bright range is narrower.
    const withWhiteText = light.filter(fill => fill.l < 0.58)
    const withBlackText = light.filter(fill => fill.l >= 0.58)
    const primary = pick(withWhiteText.length && (!withBlackText.length || random() < 0.5) ? withWhiteText : withBlackText, random)
    const primaryDark = dark.some(fill => fill.l === primary.l) ? null : dark.reduce((best, fill) => Math.abs(fill.l - primary.l) < Math.abs(best.l - primary.l) ? fill : best)
    const color = (fill: Fill) => `oklch(${ (fill.l * 100).toFixed(1) }% ${ fill.c.toFixed(3) } ${ hue })`
    const size = pick(SIZES, random)
    const radius = pick(RADII, random)

    return {
      neutral,
      'color-primary': color(primary),
      ...primaryDark === null ? {} : {'color-primary-dark': color(primaryDark)},
      'w-input-height': rem(size.height),
      'w-input-rounded': rem(Math.min(radius, size.height / 2)),
      'w-input-gap': rem(size.gap),
      'w-button-height': rem(size.height),
      'w-button-rounded': rem(Math.min(radius * 1.5, size.height / 2)),
      'w-list-header-height': rem(size.header),
      'w-list-header-rounded': rem(Math.min(radius * 1.5, size.header / 2)),
    }
  }
}
