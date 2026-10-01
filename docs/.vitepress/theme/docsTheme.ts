import {computed, ref, watch} from 'vue'

import rolesCss from '../../../package/tailwind-base/css/roles.css?raw'
import themeCss from '../../../package/tailwind-base/css/theme.css?raw'
import {THEME_STORAGE_KEY as STORAGE_KEY, THEME_STYLE_ID as STYLE_ID} from '../themeHeadScript'
import {NEUTRAL_SCALES, PRESETS, type PresetId, expandNeutral, getThemeBlock, isNeutralScale} from '../themePresets'

export {NEUTRAL_SCALES, PRESETS, type PresetId}

type PaletteKey =
  | 'color-primary' | 'color-primary-dark' | 'color-primary-light' | 'color-primary-darkest'
  | 'color-default' | 'color-default-dark' | 'color-black-default'
  | 'color-negative' | 'color-negative-dark' | 'color-positive' | 'color-positive-dark'
  | 'color-warning' | 'color-warning-dark' | 'color-info' | 'color-info-dark'

/** Color roles a theme can set per mode (`css/roles.css`), with what they paint. */
const ROLES = {
  'text-accent': 'Main text',
  'text-description': 'Muted text: descriptions, captions, secondary values',
  'text-subtle': 'Placeholders, disabled text, chart axes',
  surface: 'Page, cards, dropdowns',
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

type Token = {key: TokenKey, group: string, label: string, description?: string, kind: 'color' | 'neutral' | 'size' | 'font'}

const SAME_IN_DARK = 'Empty: same as in light mode'

/**
 * What the playground edits. `color-*` and `role-*` are Tailwind theme tokens, `neutral` picks the `gray-*` scale and
 * `w-*` are set on `body`. Roles default to palette colors, so they sit in an advanced group.
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
  ...(Object.entries(ROLES) as [RoleName, string][]).flatMap(([name, description]): Token[] => [
    {key: `role-${ name }`, group: 'Roles', label: name, description, kind: 'color'},
    {key: `role-${ name }-dark`, group: 'Roles', label: `${ name }, dark mode`, kind: 'color'},
  ]),
  {key: 'w-input-height', group: 'Shape', label: 'Input height', description: 'Inputs and selects; options inside them follow', kind: 'size'},
  {key: 'w-input-rounded', group: 'Shape', label: 'Input radius', description: 'Also the side padding of options; half the height at most', kind: 'size'},
  {key: 'w-input-gap', group: 'Shape', label: 'Input gap', description: 'Between the field border and the options in it', kind: 'size'},
  {key: 'w-button-height', group: 'Shape', label: 'Button height', kind: 'size'},
  {key: 'w-button-rounded', group: 'Shape', label: 'Button radius', description: 'Also the side padding; half the height at most', kind: 'size'},
  {key: 'w-list-header-height', group: 'Shape', label: 'List header height', kind: 'size'},
  {key: 'w-list-header-rounded', group: 'Shape', label: 'List header radius', kind: 'size'},
  {key: 'w-checkbox-size', group: 'Shape', label: 'Checkbox size', kind: 'size'},
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

const TOKEN_KEYS = new Set<string>(TOKENS.map(token => token.key))

// A value ends up inside a style rule, so anything that could close it or load a resource is refused.
const isSafeValue = (value: unknown): value is string => typeof value === 'string' && value.length <= 120 && !/[;{}<>\\]|url\(|@import/i.test(value)

export const isTokenKey = (key: string): key is TokenKey => TOKEN_KEYS.has(key)

export const findPreset = (id: string | undefined) => PRESETS.find(preset => preset.id === id)

/** Keeps the known preset and tokens with safe values; drops everything else. */
export const normalizeConfig = (value: unknown): ThemeConfig => {
  if (!(value instanceof Object)) return {}

  const config: ThemeConfig = {}

  for (const [key, item] of Object.entries(value as Record<string, unknown>)) {
    if (key === 'preset') {
      const preset = findPreset(typeof item === 'string' ? item : undefined)

      if (preset && preset.id !== 'default') config.preset = preset.id
    } else if (key === 'neutral') {
      if (isNeutralScale(item)) config.neutral = item
    } else if (isTokenKey(key) && isSafeValue(item) && item.trim()) {
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

export const setPreset = (id: PresetId) => {
  themeConfig.value = id === 'default' ? {} : {preset: id}
}

export const resetTheme = () => {
  themeConfig.value = {}
}

/** Sets one token; an empty value, or the one the preset already gives, removes the override. */
export const setToken = (key: TokenKey, value: string) => {
  const config = {...themeConfig.value}

  delete config[key]

  const base = findPreset(config.preset)?.tokens as ThemeTokens | undefined
  const trimmed = value.trim()

  themeConfig.value = trimmed && isSafeValue(trimmed) && trimmed !== (base?.[key] ?? DEFAULT_TOKENS[key]) ? {...config, [key]: trimmed} : config
}

/** A link that opens `path` with the theme applied. */
export const getThemeLink = (config: ThemeConfig, path = 'guide/theming') => {
  const url = new URL(path, window.location.origin + import.meta.env.BASE_URL)

  if (Object.keys(config).length) url.searchParams.set(THEME_QUERY_PARAM, JSON.stringify(config))

  return url.toString()
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

const readStored = (): ThemeConfig => {
  try {
    return normalizeConfig(JSON.parse(localStorage.getItem(STORAGE_KEY) ?? 'null')?.config)
  } catch {
    return {}
  }
}

let isInstalled = false

/** Restores the stored theme, takes the one from `?theme=` over it, and keeps the page and storage in sync. */
export const installDocsTheme = () => {
  if (isInstalled) return
  isInstalled = true

  themeConfig.value = readStored()

  const url = new URL(window.location.href)
  const param = url.searchParams.get(THEME_QUERY_PARAM)

  if (param !== null) {
    const config = parseThemeParam(param)

    if (config) themeConfig.value = config

    // The theme is stored from here on; the link stays clean for copying and reloads.
    url.searchParams.delete(THEME_QUERY_PARAM)
    window.history.replaceState(window.history.state, '', url)
  }

  watch(themeConfig, config => {
    const css = toCss(getTokens(config))

    applyCss(css)
    store(config, css)
  }, {immediate: true})
}
