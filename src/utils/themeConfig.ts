import {CANVAS_GLOWS, LAYOUTS, type LayoutId, NEUTRAL_SCALES, NOISE_LEVELS, PRESETS, type PresetId, expandTokens, getLayoutRules, isLayoutId, isNeutralScale, isNoiseId} from './themePresets'

/**
 * Themes as data: the tokens a theme sets, how a pasted or linked theme is read and checked, and the CSS that applies
 * one at runtime. A theme is a `ThemeConfig`, the JSON the docs playground shares in links and copies to assistants.
 */

export type PaletteKey =
  | 'color-primary' | 'color-primary-dark' | 'color-primary-light' | 'color-primary-darkest'
  | 'color-default' | 'color-default-dark' | 'color-black-default'
  | 'color-negative' | 'color-negative-dark' | 'color-positive' | 'color-positive-dark'
  | 'color-warning' | 'color-warning-dark' | 'color-info' | 'color-info-dark'
  | `color-data-${ DataHue }`

export const DATA_HUES = ['red', 'orange', 'amber', 'green', 'teal', 'cyan', 'blue', 'violet', 'fuchsia', 'pink', 'gray'] as const

type DataHue = typeof DATA_HUES[number]

/** Color roles a theme can set per mode (`css/roles.css`), with what they paint. */
export const ROLES = {
  'text-accent': 'Main text',
  'text-description': 'Muted text: descriptions, captions, secondary values',
  'text-subtle': 'Placeholders, disabled text, chart axes',
  surface: 'Page and cards',
  'surface-subtle': 'Panels and cards set off from the page, such as the docs sidebar',
  'surface-muted': 'Secondary fills, striped rows, tooltips',
  'surface-inset': 'Fills inside controls, chips',
  'surface-raised': 'Dropdowns and popovers: lighter than the page in dark mode, where a shadow hardly shows',
  overlay: 'Translucent bars over scrolling content, such as the header',
  backdrop: 'Behind modals, bottom sheets and the mobile nav',
  track: 'Inactive parts of controls: slider and progress tracks',
  'track-strong': 'The stronger track: neutral progress bars, slider and tab indicator parts',
  line: 'Field borders and dividers',
  'line-subtle': 'Card and section borders',
  'line-raised': 'Edge of dropdowns, popovers and tooltips',
  shadow: 'Color of the shadow under dropdowns, modals and tooltips: black, or a glow',
  focus: 'Focused field border and ring',
} as const

type RoleName = keyof typeof ROLES

export type ShapeKey = 'w-input-height' | 'w-input-rounded' | 'w-input-gap' | 'w-button-height' | 'w-button-rounded' | 'w-list-header-height' | 'w-list-header-rounded' | 'w-checkbox-size' | 'w-shadow-lift'

type LayoutKey = 'w-inner-margin' | 'w-inner-margin-sm' | 'w-section-rounded' | 'w-section-gap' | 'w-card-padding' | 'w-card-rounded' | 'w-chrome-gap' | 'w-chrome-rounded'

type CanvasKey = 'role-canvas' | 'role-canvas-dark' | keyof typeof CANVAS_GLOWS | 'noise'

export type TokenKey = PaletteKey | 'neutral' | `role-${ RoleName }` | `role-${ RoleName }-dark` | ShapeKey | 'layout' | LayoutKey | CanvasKey | 'font-sans'

/**
 * The px a size slider runs through: from `min` to `max`, or for a radius to half of the `pillOf` height, where it
 * turns into a pill.
 */
export type SizeRange = {min: number, max: number} | {min: number, pillOf: ShapeKey}

/** `layouts`: the layout styles a token has an effect in; the playground shows it only in those. */
export type Token = {key: TokenKey, group: string, label: string, description?: string, kind: 'color' | 'neutral' | 'layout' | 'noise' | 'size' | 'font', range?: SizeRange, layouts?: LayoutId[]}

const HEIGHT_RANGE: SizeRange = {min: 24, max: 56}

const SAME_IN_DARK = 'Empty: same as in light mode'

/**
 * What the playground edits. `color-*` and `role-*` are Tailwind theme tokens, `neutral` picks the `gray-*` scale and
 * `w-*` are set on `body`. Data colors and roles sit in advanced groups: most themes leave them.
 */
export const TOKENS: Token[] = [
  {key: 'color-primary', group: 'Brand', label: 'Primary', description: 'Fills, links, focus and selection', kind: 'color'},
  {key: 'color-primary-dark', group: 'Brand', label: 'Primary, dark mode', description: SAME_IN_DARK, kind: 'color'},
  {key: 'color-primary-light', group: 'Brand', label: 'Primary tint', description: 'List headers and the backdrop in light mode; mixed from primary', kind: 'color'},
  {key: 'color-primary-darkest', group: 'Brand', label: 'Primary tint, dark mode', description: 'The same in dark mode', kind: 'color'},
  {key: 'neutral', group: 'Surface', label: 'Neutral scale', description: 'The grays of lines, fills and muted text', kind: 'neutral'},
  {key: 'color-default', group: 'Surface', label: 'Background', description: 'Page and card background in light mode', kind: 'color'},
  {key: 'color-default-dark', group: 'Surface', label: 'Background, dark mode', description: 'Empty: the neutral scale\'s 900', kind: 'color'},
  {key: 'color-black-default', group: 'Surface', label: 'Text', description: 'Main text in light mode', kind: 'color'},
  {key: 'color-negative', group: 'Status', label: 'Negative', description: 'Errors and destructive actions', kind: 'color'},
  {key: 'color-negative-dark', group: 'Status', label: 'Negative, dark mode', description: SAME_IN_DARK, kind: 'color'},
  {key: 'color-positive', group: 'Status', label: 'Positive', description: 'Success', kind: 'color'},
  {key: 'color-positive-dark', group: 'Status', label: 'Positive, dark mode', description: SAME_IN_DARK, kind: 'color'},
  {key: 'color-warning', group: 'Status', label: 'Warning', kind: 'color'},
  {key: 'color-warning-dark', group: 'Status', label: 'Warning, dark mode', description: SAME_IN_DARK, kind: 'color'},
  {key: 'color-info', group: 'Status', label: 'Info', kind: 'color'},
  {key: 'color-info-dark', group: 'Status', label: 'Info, dark mode', description: SAME_IN_DARK, kind: 'color'},
  ...DATA_HUES.map((hue): Token => ({key: `color-data-${ hue }`, group: 'Data', label: hue, kind: 'color'})),
  ...(Object.entries(ROLES) as [RoleName, string][]).flatMap(([name, description]): Token[] => [
    {key: `role-${ name }`, group: 'Roles', label: name, description, kind: 'color'},
    {key: `role-${ name }-dark`, group: 'Roles', label: `${ name }, dark mode`, kind: 'color'},
  ]),
  {key: 'w-input-height', group: 'Shape', label: 'Input height', description: 'Inputs and selects; options inside them follow', kind: 'size', range: HEIGHT_RANGE},
  {key: 'w-input-rounded', group: 'Shape', label: 'Input radius', description: 'Also the side padding of options; half the height at most', kind: 'size', range: {min: 0, pillOf: 'w-input-height'}},
  {key: 'w-input-gap', group: 'Shape', label: 'Input gap', description: 'Between the field border and the options in it', kind: 'size', range: {min: 0, max: 8}},
  {key: 'w-button-height', group: 'Shape', label: 'Button height', kind: 'size', range: HEIGHT_RANGE},
  {key: 'w-button-rounded', group: 'Shape', label: 'Button radius', description: 'Also the side padding; half the height at most', kind: 'size', range: {min: 0, pillOf: 'w-button-height'}},
  {key: 'w-list-header-height', group: 'Shape', label: 'List header height', kind: 'size', range: HEIGHT_RANGE},
  {key: 'w-list-header-rounded', group: 'Shape', label: 'List header radius', kind: 'size', range: {min: 0, pillOf: 'w-list-header-height'}},
  {key: 'w-checkbox-size', group: 'Shape', label: 'Checkbox size', kind: 'size', range: {min: 10, max: 24}},
  {key: 'w-shadow-lift', group: 'Shape', label: 'Shadow lift', description: 'How far shadows fall under dropdowns, modals and tooltips; 0 centers them into a glow', kind: 'size', range: {min: 0, max: 16}},
  {key: 'layout', group: 'Layout', label: 'Layout style', description: 'How sections, cards and the bars look; the sizes below start from it', kind: 'layout'},
  {key: 'w-inner-margin', group: 'Layout', label: 'Page margin, phones', description: 'Where page content starts off the screen edges and the bars; card and glass sections pad by it', kind: 'size', range: {min: 8, max: 32}},
  {key: 'w-inner-margin-sm', group: 'Layout', label: 'Page margin', description: 'The same from 640px up', kind: 'size', range: {min: 8, max: 48}},
  {key: 'w-section-rounded', group: 'Layout', label: 'Section radius', description: 'Sections, such as a list or a form, on the page', kind: 'size', range: {min: 0, max: 32}},
  {key: 'w-section-gap', group: 'Layout', label: 'Section gap', description: 'Between sections one after another, such as on these docs pages; 0 runs them together', kind: 'size', range: {min: 0, max: 32}},
  {key: 'w-card-padding', group: 'Layout', label: 'Card padding', description: 'Inside tiles and stat cards', kind: 'size', range: {min: 0, max: 40}},
  {key: 'w-card-rounded', group: 'Layout', label: 'Card radius', description: 'Tiles and stat cards', kind: 'size', range: {min: 0, max: 32}},
  {key: 'w-chrome-gap', group: 'Layout', label: 'Bar gap', description: 'Between the floating bars, the screen edges and the page; 0 on phones', kind: 'size', range: {min: 0, max: 24}},
  {key: 'w-chrome-rounded', group: 'Layout', label: 'Bar radius', description: 'The floating header, nav and actions bar', kind: 'size', range: {min: 0, max: 32}},
  {key: 'role-canvas', group: 'Page background', label: 'Page background', description: 'Under sections and cards in card and glass; the surface in flat', kind: 'color'},
  {key: 'role-canvas-dark', group: 'Page background', label: 'Page background, dark mode', kind: 'color'},
  {key: 'w-canvas-glow-1', group: 'Page background', label: 'Gradient, top left', description: 'Tints the glass canvas from its corner', kind: 'color', layouts: ['glass']},
  {key: 'w-canvas-glow-2', group: 'Page background', label: 'Gradient, right', kind: 'color', layouts: ['glass']},
  {key: 'w-canvas-glow-3', group: 'Page background', label: 'Gradient, bottom', kind: 'color', layouts: ['glass']},
  {key: 'noise', group: 'Page background', label: 'Grain', description: 'Noise over the page background, so a glass blur reads', kind: 'noise'},
  {key: 'font-sans', group: 'Font', label: 'Font family', description: 'Families the app doesn\'t load must be installed on the viewer\'s machine', kind: 'font'},
]

export type ThemeTokens = Partial<Record<TokenKey, string>>

/** A theme as it is stored and shared in links: an optional preset, and tokens that override it. */
export type ThemeConfig = ThemeTokens & {preset?: PresetId}

export const THEME_QUERY_PARAM = 'theme'

const TOKEN_KINDS = new Map<string, Token['kind']>(TOKENS.map(token => [token.key, token.kind]))

const VALUE_MAX_LENGTH = 120

const MATH_FUNCTIONS = ['calc', 'min', 'max', 'clamp', 'var']

/**
 * What a value of each kind may hold. A value ends up in a style rule and in inline styles, so it is allowed in rather
 * than filtered out: no quotes outside font names, so no strings for `image-set()` and the like to load, only the listed
 * functions, and no comments, which could swallow the end of the rule.
 */
const VALUE_RULES: Record<Exclude<Token['kind'], 'neutral' | 'layout' | 'noise'>, {pattern: RegExp, functions: string[], property: string, error: string}> = {
  color: {
    pattern: /^[\w #%.,+*/()-]+$/,
    functions: ['rgb', 'rgba', 'hsl', 'hsla', 'hwb', 'lab', 'lch', 'oklab', 'oklch', 'color', 'color-mix', 'light-dark', ...MATH_FUNCTIONS],
    property: 'color',
    error: 'Not a color: use hex, a name, a function such as oklch(55% 0.17 286.8), or var(--color-…)',
  },
  size: {
    pattern: /^[\w .%+*/()-]+$/,
    functions: MATH_FUNCTIONS,
    property: 'width',
    error: 'Not a length, such as 2.25rem',
  },
  font: {
    pattern: /^ *(?:"[\w ,-]*"|'[\w ,-]*'|[\w-]+(?: +[\w-]+)*) *(?:, *(?:"[\w ,-]*"|'[\w ,-]*'|[\w-]+(?: +[\w-]+)*) *)*$/,
    functions: [],
    property: 'font-family',
    error: 'Not a list of font families, such as Inter, sans-serif',
  },
}

/** Palette and role variables always hold a color, so a sample color in their place lets the browser check the rest. */
const PALETTE_VAR = /var\(\s*--(?:color|role)-[\w-]+\s*\)/g

const SAMPLE_COLOR = 'red'

/** Why `value` can't be set to `key`, or undefined when it can. Checked by the browser too where `CSS` is available. */
export const getTokenError = (key: TokenKey, value: string): string | undefined => {
  const kind = TOKEN_KINDS.get(key)

  if (kind === 'neutral') return isNeutralScale(value) ? undefined : `Not a neutral scale: one of ${ Object.keys(NEUTRAL_SCALES).join(', ') }`
  if (kind === 'layout') return isLayoutId(value) ? undefined : `Not a layout style: one of ${ LAYOUTS.map(layout => layout.id).join(', ') }`
  if (kind === 'noise') return isNoiseId(value) ? undefined : `Not a grain: one of ${ NOISE_LEVELS.map(level => level.id).join(', ') }`
  if (!kind) return 'Unknown token'
  if (value.length > VALUE_MAX_LENGTH) return `At most ${ VALUE_MAX_LENGTH } characters`

  const rule = VALUE_RULES[kind]
  const functions = [...value.matchAll(/([\w-]+) *\(/g)].map(([, name]) => name.toLowerCase())

  if (
    !rule.pattern.test(value)
    || /\/\*|\*\//.test(value)
    || functions.some(name => !rule.functions.includes(name))
    || (typeof CSS !== 'undefined' && !CSS.supports(rule.property, kind === 'color' ? value.replace(PALETTE_VAR, SAMPLE_COLOR) : value))
  ) return rule.error

  return undefined
}

export const isTokenKey = (key: string): key is TokenKey => TOKEN_KINDS.has(key)

/** Whether a token has an effect in a layout style: the glass gradient's colors only in glass. */
export const isTokenInLayout = (token: Token, layout: string | undefined) => !token.layouts || token.layouts.includes((layout ?? 'flat') as LayoutId)

export const findPreset = (id: string | undefined) => PRESETS.find(preset => preset.id === id)

/** Keeps the known preset and tokens with valid values; drops everything else. */
export const normalizeConfig = (value: unknown): ThemeConfig => {
  if (!(value instanceof Object)) return {}

  const config: ThemeConfig = {}

  for (const [key, item] of Object.entries(value as Record<string, unknown>)) {
    if (key === 'preset') {
      const preset = findPreset(typeof item === 'string' ? item : undefined)

      if (preset && preset.id !== 'default') config.preset = preset.id
    } else if (key === 'neutral') {
      if (isNeutralScale(item)) config.neutral = item
    } else if (key === 'layout') {
      if (isLayoutId(item)) config.layout = item
    } else if (key === 'noise') {
      if (isNoiseId(item) && item !== 'none') config.noise = item
    } else if (isTokenKey(key) && typeof item === 'string' && item.trim() && !getTokenError(key, item.trim())) {
      config[key] = item.trim()
    }
  }

  return config
}

/** Reads `?theme=`: a preset id, or a JSON object of a preset and tokens. */
export const parseThemeParam = (value: string): ThemeConfig | undefined => {
  if (findPreset(value)) return normalizeConfig({preset: value})

  try {
    return normalizeConfig(JSON.parse(value))
  } catch {
    return undefined
  }
}

export const getTokens = (config: ThemeConfig): ThemeTokens => {
  const {preset, ...tokens} = config

  return {...findPreset(preset)?.tokens as ThemeTokens, ...tokens}
}

/** The CSS that applies a theme over an app's own: put it in a `<style>` after the app's stylesheet. */
export const getThemeStyleCss = (tokens: ThemeTokens) => {
  const declarations = expandTokens(tokens).map(([key, value]) => `--${ key }: ${ value };`)

  // Doubled so it outranks the theme on `:root` and the shell variables `style.css` sets on `body`.
  return declarations.length ? `:root:root, :root:root body {${ declarations.join(' ') }}\n${ getLayoutRules(tokens, ':root:root', ':root:root body') }` : ''
}

/**
 * Reads a theme pasted back from an assistant: its JSON, a theme link, or a whole reply holding either. Returns
 * undefined when nothing in it is a theme.
 */
export const parseThemeReply = (text: string): ThemeConfig | undefined => {
  const param = /[?&]theme=([^\s`'"<>]+)/.exec(text)?.[1]

  // `)` stays unencoded inside `oklch()`, so a link closing a Markdown `(…)` is tried without its last `)` too.
  for (const candidate of param ? [param, param.replace(/\)$/, '')] : []) {
    const config = parseThemeParam(new URLSearchParams(`${ THEME_QUERY_PARAM }=${ candidate }`).get(THEME_QUERY_PARAM) ?? '')

    if (config && Object.keys(config).length) return config
  }

  const json = /\{[\s\S]*\}/.exec(text)?.[0]
  const config = json ? parseThemeParam(json) : undefined

  return config && Object.keys(config).length ? config : undefined
}
