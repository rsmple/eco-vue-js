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

export const isNeutralScale = (value: unknown): value is NeutralScale => typeof value === 'string' && Object.hasOwn(NEUTRAL_SCALES, value)

/** How content is contained (plans/surface-containment.md): the `layout` token picks one, and it sets the tokens below. */
export const LAYOUTS = [
  {id: 'flat', name: 'Flat', look: 'Content on the page background, the bars docked to the screen edges'},
  {id: 'card', name: 'Card', look: 'Sections and cards on a darker page, the bars floating as cards'},
  {id: 'glass', name: 'Glass', look: 'Translucent sections, cards and bars over a gradient from the theme\'s colors'},
] as const

export type LayoutId = typeof LAYOUTS[number]['id']

export const isLayoutId = (value: unknown): value is LayoutId => LAYOUTS.some(layout => layout.id === value)

/** Card and glass: the bars float off the screen edges, and sections reach into the page gutter and pad by it. */
const FLOATING: PresetTokens = {
  'w-section-rounded': '1.5rem',
  'w-section-padding': 'var(--inner-margin)',
  'w-section-gap': '0.75rem',
  'w-page-bleed': 'var(--inner-margin)',
  'w-card-rounded': '1rem',
  'w-chrome-float': '1',
  'w-chrome-gap': '0.75rem',
  'w-chrome-rounded': '1rem',
  'w-nav-height': 'auto',
}

/**
 * Card in dark mode: the page is a step darker than the surface. Below about 0.2 a darker page can't show, it is
 * black either way, so there the surface steps up off the theme's background instead, by `CARD_DARK_LIFT` up to
 * `CARD_DARK_FLOOR`, and the page keeps the background: Neon's near-black page with its cards lifted off it.
 */
const CARD_DARK_LIFT = 0.08

const CARD_DARK_FLOOR = 0.2

const CARD_DARK_STEP = 0.035

/** The card layout's dark surface lightness for a dark background of lightness `l`, as `role-surface-dark` computes it. */
export const getCardDarkSurface = (l: number) => Math.max(l, Math.min(l + CARD_DARK_LIFT, CARD_DARK_FLOOR))

const CARD_DARK_SURFACE_L = `max(l, min(calc(l + ${ CARD_DARK_LIFT }), ${ CARD_DARK_FLOOR }))`

/**
 * The spots of the glass canvas's gradient: where each sits, how much of its color it mixes in at its center and how
 * far it fades out. Their colors are theme tokens, the primary and two data hues unless a theme sets its own.
 */
const CANVAS_SPOTS = [
  {key: 'w-canvas-glow-1', at: '10% 10%', share: 18, size: 45},
  {key: 'w-canvas-glow-2', at: '90% 30%', share: 14, size: 45},
  {key: 'w-canvas-glow-3', at: '40% 90%', share: 14, size: 50},
] as const

export const CANVAS_GLOWS = {
  'w-canvas-glow-1': 'var(--color-primary)',
  'w-canvas-glow-2': 'var(--color-data-fuchsia)',
  'w-canvas-glow-3': 'var(--color-data-teal)',
} as const satisfies PresetTokens

/**
 * Grain over the page background, as glass themes often add so the blur reads: a 160px noise tile layered on top of
 * the canvas's picture, fixed to the viewport with it, in any layout. `alpha` is how much of the noise shows. What
 * repaints the canvas, such as a sticky column, can't blur it as a glass section does, so strong grain shows there.
 */
export const NOISE_LEVELS = [
  {id: 'none', name: 'None', alpha: 0},
  {id: 'subtle', name: 'Subtle', alpha: 0.22},
  {id: 'strong', name: 'Strong', alpha: 0.4},
] as const

export type NoiseId = typeof NOISE_LEVELS[number]['id']

export const isNoiseId = (value: unknown): value is NoiseId => NOISE_LEVELS.some(level => level.id === value)

const getNoiseImage = (id: string | undefined) => {
  const alpha = NOISE_LEVELS.find(level => level.id === id)?.alpha

  if (!alpha) return undefined

  return `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='3' stitchTiles='stitch'/%3E%3CfeColorMatrix values='0 0 0 0 0.5 0 0 0 0 0.5 0 0 0 0 0.5 0 0 0 ${ alpha } 0'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`
}

/** The tokens each layout sets; the theme's own override them. Flat is the kit's defaults. */
export const LAYOUT_TOKENS: Record<LayoutId, PresetTokens> = {
  flat: {},
  card: {
    'role-canvas': 'oklch(from var(--role-surface) calc(l - 0.015) c h)',
    'role-surface-dark': `oklch(from var(--color-default-dark) ${ CARD_DARK_SURFACE_L } c h)`,
    'role-surface-raised-dark': 'oklch(from var(--role-surface-dark) calc(l + 0.04) c h)',
    'role-canvas-dark': `oklch(from var(--color-default-dark) min(l, calc(${ CARD_DARK_SURFACE_L } - ${ CARD_DARK_STEP })) c h)`,
    'role-card': 'var(--role-surface)',
    'role-card-dark': 'var(--role-surface-dark)',
    ...FLOATING,
    'w-section-opacity': '1',
    'w-section-shadow': '0 1px 2px oklch(from var(--w-shadow) l c h / calc(alpha * 0.5))',
    'w-card-shadow': 'var(--w-section-shadow)',
    'w-chrome-shadow': 'var(--w-section-shadow)',
    'w-chrome-bar-shadow': 'var(--w-chrome-shadow)',
  },
  glass: {
    'role-canvas': 'oklch(from var(--color-primary) 0.96 0.04 h)',
    'role-canvas-dark': 'oklch(from var(--color-primary) 0.2 0.04 h)',
    'role-card': 'var(--role-surface)',
    'role-card-dark': 'var(--role-surface-dark)',
    // A tinted surface takes the light gray of subtle lines down: a quarter of the way to `line`.
    'role-line-subtle': 'color-mix(in oklab, var(--color-gray-200), var(--color-gray-300) 25%)',
    // In dark an opaque gray-700 outlines the translucent surface brighter than it: a faint white lets the glass show.
    'role-line-subtle-dark': 'oklch(100% 0 0 / 0.12)',
    ...FLOATING,
    ...CANVAS_GLOWS,
    'w-canvas-image': CANVAS_SPOTS.map(spot => `radial-gradient(circle at ${ spot.at }, color-mix(in oklab, var(--${ spot.key }) ${ spot.share }%, transparent), transparent ${ spot.size }%)`).join(', '),
    // Translucent enough for the gradient to tint through, with a light top edge catching the light as glass does.
    'w-section-opacity': '0.4',
    'w-section-border': '1px',
    'w-section-shadow': '0 8px 32px -8px var(--w-shadow), inset 0 1px 0 0 light-dark(oklch(100% 0 0 / 0.7), oklch(100% 0 0 / 0.08))',
    // No saturate(): what repaints the canvas inside a page list (sticky columns, masks) can't reproduce it.
    'w-section-backdrop': 'blur(24px)',
    'w-card-opacity': '0.4',
    'w-card-border': '1px',
    'w-card-shadow': 'var(--w-section-shadow)',
    'w-card-backdrop': 'var(--w-section-backdrop)',
    'w-chrome-border': '1px',
    'w-chrome-shadow': 'var(--w-section-shadow)',
    'w-chrome-bar-shadow': 'var(--w-chrome-shadow)',
    'w-chrome-opacity': '0.5',
    'w-chrome-backdrop': 'var(--w-section-backdrop)',
  },
}

/**
 * What the page background is under a layout, as colors over `canvas`: for glass the plain canvas and the centers of
 * its gradient's spots, where it is darkest or most colored. Text on the canvas and on glass is checked over each.
 */
export const getCanvasSamples = (layout: string | undefined, canvas: string) => layout === 'glass'
  ? [canvas, ...CANVAS_SPOTS.map(spot => `color-mix(in srgb, var(--${ spot.key }) ${ spot.share }%, ${ canvas })`)]
  : [canvas]

/**
 * Keys are CSS variable names without `--`: `color-*` and `role-*` go in the app's `@theme`, `w-*` on `body`.
 * `neutral` names a scale from `NEUTRAL_SCALES` and becomes the `gray-*` colors, `layout` one of `LAYOUTS` and the
 * tokens it sets, `noise` one of `NOISE_LEVELS` and the grain it layers over `w-canvas-image`.
 */
export type PresetTokens = Record<string, string>

export const PRESETS = [
  {id: 'default', name: 'Default', look: 'The kit\'s violet on zinc, as this site ships', tokens: {}},
  {
    id: 'ocean',
    name: 'Ocean',
    look: 'Blue primary, cyan info, slate neutrals, card layout',
    tokens: {
      layout: 'card',
      neutral: 'slate',
      'color-primary': 'oklch(54% 0.15 250)',
      'color-info': 'oklch(61% 0.11 215)',
    },
  },
  {
    id: 'forest',
    name: 'Forest',
    look: 'Green primary, lime positive, stone neutrals, pill-shaped fields and buttons',
    tokens: {
      neutral: 'stone',
      'color-primary': 'oklch(52% 0.11 165)',
      'color-positive': 'oklch(61% 0.15 135)',
      'w-input-rounded': '1.125rem',
      'w-button-rounded': '1.125rem',
    },
  },
  {
    id: 'sunset',
    name: 'Sunset',
    look: 'Orange primary, rose negative, stone neutrals, glass layout',
    tokens: {
      layout: 'glass',
      neutral: 'stone',
      'color-primary': 'oklch(57% 0.17 45)',
      'color-negative': 'oklch(64% 0.21 10)',
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
 * `layout` expanded to the tokens it sets, under the theme's own, and `neutral` to the `gray-*` colors it stands for,
 * with the dark background as the scale's 900 unless the theme sets its own; other tokens as they are. The kit keeps
 * `default-dark` fixed, since apps that set their own `gray-900` use the two as different surfaces.
 */
export const expandTokens = (tokens: PresetTokens): [key: string, value: string][] => {
  const {layout, noise, ...rest} = tokens
  const expanded: PresetTokens = {...isLayoutId(layout) ? LAYOUT_TOKENS[layout] : {}, ...rest}
  const noiseImage = getNoiseImage(noise)

  if (noiseImage) expanded['w-canvas-image'] = expanded['w-canvas-image'] ? `${ noiseImage }, ${ expanded['w-canvas-image'] }` : noiseImage

  return Object.entries(expanded).flatMap(([key, value]): [string, string][] => {
    if (key !== 'neutral') return [[key, value]]
    if (!isNeutralScale(value)) return []

    const scale = NEUTRAL_SCALES[value].map((color, index): [string, string] => [`color-gray-${ NEUTRAL_STEPS[index] }`, `oklch(${ color })`])

    return 'color-default-dark' in expanded ? scale : [...scale, ['color-default-dark', 'var(--color-gray-900)']]
  })
}

/**
 * The rules a floating layout adds besides tokens: on phones the bars dock and sections span the screen, and the page
 * doesn't bounce sideways, which would move it but not the fixed backgrounds that repaint a page list's section.
 */
export const getLayoutRules = (tokens: PresetTokens, root = ':root', body = 'body') => {
  if (tokens.layout !== 'card' && tokens.layout !== 'glass') return ''

  return [
    `@media (max-width: 639px) {`,
    `  ${ body } {`,
    '    --w-chrome-gap: 0px;',
    '    --w-chrome-rounded: 0px;',
    '  }',
    '}',
    '',
    `${ root } {`,
    '  overscroll-behavior-x: none;',
    '}',
  ].join('\n')
}

/** The class on `<html>` that turns a layout's tokens on, from the kit's `layouts.css`. */
export const getLayoutClass = (layout: LayoutId) => `w-layout-${ layout }`

/**
 * The kit's `tailwind-base/css/layouts.css`, generated from `LAYOUT_TOKENS` by `npm run docs:generate`: each floating
 * layout as a class for `<html>`. Roles go on the root and `w-*` tokens on `body`, as an app sets them, and both at
 * the lowest specificity, so an app's own `:root` and `body` rules win; the roles also win over its `@theme`, which is
 * in an earlier layer, so a theme that retunes a role the layout sets does it on `:root`.
 */
export const getLayoutsCss = () => {
  const floating = LAYOUTS.filter(layout => Object.keys(LAYOUT_TOKENS[layout.id]).length)
  const block = (selector: string, entries: [string, string][], extra: string[] = []) => [
    `  ${ selector } {`,
    ...entries.map(([key, value]) => `    --${ key }: ${ value };`),
    ...extra.map(line => `    ${ line }`),
    '  }',
  ]

  return [
    '/*',
    ' * Generated by `npm run docs:generate` from `LAYOUT_TOKENS` in docs/.vitepress/themePresets.ts: do not edit.',
    ' *',
    ` * The floating layouts (plans/surface-containment.md): ${ floating.map(layout => `\`class="${ getLayoutClass(layout.id) }"\``).join(' or ') } on`,
    ' * `<html>`. Flat is the kit\'s defaults. An app\'s own tokens override the layout\'s: `w-*` on `body`, and a role the',
    ' * layout sets on `:root` (not in `@theme`, which is in an earlier layer).',
    ' */',
    '@layer base {',
    ...floating.flatMap(layout => {
      const entries = Object.entries(LAYOUT_TOKENS[layout.id])
      const selector = `:where(.${ getLayoutClass(layout.id) })`

      return [
        `  /* ${ layout.name }: ${ layout.look }. */`,
        // The page doesn't bounce sideways: that would move it but not the fixed backgrounds that repaint a page list's section.
        ...block(selector, entries.filter(([key]) => !key.startsWith('w-')), ['overscroll-behavior-x: none;']),
        '',
        ...block(`${ selector } body`, entries.filter(([key]) => key.startsWith('w-'))),
        '',
      ]
    }),
    '  /* On phones the bars dock and sections span the screen. */',
    '  @media (width < 40rem) {',
    ...block(`:where(${ floating.map(layout => `.${ getLayoutClass(layout.id) }`).join(', ') }) body`, [['w-chrome-gap', '0px'], ['w-chrome-rounded', '0px']]).map(line => `  ${ line }`),
    '  }',
    '}',
    '',
  ].join('\n')
}

/** The `@theme` block for the color tokens of a theme, or an empty string when there are none. */
export const getThemeBlock = (tokens: PresetTokens) => {
  const entries = expandTokens(tokens).filter(([key]) => !key.startsWith('w-'))

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

/** Linear sRGB of an OKLCH color, or null outside the sRGB gamut; with `clip`, clipped into it as the browser does. */
function toLinearRgb(l: number, c: number, h: number): [number, number, number] | null
function toLinearRgb(l: number, c: number, h: number, clip: true): [number, number, number]
function toLinearRgb(l: number, c: number, h: number, clip = false): [number, number, number] | null {
  const a = c * Math.cos(h * Math.PI / 180)
  const b = c * Math.sin(h * Math.PI / 180)
  const [lms1, lms2, lms3] = [l + 0.3963377774 * a + 0.2158037573 * b, l - 0.1055613458 * a - 0.0638541728 * b, l - 0.0894841775 * a - 1.2914855480 * b].map(value => value ** 3)
  const rgb: [number, number, number] = [
    4.0767416621 * lms1 - 3.3077115913 * lms2 + 0.2309699292 * lms3,
    -1.2684380046 * lms1 + 2.6097574011 * lms2 - 0.3413193965 * lms3,
    -0.0041960863 * lms1 - 0.7034186147 * lms2 + 1.7076147010 * lms3,
  ]

  if (clip) return rgb.map(value => Math.min(Math.max(value, 0), 1)) as [number, number, number]

  return rgb.every(value => value >= -0.0001 && value <= 1.0001) ? rgb : null
}

const luminance = ([r, g, b]: [number, number, number]) => 0.2126 * r + 0.7152 * g + 0.0722 * b

const contrast = (first: number, second: number) => (Math.max(first, second) + 0.05) / (Math.min(first, second) + 0.05)

/**
 * Luminance as APCA takes it: from the sRGB channels with a plain 2.4 gamma, rather than WCAG's linearization. The
 * channels are clamped first: a fill at the edge of sRGB, as Neon's are, can be a hair below 0, and a negative to the
 * power of 2.4 is NaN.
 */
const apcaLuminance = (rgb: [number, number, number]) => {
  const [r, g, b] = rgb.map(value => Math.min(Math.max(value, 0), 1)).map(value => (value <= 0.0031308 ? value * 12.92 : 1.055 * value ** (1 / 2.4) - 0.055) ** 2.4)

  return 0.2126729 * r + 0.7151522 * g + 0.0721750 * b
}

/** APCA lightness contrast (Lc) of text on a background, as a positive number either way round. */
const apca = (text: number, background: number) => {
  const [t, bg] = [text, background].map(value => value > 0.022 ? value : value + (0.022 - value) ** 1.414)
  const lc = bg > t ? (bg ** 0.56 - t ** 0.57) * 1.14 : (t ** 0.62 - bg ** 0.65) * 1.14

  return lc < 0.001 ? 0 : (lc - 0.027) * 100
}

/**
 * `text-tone-on` takes white on a fill whose luminance is under that of a gray of this lightness, where APCA rates
 * black and white the same, and black above it.
 */
const ON_FILL_LIGHTNESS = 0.71

/**
 * The APCA contrast `text-tone-on` needs on a fill: readable at a badge's or a button's size and weight. A little
 * over the 60 the contrast test asks, as the other minimums are, for the rounding of the color the theme writes.
 */
const MIN_ON_FILL = 60.5

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
 * dark fills), how often it is a bright fill with black text rather than a deep one with white, and how light a fill
 * with black text goes (`lightest`): Soft keeps to pastels, Neon goes up to the glaring greens and cyans near white.
 * Neon also takes the most saturated fill that passes on the dark page for `color-primary-dark`.
 *

 * `dark` is the lightness of the dark mode background and the surfaces on it (`surface-subtle`, `surface-muted` and
 * `surface-inset`): Soft lifts them off black, Neon takes them to almost black so its colors glow,
 * and Vivid keeps the neutral scale's 900, 850, 800 and 700.
 *
 * `glow` is how much of the primary the `shadow` role takes, light and dark, in place of a black shadow: Neon's
 * dropdowns, modals and tooltips glow in its color. In dark mode the share is scaled by the primary's lightness, so
 * every hue glows about as bright.
 */
export const RANDOM_STYLES = [
  {id: 'soft', name: 'Soft', saturation: [0.5, 0.7], minChroma: 0.06, maxChroma: 0.19, peak: 0.85, blackText: 0.35, lightest: 0.82, dark: [0.245, 0.275, 0.31, 0.39], glow: null},
  {id: 'vivid', name: 'Vivid', saturation: [0.75, 0.85], minChroma: 0.1, maxChroma: 0.3, peak: 0.92, blackText: 0.55, lightest: 0.87, dark: null, glow: null},
  {id: 'neon', name: 'Neon', saturation: [1, 1], minChroma: 0.14, maxChroma: 0.4, peak: 0.97, blackText: 0.85, lightest: 0.93, dark: [0.09, 0.14, 0.18, 0.22], glow: [0.15, 0.20]},
] as const

export type RandomStyle = typeof RANDOM_STYLES[number]

export type RandomStyleId = RandomStyle['id']

export const isRandomStyleId = (value: unknown): value is RandomStyleId => RANDOM_STYLES.some(style => style.id === value)

/** A range of hues from `from` to `to`, clockwise: `to` runs past 360 when the range wraps through red. */
export type HueRange = {from: number, to: number}

/**
 * Every hue range a slider offers: from red around the circle and on through red again to blue, so any range up to
 * 240° wide runs unbroken, those through red included, in the second lap. A range of 360° or more is every hue.
 */
export const FULL_HUE_RANGE: HueRange = {from: 20, to: 620}

export const isFullHueRange = (range: HueRange) => range.to - range.from >= 360

export const isHueRange = (value: unknown): value is HueRange => value instanceof Object
  && typeof (value as HueRange).from === 'number' && typeof (value as HueRange).to === 'number'
  && (value as HueRange).from >= FULL_HUE_RANGE.from && (value as HueRange).from <= (value as HueRange).to && (value as HueRange).to <= FULL_HUE_RANGE.to

const cusps = new Map<number, {l: number, c: number}>()

/** The lightness where `hue` holds the most chroma in sRGB, and that chroma: yellow's is near white, blue's deep. */
const getCusp = (hue: number) => {
  const key = Math.round(hue) % 360
  let cusp = cusps.get(key)

  if (!cusp) {
    cusp = {l: 0, c: 0}

    for (let l = 0.3; l <= 0.99; l += 0.005) {
      const c = maxChroma(l, key)
      if (c > cusp.c) cusp = {l, c}
    }

    cusps.set(key, cusp)
  }

  return cusp
}

/** A color of `hue` at its most saturated, in the style's usual share of that chroma, so the track reads as its hues do. */
export const getHueSwatch = (styleId: RandomStyleId, hue: number, alpha = 1) => {
  const style = RANDOM_STYLES.find(item => item.id === styleId) ?? RANDOM_STYLES[1]
  const saturation = (style.saturation[0] + style.saturation[1]) / 2
  const {l, c} = getCusp(hue)

  return `oklch(${ (l * 100).toFixed(1) }% ${ (c * saturation).toFixed(3) } ${ Math.round(hue) % 360 }${ alpha < 1 ? ` / ${ alpha }` : '' })`
}

/** A left to right gradient through the hues of `range` in `getHueSwatch` colors, a stop every 15°. */
export const getHueGradient = (styleId: RandomStyleId, range: HueRange, alpha = 1) => {
  const steps = Math.max(1, Math.ceil((range.to - range.from) / 15))
  const stops = Array.from({length: steps + 1}, (_, index) => getHueSwatch(styleId, range.from + (range.to - range.from) * index / steps, alpha))

  return `linear-gradient(to right, ${ stops.join(', ') })`
}

/**
 * Fills that are brown or olive at any chroma: ambers, yellows and yellow-greens dark enough for 3:1 on a white page,
 * and dark oranges. Yellows and limes are muddy at any lightness that passes 3:1 there, so they come up only as light
 * fills with black text, the way warning does.
 */
const isMuddy = (l: number, hue: number) => (hue >= 55 && hue < 128) || (hue >= 35 && hue < 55 && l < 0.55)

/** A fill's lightness and chroma, whether `text-tone-on` puts white text on it, and that text's APCA contrast. */
type Fill = {l: number, c: number, white: boolean, onFill: number}

/**
 * The status tones: the hues each one keeps to, the wider range it shifts into when the primary takes those (a red
 * primary turns negative to pink-red or orange-red, a yellow one turns warning to orange), and the fill it takes:
 * `light` with black text always, as warning; `deep` never light, as negative; or light only with a light `primary`.
 * Ranges run clockwise from the first hue to the second, past 360 when it's lower.
 * `distance` is how far it keeps from the primary's and the other tones' hues, so no two read as one color: negative
 * keeps nearer, since around red a few degrees already turn pink to red to orange.
 */
const STATUS_TONES = [
  {key: 'negative', hues: [15, 35], shifted: [0, 50], distance: 20, fill: 'deep'},
  {key: 'positive', hues: [140, 175], shifted: [128, 200], distance: 30, fill: 'primary'},
  {key: 'warning', hues: [65, 95], shifted: [50, 105], distance: 30, fill: 'light'},
  {key: 'info', hues: [205, 265], shifted: [190, 280], distance: 30, fill: 'primary'},
] as const

/**
 * The most APCA contrast white text keeps on a status fill: a status tone with white text is no deeper than this, even
 * beside a deep primary, so badges and alerts don't outweigh the content around them. The kit's defaults are at 64 to 69.
 */
const MAX_STATUS_ON_FILL = 70

/** What a status hue settles for when nothing in its wider range is its `distance` away, as warning beside a yellow primary. */
const STATUS_HUE_FALLBACK_DISTANCE = 20

/** How many of its own hues a tone needs away from the taken ones before it stops reaching into its wider range. */
const STATUS_HUE_MIN_SPAN = 12

const hueDistance = (first: number, second: number) => Math.min(Math.abs(first - second), 360 - Math.abs(first - second))

const hueRange = ([from, to]: readonly [number, number]) => Array.from({length: (to - from + 360) % 360 + 1}, (_, index) => (from + index) % 360)

/**
 * The hues a status tone tries, in order: its own hues away from the `taken` ones (the primary's and the tones' before
 * it), from a random one, joined by those of its wider range on their side when fewer than `STATUS_HUE_MIN_SPAN` of its
 * own are, so a pink primary's negative still ranges from red to orange; then the hues of its wider range away from them, nearest
 * its own first, at its `distance` and the fallback in turn; then its own hues farthest from the nearest taken one first.
 */
const statusHues = (tone: typeof STATUS_TONES[number], taken: number[], random: () => number) => {
  const own = hueRange(tone.hues)
  const distanceFromTaken = (hue: number) => Math.min(...taken.map(item => hueDistance(hue, item)))
  const ownApart = own.filter(hue => distanceFromTaken(hue) >= tone.distance)
  const nearestOwnApart = (hue: number) => Math.min(...ownApart.map(item => hueDistance(hue, item)))
  const apart = ownApart.length >= STATUS_HUE_MIN_SPAN ? ownApart : hueRange(tone.shifted)
    .filter(hue => distanceFromTaken(hue) >= tone.distance && (!ownApart.length || nearestOwnApart(hue) < distanceFromTaken(hue)))
  const start = Math.floor(random() * apart.length)
  const distanceFromOwn = (hue: number) => Math.min(...own.map(item => hueDistance(hue, item)))
  const shifted = [tone.distance, STATUS_HUE_FALLBACK_DISTANCE].flatMap(distance => hueRange(tone.shifted)
    .filter(hue => distanceFromTaken(hue) >= distance)
    .sort((first, second) => distanceFromOwn(first) - distanceFromOwn(second)))

  return [...apart.slice(start), ...apart.slice(0, start), ...shifted, ...own.sort((first, second) => distanceFromTaken(second) - distanceFromTaken(first))]
}

/**
 * The fills `passingFills` looks through: the lightness they start from, up to the style's `lightest`, and whether
 * muddy ones are left out. A `light` fill, warning's and a yellow or lime primary's, always takes black text, and its
 * yellows are muddy only below its lightness.
 */
const FILL_LIMITS = {
  fill: {from: 0.4, muddy: true},
  light: {from: 0.72, muddy: false},
} as const

/**
 * The contrast a fill needs against the page: 3:1 under white text, and only 1.5:1 under black, as the kit checks,
 * since the text on it and `text-tone` carry the contrast there. That lets bright fills glare on a white page.
 */
const MIN_PAGE = {white: 3.02, black: 1.52}

/**
 * Fills of this hue, at `saturation` of the most chroma each lightness allows within the style's limits, that pass
 * the kit's contrast checks on a page of `pageLuminance`: `MIN_PAGE` against the page, `MIN_ON_FILL` for the black or
 * white text `text-tone-on` puts on it, 4.5:1 for `text-tone`, the fill's chroma at a lightness of at
 * most 0.53 on a light page and at least 0.72 on a dark one, and 3:1 for `border-tone-line`, the same at most 0.62 on a
 * light page; the browser clips both when they leave sRGB. Fills under `minChroma`, the style's by default, are left out.
 */
const passingFills = (hue: number, saturation: number, style: RandomStyle, pageLuminance: number, limits: typeof FILL_LIMITS[keyof typeof FILL_LIMITS] = FILL_LIMITS.fill, minChroma: number = style.minChroma) => {
  const result: Fill[] = []
  const {from, muddy} = limits
  const lightPage = pageLuminance > 0.5

  for (let l = from; l <= style.lightest; l += 0.005) {
    const c = Math.min(maxChroma(l, hue) * saturation, style.maxChroma)
    if (c < minChroma || (muddy && isMuddy(l, hue))) continue

    const rgb = toLinearRgb(l, c, hue) as [number, number, number]
    const fill = luminance(rgb)
    const white = fill < ON_FILL_LIGHTNESS ** 3
    const onFill = apca(white ? 1 : 0, apcaLuminance(rgb))

    const toneText = luminance(toLinearRgb(lightPage ? Math.min(l, 0.53) : Math.max(l, 0.72), c, hue, true))
    const toneLine = luminance(toLinearRgb(lightPage ? Math.min(l, 0.62) : Math.max(l, 0.72), c, hue, true))

    if (
      contrast(fill, pageLuminance) >= (white ? MIN_PAGE.white : MIN_PAGE.black)
      && onFill >= MIN_ON_FILL
      && contrast(toneText, pageLuminance) >= 4.52
      && contrast(toneLine, pageLuminance) >= 3.02
    ) result.push({l, c, white, onFill})
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

/**
 * The lightness at which the dark glow takes the style's share. On a near-black page a glow shows about as bright as
 * its share times its lightness, so a lighter primary takes less: a yellow or cyan glows no brighter than a purple.
 */
const GLOW_LIGHTNESS = 0.6

/** The style's glow: the `shadow` role; none for Soft and Vivid, which keep the black shadow. */
const getShadow = (style: RandomStyle): PresetTokens => {
  if (!style.glow) return {}

  const [light, dark] = style.glow

  return {
    'role-shadow': `color-mix(in oklab, var(--color-primary) ${ +(light * 100).toFixed(0) }%, transparent)`,
    'role-shadow-dark': `oklch(from var(--color-primary-dark) l c h / min(${ +(dark * 1.5).toFixed(3) }, calc(${ +(dark * GLOW_LIGHTNESS).toFixed(3) } / l)))`,
    'w-shadow-lift': '0.5rem',
  }
}

/**
 * The style's dark background, in the tint of the neutral scale's 900, and the surfaces on it as steps up from the
 * surface, so they follow it where a layout lifts it off the background; none for Vivid.
 */
const getDarkSurfaces = (neutral: NeutralScale, style: RandomStyle): PresetTokens => {
  if (!style.dark) return {}

  const [, chroma, hue] = NEUTRAL_SCALES[neutral][9].split(' ')
  const [background, ...steps] = style.dark
  const [subtle, muted, inset] = steps.map(l => `oklch(from var(--role-surface-dark) calc(l + ${ +(l - background).toFixed(3) }) c h)`)

  return {
    'color-default-dark': `oklch(${ +(background * 100).toFixed(1) }% ${ chroma } ${ hue })`,
    'role-surface-subtle-dark': subtle,
    'role-surface-muted-dark': muted,
    'role-surface-inset-dark': inset,
  }
}

const toColor = (fill: Fill, hue: number) => `oklch(${ (fill.l * 100).toFixed(1) }% ${ fill.c.toFixed(3) } ${ hue })`

/**
 * A status tone in the theme's style and saturation, with the hue it took: a hue away from the `taken` ones from
 * `statusHues`, and among the fills near its peak chroma, the one nearest the primary's lightness with the same black
 * or white text, so the tones carry the same weight, but none deeper than `MAX_STATUS_ON_FILL`. Warning is always a
 * light fill with black text, the most saturated one that passes, and so is every tone but negative when the primary
 * is a light fill: negative stays deep, since a light red is pink or salmon, and takes its most saturated fill.
 */
const getStatusTokens = (
  tone: typeof STATUS_TONES[number],
  primary: Fill,
  lightPrimary: boolean,
  taken: number[],
  saturation: number,
  style: RandomStyle,
  darkPageLuminance: number,
  random: () => number,
): {hue: number, tokens: PresetTokens} | null => {
  for (const hue of statusHues(tone, taken, random)) {
    const lightFill = tone.fill === 'light' || (tone.fill === 'primary' && lightPrimary)
    const limits = lightFill ? FILL_LIMITS.light : FILL_LIMITS.fill
    const passing = passingFills(hue, saturation, style, 1, limits)
    const dark = passingFills(hue, saturation, style, darkPageLuminance, limits)
    if (!passing.length || !dark.length) continue

    const lightEnough = passing.filter(fill => !fill.white || fill.onFill <= MAX_STATUS_ON_FILL)
    const light = nearPeak(lightEnough.some(fill => fill.white) ? lightEnough : passing, style)
    const sameText = light.filter(fill => fill.white === primary.white)
    const fill = lightFill || lightPrimary
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

/** How far from the primary's hue the other two spots of a random glass canvas turn, one each way round. */
const GLOW_HUE_OFFSET = [50, 150] as const

/** The lightness of a random spot color: a mid-tone, which tints the canvas about as much in light and dark mode. */
const GLOW_LIGHTNESS_L = 0.68

/**
 * The glass canvas's second and third spots for a random theme: hues turned away from the primary's either way, in
 * the style's saturation. The first spot stays the primary.
 */
const getCanvasGlows = (hue: number, saturation: number, style: RandomStyle, random: () => number): PresetTokens => {
  const [min, max] = GLOW_HUE_OFFSET
  const hues = [1, -1].map(direction => Math.round(hue + direction * (min + random() * (max - min)) + 360) % 360)
  const [second, third] = hues.map(item => {
    const c = Math.min(maxChroma(GLOW_LIGHTNESS_L, item) * saturation, style.maxChroma)

    return `oklch(${ (GLOW_LIGHTNESS_L * 100).toFixed(1) }% ${ c.toFixed(3) } ${ item })`
  })

  return {'w-canvas-glow-2': second, 'w-canvas-glow-3': third}
}

/**
 * A theme from one random primary in a style from `RANDOM_STYLES`, the status tones that go with it in the same style,
 * the neutral scale that suits its hue, and a size with a radius, in `layout` when given. The primary's hue is taken from `hues`. The primary's lightness is picked where the fill
 * passes the contrast checks on a white page and stays near the hue's peak chroma; when it fails on the dark page, the
 * nearest fill that passes there becomes `color-primary-dark`. A yellow or lime primary is a light fill with black text,
 * as warning is, and the status tones turn light with it. A hue that holds less chroma on a white page than the style
 * asks takes the most it has there. They follow with
 * `getStatusTokens`, each keeping away from the primary's hues and the ones before it.
 */
export const getRandomTokens = (styleId: RandomStyleId = 'vivid', hues: HueRange = FULL_HUE_RANGE, random: () => number = Math.random, layout?: LayoutId): PresetTokens => {
  const style = RANDOM_STYLES.find(item => item.id === styleId) ?? RANDOM_STYLES[1]

  for (;;) {
    // Capped at a full turn: past it, the hues the range covers twice would come up twice as often.
    const hue = Math.round(hues.from + random() * Math.min(hues.to - hues.from, 360)) % 360
    const limits = isMuddy(1, hue) ? FILL_LIMITS.light : FILL_LIMITS.fill
    const saturation = style.saturation[0] + random() * (style.saturation[1] - style.saturation[0])
    const neutral = neutralForHue(hue, random)
    const darkSurfaces = getDarkSurfaces(neutral, style)
    const darkBackground = style.dark?.[0] ?? parseLightness(NEUTRAL_SCALES[neutral][9])
    // Card lifts the dark surface off the background: the fills sit on the lighter of the two, where they stand out least.
    const darkPage = toLinearRgb(layout === 'card' ? getCardDarkSurface(darkBackground) : darkBackground, 0, 0) as [number, number, number]
    const dark = passingFills(hue, saturation, style, luminance(darkPage), limits)
    const vivid = passingFills(hue, saturation, style, 1, limits)
    // Teals and cyans pass on a white page only where sRGB holds less chroma than Neon asks: the light fill takes what
    // there is, and dark mode, where they pass light and saturated, keeps the style's chroma.
    const passing = vivid.length || !dark.length ? vivid : passingFills(hue, saturation, style, 1, limits, 0)

    if (!passing.length || !dark.length) continue

    const light = nearPeak(passing, style)
    const withWhiteText = light.filter(fill => fill.white)
    const withBlackText = light.filter(fill => !fill.white)
    const primary = pick(withBlackText.length && (!withWhiteText.length || random() < style.blackText) ? withBlackText : withWhiteText, random)
    const primaryDark = getDarkFill(primary, dark, style)
    const taken = [hue]
    const status: PresetTokens = {}

    for (const tone of STATUS_TONES) {
      const result = getStatusTokens(tone, primary, limits === FILL_LIMITS.light, taken, saturation, style, luminance(darkPage), random)
      if (!result) continue

      taken.push(result.hue)
      Object.assign(status, result.tokens)
    }

    const size = pick(SIZES, random)
    const radius = pick(RADII, random)
    // Drawn last, so the rest of the theme stays the same when a random theme is made again for glass.
    const glows = layout === 'glass' ? getCanvasGlows(hue, saturation, style, random) : {}

    return {
      ...layout ? {layout} : {},
      neutral,
      ...darkSurfaces,
      ...getShadow(style),
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
      ...glows,
    }
  }
}
