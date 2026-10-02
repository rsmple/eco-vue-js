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

/**
 * How saturated a random primary is: the share of the most chroma its lightness allows, the chroma it stays within,
 * the share of the hue's most saturated passing fill its lightness keeps to (`peak`, so it doesn't sink into the dull
 * dark fills), and how often it is a bright fill with black text rather than a deep one with white. Neon also takes
 * the most saturated fill that passes on the dark page for `color-primary-dark`.
 */
export const RANDOM_STYLES = [
  {id: 'soft', name: 'Soft', saturation: [0.45, 0.65], minChroma: 0.05, maxChroma: 0.16, peak: 0.85, blackText: 0.3},
  {id: 'vivid', name: 'Vivid', saturation: [0.85, 1], minChroma: 0.08, maxChroma: 0.26, peak: 0.92, blackText: 0.5},
  {id: 'neon', name: 'Neon', saturation: [1, 1], minChroma: 0.12, maxChroma: 0.4, peak: 0.97, blackText: 0.8},
] as const

export type RandomStyle = typeof RANDOM_STYLES[number]

export type RandomStyleId = RandomStyle['id']

export const isRandomStyleId = (value: unknown): value is RandomStyleId => RANDOM_STYLES.some(style => style.id === value)

/**
 * Fills that are brown or olive at any chroma: ambers, yellows and yellow-greens dark enough for 3:1 on a white page,
 * and dark oranges. Yellows and limes are muddy at any lightness that passes 3:1 there, so they come up only as light
 * fills with black text, the way warning does.
 */
const isMuddy = (l: number, hue: number) => (hue >= 55 && hue < 128) || (hue >= 35 && hue < 55 && l < 0.55)

type Fill = {l: number, c: number}

/**
 * The status tones: the hues each one keeps to, the wider range it shifts into when the primary takes those (a red
 * primary turns negative to rose or red-orange, a yellow one turns warning to orange), and for warning the bright fill
 * with black text it always is. Ranges run clockwise from the first hue to the second, past 360 when it's lower.
 */
const STATUS_TONES = [
  {key: 'negative', hues: [5, 32], shifted: [345, 45], warning: false},
  {key: 'positive', hues: [140, 175], shifted: [128, 200], warning: false},
  {key: 'warning', hues: [65, 95], shifted: [50, 105], warning: true},
  {key: 'info', hues: [205, 265], shifted: [190, 280], warning: false},
] as const

/**
 * How far a status hue keeps from the primary's and the other tones', so no two read as one color; the second is what
 * it settles for when nothing in its wider range is that far, as warning beside a yellow primary.
 */
const STATUS_HUE_DISTANCES = [30, 20]

const hueDistance = (first: number, second: number) => Math.min(Math.abs(first - second), 360 - Math.abs(first - second))

const hueRange = ([from, to]: readonly [number, number]) => Array.from({length: (to - from + 360) % 360 + 1}, (_, index) => (from + index) % 360)

/**
 * The hues a status tone tries, in order: its own hues away from the `taken` ones (the primary's and the tones' before
 * it), from a random one; when those take them all, the hues of its wider range away from them, nearest its own first,
 * at each of `STATUS_HUE_DISTANCES` in turn; when even those are taken, its own hues farthest from the nearest taken
 * one first.
 */
const statusHues = (tone: typeof STATUS_TONES[number], taken: number[], random: () => number) => {
  const own = hueRange(tone.hues)
  const distanceFromTaken = (hue: number) => Math.min(...taken.map(item => hueDistance(hue, item)))
  const apart = own.filter(hue => distanceFromTaken(hue) >= STATUS_HUE_DISTANCES[0])

  if (apart.length) {
    const start = Math.floor(random() * apart.length)

    return [...apart.slice(start), ...apart.slice(0, start)]
  }

  const distanceFromOwn = (hue: number) => Math.min(...own.map(item => hueDistance(hue, item)))
  const shifted = STATUS_HUE_DISTANCES.flatMap(distance => hueRange(tone.shifted)
    .filter(hue => distanceFromTaken(hue) >= distance)
    .sort((first, second) => distanceFromOwn(first) - distanceFromOwn(second)))

  return [...shifted, ...own.sort((first, second) => distanceFromTaken(second) - distanceFromTaken(first))]
}

/**
 * The fills `passingFills` looks through: their lightness, how much contrast against the page they need, and whether
 * muddy ones are left out. A `light` fill, warning's and a yellow or lime primary's, takes black text and needs only
 * 1.5:1, as the kit checks for those tones, and its yellows are muddy only below its lightness.
 */
const FILL_LIMITS = {
  fill: {from: 0.4, to: 0.8, minPage: 3.1, muddy: true},
  light: {from: 0.72, to: 0.9, minPage: 1.6, muddy: false},
} as const

/**
 * Fills of this hue, at `saturation` of the most chroma each lightness allows within the style's limits, that pass
 * the kit's contrast checks on a page of `pageLuminance`: `minPage` against the page, and 4.5:1 for the black or white
 * text `text-tone-on` puts on it (white below L 0.58).
 */
const passingFills = (hue: number, saturation: number, style: RandomStyle, pageLuminance: number, limits: typeof FILL_LIMITS[keyof typeof FILL_LIMITS] = FILL_LIMITS.fill) => {
  const result: Fill[] = []
  const {from, to, minPage, muddy} = limits

  for (let l = from; l <= to; l += 0.005) {
    const c = Math.min(maxChroma(l, hue) * saturation, style.maxChroma)
    if (c < style.minChroma || (muddy && isMuddy(l, hue))) continue

    const fill = luminance(toLinearRgb(l, c, hue) as [number, number, number])
    const text = l < 0.58 ? 1 : 0

    if (contrast(fill, pageLuminance) >= minPage && contrast(fill, text) >= 4.6) result.push({l, c})
  }

  return result
}

/** The fills within the style's `peak` share of the most saturated one: on a white page, the brightest that pass. */
const nearPeak = (fills: Fill[], style: RandomStyle) => {
  const most = Math.max(...fills.map(fill => fill.c))

  return fills.filter(fill => fill.c >= most * style.peak)
}

/**
 * The fill for dark mode when `fill` doesn't pass on the dark page: the nearest one that does. Neon takes the most
 * saturated one instead, when it has more chroma. Null when `fill` stays.
 */
const getDarkFill = (fill: Fill, dark: Fill[], style: RandomStyle): Fill | null => {
  const mostSaturated = dark.reduce((best, item) => item.c > best.c ? item : best)
  const nearest = dark.reduce((best, item) => Math.abs(item.l - fill.l) < Math.abs(best.l - fill.l) ? item : best)

  if (style.id === 'neon' && mostSaturated.c > fill.c) return mostSaturated

  return dark.some(item => item.l === fill.l) ? null : nearest
}

const toColor = (fill: Fill, hue: number) => `oklch(${ (fill.l * 100).toFixed(1) }% ${ fill.c.toFixed(3) } ${ hue })`

/**
 * A status tone in the theme's style and saturation, with the hue it took: a hue away from the `taken` ones from
 * `statusHues`, and among the fills near its peak chroma, the one nearest the primary's lightness with the same black
 * or white text, so the tones carry the same weight. Warning is always a bright fill with black text, the most
 * saturated one that passes.
 */
const getStatusTokens = (
  tone: typeof STATUS_TONES[number],
  primary: Fill,
  taken: number[],
  saturation: number,
  style: RandomStyle,
  darkPageLuminance: number,
  random: () => number,
): {hue: number, tokens: PresetTokens} | null => {
  for (const hue of statusHues(tone, taken, random)) {
    const limits = tone.warning ? FILL_LIMITS.light : FILL_LIMITS.fill
    const passing = passingFills(hue, saturation, style, 1, limits)
    const dark = passingFills(hue, saturation, style, darkPageLuminance, limits)
    if (!passing.length || !dark.length) continue

    const light = nearPeak(passing, style)
    const sameText = light.filter(fill => (fill.l < 0.58) === (primary.l < 0.58))
    const fill = tone.warning
      ? light.reduce((best, item) => item.c > best.c ? item : best)
      : (sameText.length ? sameText : light).reduce((best, item) => Math.abs(item.l - primary.l) < Math.abs(best.l - primary.l) ? item : best)
    const darkFill = getDarkFill(fill, dark, style)

    return {
      hue,
      tokens: {
        [`color-${ tone.key }`]: toColor(fill, hue),
        ...darkFill === null ? {} : {[`color-${ tone.key }-dark`]: toColor(darkFill, hue)},
      },
    }
  }

  return null
}

/**
 * A theme from one random primary in a style from `RANDOM_STYLES`, the status tones that go with it in the same style,
 * the neutral scale that suits its hue, and a size with a radius. The primary's lightness is picked where the fill
 * passes the contrast checks on a white page and stays near the hue's peak chroma; when it fails on the dark page, the
 * nearest fill that passes there becomes `color-primary-dark`. A yellow or lime primary is a light fill with black text,
 * as warning is. The status tones follow with
 * `getStatusTokens`, each keeping away from the primary's hues and the ones before it.
 */
export const getRandomTokens = (styleId: RandomStyleId = 'vivid', random: () => number = Math.random): PresetTokens => {
  const style = RANDOM_STYLES.find(item => item.id === styleId) ?? RANDOM_STYLES[1]

  for (;;) {
    const hue = Math.round(random() * 360)
    const limits = isMuddy(1, hue) ? FILL_LIMITS.light : FILL_LIMITS.fill
    const saturation = style.saturation[0] + random() * (style.saturation[1] - style.saturation[0])
    const neutral = neutralForHue(hue, random)
    const darkPage = toLinearRgb(parseLightness(NEUTRAL_SCALES[neutral][9]), 0, 0) as [number, number, number]
    const passing = passingFills(hue, saturation, style, 1, limits)
    const dark = passingFills(hue, saturation, style, luminance(darkPage), limits)

    if (!passing.length || !dark.length) continue

    const light = nearPeak(passing, style)
    const withWhiteText = light.filter(fill => fill.l < 0.58)
    const withBlackText = light.filter(fill => fill.l >= 0.58)
    const primary = pick(withBlackText.length && (!withWhiteText.length || random() < style.blackText) ? withBlackText : withWhiteText, random)
    const primaryDark = getDarkFill(primary, dark, style)
    const taken = [hue]
    const status: PresetTokens = {}

    for (const tone of STATUS_TONES) {
      const result = getStatusTokens(tone, primary, taken, saturation, style, luminance(darkPage), random)
      if (!result) continue

      taken.push(result.hue)
      Object.assign(status, result.tokens)
    }

    const size = pick(SIZES, random)
    const radius = pick(RADII, random)

    return {
      neutral,
      'color-primary': toColor(primary, hue),
      ...primaryDark === null ? {} : {'color-primary-dark': toColor(primaryDark, hue)},
      ...status,
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
