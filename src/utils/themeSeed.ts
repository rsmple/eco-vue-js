/**
 * Themes named by a seed: the same seed and version give the same theme on every device and every kit release, so an
 * app stores only the seed. `v1` is pinned by `build/theme-seed-test.ts`; when a change to the random generator moves
 * its output, keep `v1` as it was (copy what it used here) and add the new behaviour as `v2`.
 */
import {FULL_HUE_RANGE, LAYOUTS, type LayoutId, type PresetTokens, RANDOM_STYLES, type RandomStyleId, getRandomTokens} from './themePresets'

export const SEEDED_THEME_VERSIONS = ['v1'] as const

export type SeededThemeVersion = typeof SEEDED_THEME_VERSIONS[number]

export const isSeededThemeVersion = (value: unknown): value is SeededThemeVersion => SEEDED_THEME_VERSIONS.includes(value as SeededThemeVersion)

/**
 * `hue` is the primary's, for naming the theme by its color. `name` is two numbers in [0, 1) an app turns into words
 * from its own lists, as `list[Math.floor(value * list.length)]`, so the name stays put while the theme does.
 */
export type SeededTheme = {
  tokens: PresetTokens
  style: RandomStyleId
  layout: LayoutId
  hue: number
  name: [number, number]
}

/** cyrb128: four 32-bit words from a string, to start sfc32 from. */
const hashSeed = (seed: string): [number, number, number, number] => {
  let h1 = 1779033703
  let h2 = 3144134277
  let h3 = 1013904242
  let h4 = 2773480762

  for (let index = 0; index < seed.length; index++) {
    const code = seed.charCodeAt(index)

    h1 = h2 ^ Math.imul(h1 ^ code, 597399067)
    h2 = h3 ^ Math.imul(h2 ^ code, 2869860233)
    h3 = h4 ^ Math.imul(h3 ^ code, 951274213)
    h4 = h1 ^ Math.imul(h4 ^ code, 2716044179)
  }

  h1 = Math.imul(h3 ^ (h1 >>> 18), 597399067)
  h2 = Math.imul(h4 ^ (h2 >>> 22), 2869860233)
  h3 = Math.imul(h1 ^ (h3 >>> 17), 951274213)
  h4 = Math.imul(h2 ^ (h4 >>> 19), 2716044179)
  h1 ^= h2 ^ h3 ^ h4
  h2 ^= h1
  h3 ^= h1
  h4 ^= h1

  return [h1 >>> 0, h2 >>> 0, h3 >>> 0, h4 >>> 0]
}

/** sfc32: a small seeded generator of numbers in [0, 1). */
export const getSeededRandom = (seed: string): () => number => {
  let [a, b, c, d] = hashSeed(seed)

  return () => {
    a |= 0
    b |= 0
    c |= 0
    d |= 0

    const value = (a + b | 0) + d | 0

    d = d + 1 | 0
    a = b ^ b >>> 9
    b = c + (c << 3) | 0
    c = c << 21 | c >>> 11
    c = c + value | 0

    return (value >>> 0) / 4294967296
  }
}

const pickFrom = <T>(list: readonly T[], random: () => number): T => list[Math.floor(random() * list.length)]

const getPrimaryHue = (tokens: PresetTokens): number => Number(/oklch\(\S+ \S+ ([\d.]+)/.exec(tokens['color-primary'] ?? '')?.[1] ?? 0)

const generateV1 = (seed: string): SeededTheme => {
  const random = getSeededRandom(`v1:${ seed }`)
  const style = pickFrom(RANDOM_STYLES, random).id
  const layout = pickFrom(LAYOUTS, random).id
  const tokens = getRandomTokens(style, FULL_HUE_RANGE, random, layout)

  return {tokens, style, layout, hue: getPrimaryHue(tokens), name: [random(), random()]}
}

const GENERATORS: Record<SeededThemeVersion, (seed: string) => SeededTheme> = {
  v1: generateV1,
}

export const generateSeededTheme = (seed: string, version: SeededThemeVersion = 'v1'): SeededTheme => GENERATORS[version](seed)
