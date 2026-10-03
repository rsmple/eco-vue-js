import {computed, ref, shallowRef, toRaw, watch} from 'vue'

import rolesCss from '../../../package/tailwind-base/css/roles.css?raw'
import themeCss from '../../../package/tailwind-base/css/theme.css?raw'
import {THEME_STORAGE_KEY as STORAGE_KEY, THEME_STYLE_ID as STYLE_ID} from '../themeHeadScript'
import {FULL_HUE_RANGE, type HueRange, NEUTRAL_SCALES, PRESETS, type PresetId, RANDOM_STYLES, type RandomStyleId, expandNeutral, getHueGradient, getHueSwatch, getRandomTokens, getThemeBlock, isFullHueRange, isHueRange, isNeutralScale, isRandomStyleId} from '../themePresets'

export {FULL_HUE_RANGE, type HueRange, NEUTRAL_SCALES, PRESETS, type PresetId, RANDOM_STYLES, type RandomStyleId, getHueGradient, getHueSwatch, isFullHueRange}

type PaletteKey =
  | 'color-primary' | 'color-primary-dark' | 'color-primary-light' | 'color-primary-darkest'
  | 'color-default' | 'color-default-dark' | 'color-black-default'
  | 'color-negative' | 'color-negative-dark' | 'color-positive' | 'color-positive-dark'
  | 'color-warning' | 'color-warning-dark' | 'color-info' | 'color-info-dark'
  | `color-data-${ DataHue }`

export const DATA_HUES = ['red', 'orange', 'amber', 'green', 'teal', 'cyan', 'blue', 'violet', 'fuchsia', 'pink', 'gray'] as const

type DataHue = typeof DATA_HUES[number]

/** Color roles a theme can set per mode (`css/roles.css`), with what they paint. */
const ROLES = {
  'text-accent': 'Main text',
  'text-description': 'Muted text: descriptions, captions, secondary values',
  'text-subtle': 'Placeholders, disabled text, chart axes',
  surface: 'Page, cards, dropdowns',
  'surface-subtle': 'Panels and cards set off from the page, such as the docs sidebar',
  'surface-muted': 'Secondary fills, striped rows, tooltips',
  'surface-inset': 'Fills inside controls, chips',
  overlay: 'Translucent bars over scrolling content, such as the header',
  backdrop: 'Behind modals, bottom sheets and the mobile nav',
  track: 'Inactive parts of controls: slider and progress tracks',
  'track-strong': 'The stronger track: neutral progress bars, slider and tab indicator parts',
  line: 'Field borders and dividers',
  'line-subtle': 'Card and section borders',
  'line-raised': 'Edge of dropdowns and popovers',
  focus: 'Focused field border and ring',
} as const

type RoleName = keyof typeof ROLES

type ShapeKey = 'w-input-height' | 'w-input-rounded' | 'w-input-gap' | 'w-button-height' | 'w-button-rounded' | 'w-list-header-height' | 'w-list-header-rounded' | 'w-checkbox-size'

export type TokenKey = PaletteKey | 'neutral' | `role-${ RoleName }` | `role-${ RoleName }-dark` | ShapeKey | 'font-sans'

/**
 * The px a size slider runs through: from `min` to `max`, or for a radius to half of the `pillOf` height, where it
 * turns into a pill.
 */
type SizeRange = {min: number, max: number} | {min: number, pillOf: ShapeKey}

type Token = {key: TokenKey, group: string, label: string, description?: string, kind: 'color' | 'neutral' | 'size' | 'font', range?: SizeRange}

const HEIGHT_RANGE: SizeRange = {min: 24, max: 56}

const SAME_IN_DARK = 'Empty: same as in light mode'

/**
 * What the playground edits. `color-*` and `role-*` are Tailwind theme tokens, `neutral` picks the `gray-*` scale and
 * `w-*` are set on `body`. Data colors and roles sit in advanced groups: most themes leave them.
 */

/** Groups the playground shows collapsed, with what they are for. */
export const ADVANCED_GROUPS: Record<string, string> = {
  Data: 'Distinct hues for categories: chart series, scanners, syntax. Each works as a tone, in both modes.',
  Roles: 'What components paint with, by purpose. Each takes a palette color by default, so a theme sets them only to break from the palette: a darker line, a tinted surface. A role is set per mode.',
}

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
  {key: 'font-sans', group: 'Font', label: 'Font family', description: 'Only MontSerrat is loaded on this site; other families must be installed locally', kind: 'font'},
]

export type ThemeTokens = Partial<Record<TokenKey, string>>

/** `--name: value;` declarations of the kit's CSS, read from the source so the defaults can't drift. */
const KIT_VALUES = Object.fromEntries([...(themeCss + rolesCss).matchAll(/^\s*--([\w-]+):\s*([^;]+);/gm)].map(([, key, value]) => [key, value.trim()]))

/** What this site renders with: the kit's theme and roles, and the `w-*` values `style.css` sets on `body`. */
export const DEFAULT_TOKENS: Record<TokenKey, string> = {
  ...Object.fromEntries(TOKENS.filter(token => token.kind === 'color' || token.kind === 'font').map(token => [token.key, KIT_VALUES[token.key] ?? ''])) as Record<TokenKey, string>,
  neutral: 'zinc',
  'w-input-height': '2.25rem',
  'w-input-rounded': '0.5rem',
  'w-input-gap': '0.125rem',
  'w-button-height': '2.25rem',
  'w-button-rounded': '0.75rem',
  'w-list-header-height': '2.25rem',
  'w-list-header-rounded': '0.75rem',
  'w-checkbox-size': '0.75rem',
}

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
const VALUE_RULES: Record<Exclude<Token['kind'], 'neutral'>, {pattern: RegExp, functions: string[], property: string, error: string}> = {
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

/** Why `value` can't be set to `key`, or undefined when it can. Checked by the browser too where `CSS` is available. */
export const getTokenError = (key: TokenKey, value: string): string | undefined => {
  const kind = TOKEN_KINDS.get(key)

  if (kind === 'neutral') return isNeutralScale(value) ? undefined : `Not a neutral scale: one of ${ Object.keys(NEUTRAL_SCALES).join(', ') }`
  if (!kind) return 'Unknown token'
  if (value.length > VALUE_MAX_LENGTH) return `At most ${ VALUE_MAX_LENGTH } characters`

  const rule = VALUE_RULES[kind]
  const functions = [...value.matchAll(/([\w-]+) *\(/g)].map(([, name]) => name.toLowerCase())

  if (
    !rule.pattern.test(value)
    || /\/\*|\*\//.test(value)
    || functions.some(name => !rule.functions.includes(name))
    || (typeof CSS !== 'undefined' && !CSS.supports(rule.property, value))
  ) return rule.error

  return undefined
}

export const isTokenKey = (key: string): key is TokenKey => TOKEN_KINDS.has(key)

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

const toCss = (tokens: ThemeTokens) => {
  const declarations = expandNeutral(tokens).map(([key, value]) => `--${ key }: ${ value };`)

  // Doubled so it outranks the theme on `:root` and the shell variables `style.css` sets on `body`.
  return declarations.length ? `:root:root, :root:root body {${ declarations.join(' ') }}` : ''
}

/** The theme in use across the site. */
export const themeConfig = ref<ThemeConfig>({})

export const themeTokens = computed(() => getTokens(themeConfig.value))

export const hasCustomTokens = computed(() => Object.keys(themeConfig.value).some(key => key !== 'preset'))

/** A theme's primary in the current mode, for the dot next to its name: its dark primary in dark mode when it has one. */
export const getThemeSwatch = (config: ThemeConfig) => {
  const tokens = getTokens(config)
  const light = tokens['color-primary'] ?? DEFAULT_TOKENS['color-primary']
  const dark = tokens['color-primary-dark'] ?? light

  return light === dark ? light : `light-dark(${ light }, ${ dark })`
}

/** A theme saved under a name in this browser. */
export type SavedTheme = {id: string, name: string, config: ThemeConfig}

const THEMES_STORAGE_KEY = 'eco-vue-docs-themes'

const NAME_MAX_LENGTH = 60

export const savedThemes = ref<SavedTheme[]>([])

/** The saved theme being edited: changes to the theme are saved into it as they are made. Null while unsaved. */
export const activeThemeId = ref<string | null>(null)

export const activeTheme = computed(() => savedThemes.value.find(theme => theme.id === activeThemeId.value))

const sameConfig = (first: ThemeConfig, second: ThemeConfig) => JSON.stringify(Object.entries(first).sort()) === JSON.stringify(Object.entries(second).sort())

/** Opens a theme that isn't saved — a preset, a random one, a pasted reply — leaving the saved ones as they are. */
export const loadTheme = (config: ThemeConfig) => {
  activeThemeId.value = null
  themeConfig.value = config
}

export const setPreset = (id: PresetId) => {
  loadTheme(id === 'default' ? {} : {preset: id})
}

const randomConfig = shallowRef<ThemeConfig | null>(null)

/** Whether the theme in use is a random one, not yet edited or saved: edits and saves make a new config. */
export const isRandomTheme = computed(() => !activeThemeId.value && toRaw(themeConfig.value) === randomConfig.value)

const RANDOM_STYLE_STORAGE_KEY = 'eco-vue-docs-random-style'

/** The style the Random buttons generate in, from `RANDOM_STYLES`. Remembered in this browser. */
export const randomStyle = ref<RandomStyleId>('vivid')

const RANDOM_HUES_STORAGE_KEY = 'eco-vue-docs-random-hues'

/** The hues a random primary is taken from. Remembered in this browser. */
export const randomHues = ref<HueRange>(FULL_HUE_RANGE)

/** A random primary and status tones in `randomStyle` with the neutral scale, size and radius that go with them; see `getRandomTokens`. */
export const setRandomTheme = () => {
  randomConfig.value = normalizeConfig(getRandomTokens(randomStyle.value, randomHues.value))
  loadTheme(randomConfig.value)
}

export const resetTheme = () => {
  loadTheme({})
}

export const isThemeNameTaken = (name: string, exceptId?: string) => savedThemes.value.some(theme => theme.id !== exceptId && theme.name === name.trim())

/** `name`, or `name 2`, `name 3`… when it is taken. */
export const getUniqueThemeName = (name: string) => {
  if (!isThemeNameTaken(name)) return name

  for (let index = 2; ; index++) if (!isThemeNameTaken(`${ name } ${ index }`)) return `${ name } ${ index }`
}

const addTheme = (name: string, config: ThemeConfig, index = savedThemes.value.length) => {
  const theme: SavedTheme = {id: crypto.randomUUID(), name: name.slice(0, NAME_MAX_LENGTH), config: {...config}}

  savedThemes.value = savedThemes.value.toSpliced(index, 0, theme)
  activeThemeId.value = theme.id
  themeConfig.value = theme.config
}

/** Saves the theme in use under a new name and keeps editing it there. */
export const saveThemeAs = (name: string) => addTheme(name, themeConfig.value)

export const selectTheme = (id: string) => {
  const theme = savedThemes.value.find(item => item.id === id)

  if (!theme) return

  activeThemeId.value = theme.id
  themeConfig.value = theme.config
}

export const renameTheme = (id: string, name: string) => {
  savedThemes.value = savedThemes.value.map(theme => theme.id === id ? {...theme, name: name.slice(0, NAME_MAX_LENGTH)} : theme)
}

/** Copies a saved theme next to it and switches to the copy. */
export const duplicateTheme = (id: string) => {
  const index = savedThemes.value.findIndex(theme => theme.id === id)

  if (index !== -1) addTheme(getUniqueThemeName(`${ savedThemes.value[index].name } copy`), savedThemes.value[index].config, index + 1)
}

/** Removes a saved theme. When it is the one in use, the site keeps showing it, unsaved. */
export const deleteTheme = (id: string) => {
  savedThemes.value = savedThemes.value.filter(theme => theme.id !== id)

  if (activeThemeId.value === id) activeThemeId.value = null
}

/** Drops every saved theme. The site keeps the theme in use until another is picked. */
export const deleteAllThemes = () => {
  savedThemes.value = []
  activeThemeId.value = null
}

/** Sets one token; an empty or invalid value, or the one the preset already gives, removes the override. */
export const setToken = (key: TokenKey, value: string) => {
  const config = {...themeConfig.value}

  delete config[key]

  const base = findPreset(config.preset)?.tokens as ThemeTokens | undefined
  const trimmed = value.trim()

  themeConfig.value = trimmed && !getTokenError(key, trimmed) && trimmed !== (base?.[key] ?? DEFAULT_TOKENS[key]) ? {...config, [key]: trimmed} : config
}

/** The playground form's model: every token as typed, empty when unset. */
export type ThemeFormModel = Record<TokenKey, string>

export const toFormModel = (config: ThemeConfig): ThemeFormModel => Object.fromEntries(TOKENS.map(token => [token.key, config[token.key] ?? ''])) as ThemeFormModel

/**
 * Sets every token from the playground form as `setToken` does, except that an invalid value keeps the token's last
 * valid one: the field shows what is wrong while the theme stays as it was. Returns the new config.
 */
export const setTokens = (model: ThemeFormModel): ThemeConfig => {
  const config = {...themeConfig.value}
  const base = findPreset(config.preset)?.tokens as ThemeTokens | undefined

  for (const token of TOKENS) {
    const value = model[token.key].trim()

    if (value && getTokenError(token.key, value)) continue

    if (value && value !== (base?.[token.key] ?? DEFAULT_TOKENS[token.key])) config[token.key] = value
    else delete config[token.key]
  }

  themeConfig.value = config

  return config
}

/** A link that opens `path` with the theme applied. With a name, opening it adds the theme to the saved ones. */
export const getThemeLink = (config: ThemeConfig, path = 'guide/theming', name?: string) => {
  const url = new URL(path, window.location.origin + import.meta.env.BASE_URL)

  if (Object.keys(config).length || name) url.searchParams.set(THEME_QUERY_PARAM, JSON.stringify(name ? {...config, name} : config))

  return url.toString()
}

/**
 * A prompt for an AI assistant to make a theme from a description. It lists the tokens with their defaults and the
 * limits the kit's contrast checks hold them to, and asks for a link to this page with the theme applied, so the
 * result is tried here and Copy CSS gives the app's stylesheet.
 */
export const getThemePrompt = (description: string, config: ThemeConfig) => {
  const listed = TOKENS.filter(token => !ADVANCED_GROUPS[token.group])
  const line = (token: Token) => `- ${ token.key }: ${ token.label.toLowerCase() }${ token.description ? ` (${ token.description.replace(/^Empty: /, 'empty: ') })` : '' }, default ${ DEFAULT_TOKENS[token.key].replace(/var\(--color-([\w-]+)\)/g, '$1') }`
  const advanced = Object.keys(ADVANCED_GROUPS).map(group => `${ group }: ${ TOKENS.filter(token => token.group === group && !token.key.endsWith('-dark')).map(token => token.key).join(', ') }`)

  return [
    'Make a theme for eco-vue-js, a Vue 3 UI kit on Tailwind v4.',
    `The look: ${ description.trim() || 'surprise me, but keep it usable for a dense business app' }`,
    '',
    'A theme is a JSON object of tokens. Set only what the look needs: every token left out keeps its default.',
    ...listed.map(line),
    `Also available, usually left out: ${ advanced.join('; ') }. Roles take a -dark variant too.`,
    '',
    'Rules:',
    '- Colors as oklch(L% C H). "neutral" is one of: ' + Object.keys(NEUTRAL_SCALES).join(', ') + '.',
    '- Primary and the status colors are fills under black or white text, which the kit picks by lightness (white below L 58%). A fill needs 3:1 contrast with the page and 4.5:1 with its text, in light mode against the background and in dark mode against the dark background. When one value cannot pass both, set its -dark variant.',
    '- Readable text, focus rings and soft backgrounds are derived from these fills, so don\'t ask for more colors to get them.',
    '- Radii at most half the matching height. Sizes in rem.',
    ...Object.keys(config).length ? ['', `The theme I have now, to adjust or replace as the look asks: ${ JSON.stringify(getTokens(config)) }`] : [],
    '',
    'Reply with:',
    '1. The theme as one JSON object in a ```json code block.',
    `2. In a second code block, a link that opens the docs with it applied: ${ getThemeLink({}) }?theme= followed by the JSON, URL-encoded. Keep it in a code block: chat apps may strip links from plain text.`,
    '3. One short line per token you set, saying why.',
    '',
    'I will paste the JSON or the link into the theming page, which previews the components and gives the CSS for the app, so no CSS is needed.',
  ].join('\n')
}

/**
 * Reads a theme pasted back from an assistant: its JSON, a theme link, or a whole reply holding either. Returns
 * undefined when nothing in it is a theme.
 */
export const parseThemeReply = (text: string): ThemeConfig | undefined => {
  const param = /[?&]theme=([^\s`'"<>]+)/.exec(text)?.[1]

  // `)` stays unencoded inside `oklch()`, so a link closing a Markdown `(…)` is tried without its last `)` too.
  for (const candidate of param ? [param, param.replace(/\)$/, '')] : []) {
    try {
      const config = parseThemeParam(decodeURIComponent(candidate))

      if (config && Object.keys(config).length) return config
    } catch {
      // Not URL-encoded as asked: try the next candidate, then the JSON.
    }
  }

  const json = /\{[\s\S]*\}/.exec(text)?.[0]
  const config = json ? parseThemeParam(json) : undefined

  return config && Object.keys(config).length ? config : undefined
}

/**
 * CSS for an app's stylesheet: changed colors, roles and fonts as theme tokens, and every shape variable, since an
 * app's defaults differ from this site's.
 */
export const getThemeCss = (tokens: ThemeTokens) => {
  const effective = {...DEFAULT_TOKENS, ...tokens}
  const changed = Object.fromEntries(TOKENS.filter(token => !token.key.startsWith('w-') && effective[token.key] !== DEFAULT_TOKENS[token.key]).map(token => [token.key, effective[token.key]]))
  const body = TOKENS.filter(token => token.key.startsWith('w-'))
  const theme = getThemeBlock(changed)

  return [
    ...theme ? [theme, ''] : [],
    'body {',
    ...body.map(token => `  --${ token.key }: ${ effective[token.key] };`),
    '}',
  ].join('\n')
}

const applyCss = (css: string) => {
  let style = document.getElementById(STYLE_ID)

  if (!style) {
    style = document.createElement('style')
    style.id = STYLE_ID
    document.head.appendChild(style)
  }

  style.textContent = css
}

const store = (config: ThemeConfig, css: string) => {
  try {
    if (Object.keys(config).length) localStorage.setItem(STORAGE_KEY, JSON.stringify({config, css}))
    else localStorage.removeItem(STORAGE_KEY)
  } catch {
    // Storage is blocked: the theme still applies until the page is closed.
  }
}

/** The `name` a theme link carries, if any. */
const parseThemeName = (value: string): string | undefined => {
  try {
    const {name} = JSON.parse(value) as {name?: unknown}

    return typeof name === 'string' && name.trim() ? name.trim().slice(0, NAME_MAX_LENGTH) : undefined
  } catch {
    return undefined
  }
}

const readStoredThemes = (): {themes: SavedTheme[], activeId: string | null} => {
  try {
    const value = JSON.parse(localStorage.getItem(THEMES_STORAGE_KEY) ?? 'null') as {themes?: unknown, activeId?: unknown} | null
    const themes = (Array.isArray(value?.themes) ? value.themes as Record<string, unknown>[] : [])
      .filter(theme => theme instanceof Object && typeof theme.id === 'string' && typeof theme.name === 'string' && theme.name.trim())
      .map(theme => ({id: theme.id as string, name: (theme.name as string).slice(0, NAME_MAX_LENGTH), config: normalizeConfig(theme.config)}))
    const activeId = themes.find(theme => theme.id === value?.activeId)?.id ?? null

    return {themes, activeId}
  } catch {
    return {themes: [], activeId: null}
  }
}

const storeThemes = (themes: SavedTheme[], activeId: string | null) => {
  try {
    if (themes.length) localStorage.setItem(THEMES_STORAGE_KEY, JSON.stringify({themes, activeId}))
    else localStorage.removeItem(THEMES_STORAGE_KEY)
  } catch {
    // Storage is blocked: the themes last until the page is closed.
  }
}

/** Opens a theme from a link: a named one joins the saved themes, unless the same one is saved already. */
const openThemeParam = (param: string) => {
  const config = parseThemeParam(param)

  if (!config) return

  const name = parseThemeName(param)

  if (!name) return loadTheme(config)

  const saved = savedThemes.value.find(theme => sameConfig(theme.config, config))

  if (saved) selectTheme(saved.id)
  else addTheme(getUniqueThemeName(name), config)
}

const readStored = (): ThemeConfig => {
  try {
    return normalizeConfig(JSON.parse(localStorage.getItem(STORAGE_KEY) ?? 'null')?.config)
  } catch {
    return {}
  }
}

const readStoredRandomStyle = (): RandomStyleId => {
  try {
    const value = localStorage.getItem(RANDOM_STYLE_STORAGE_KEY)

    return isRandomStyleId(value) ? value : 'vivid'
  } catch {
    return 'vivid'
  }
}

const storeRandomStyle = (value: RandomStyleId) => {
  try {
    localStorage.setItem(RANDOM_STYLE_STORAGE_KEY, value)
  } catch {
    // Storage is blocked: the style lasts until the page is closed.
  }
}

const readStoredRandomHues = (): HueRange => {
  try {
    const value = JSON.parse(localStorage.getItem(RANDOM_HUES_STORAGE_KEY) ?? 'null') as unknown

    return isHueRange(value) ? value : FULL_HUE_RANGE
  } catch {
    return FULL_HUE_RANGE
  }
}

const storeRandomHues = (value: HueRange) => {
  try {
    localStorage.setItem(RANDOM_HUES_STORAGE_KEY, JSON.stringify(value))
  } catch {
    // Storage is blocked: the range lasts until the page is closed.
  }
}

let isInstalled = false

/** Restores the stored theme, takes the one from `?theme=` over it, and keeps the page and storage in sync. */
export const installDocsTheme = () => {
  if (isInstalled) return
  isInstalled = true

  themeConfig.value = readStored()

  const stored = readStoredThemes()

  savedThemes.value = stored.themes
  activeThemeId.value = stored.activeId

  // The saved theme is the truth: another tab may have edited it since the working copy was stored.
  if (activeTheme.value) themeConfig.value = activeTheme.value.config

  const url = new URL(window.location.href)
  const param = url.searchParams.get(THEME_QUERY_PARAM)

  if (param !== null) {
    openThemeParam(param)

    // The theme is stored from here on; the link stays clean for copying and reloads.
    url.searchParams.delete(THEME_QUERY_PARAM)
    window.history.replaceState(window.history.state, '', url)
  }

  watch(themeConfig, config => {
    const css = toCss(getTokens(config))

    applyCss(css)
    store(config, css)

    // Edits go into the saved theme in use. Opening another theme clears `activeThemeId` first, so it is never overwritten.
    const theme = activeTheme.value

    if (theme && !sameConfig(theme.config, config)) savedThemes.value = savedThemes.value.map(item => item.id === theme.id ? {...item, config} : item)
  }, {immediate: true})

  randomStyle.value = readStoredRandomStyle()
  watch(randomStyle, storeRandomStyle)

  randomHues.value = readStoredRandomHues()
  watch(randomHues, storeRandomHues)

  // Immediate, so a theme added from a link on load is stored too.
  watch([savedThemes, activeThemeId], ([themes, activeId]) => storeThemes(themes, activeId), {immediate: true})
}
