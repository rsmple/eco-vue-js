import {computed, ref, watch} from 'vue'

import {THEME_STORAGE_KEY as STORAGE_KEY, THEME_STYLE_ID as STYLE_ID} from '../themeHeadScript'

/** The kit's theme variables the playground edits: `color-*` and `font-*` are Tailwind theme tokens, `w-*` are set on `body`. */
export const TOKENS = [
  {key: 'color-primary', group: 'Brand', label: 'Primary', description: 'Fills and accents in light mode'},
  {key: 'color-primary-dark', group: 'Brand', label: 'Primary, dark mode', description: 'Fills and accents in dark mode, and primary text'},
  {key: 'color-primary-light', group: 'Brand', label: 'Primary tint', description: 'Soft backgrounds in light mode, such as list headers'},
  {key: 'color-primary-darkest', group: 'Brand', label: 'Primary tint, dark mode', description: 'Soft backgrounds in dark mode'},
  {key: 'color-default', group: 'Surface', label: 'Background', description: 'Page and card background in light mode'},
  {key: 'color-default-dark', group: 'Surface', label: 'Background, dark mode', description: 'Page and card background in dark mode'},
  {key: 'color-black-default', group: 'Surface', label: 'Text', description: 'Main text in light mode'},
  {key: 'color-negative', group: 'Status', label: 'Negative', description: 'Errors and destructive actions'},
  {key: 'color-negative-dark', group: 'Status', label: 'Negative, dark mode'},
  {key: 'color-positive', group: 'Status', label: 'Positive', description: 'Success'},
  {key: 'color-positive-dark', group: 'Status', label: 'Positive, dark mode'},
  {key: 'color-warning', group: 'Status', label: 'Warning'},
  {key: 'color-warning-dark', group: 'Status', label: 'Warning, dark mode'},
  {key: 'color-info', group: 'Status', label: 'Info'},
  {key: 'color-info-dark', group: 'Status', label: 'Info, dark mode'},
  {key: 'w-input-height', group: 'Shape', label: 'Input height', description: 'Inputs and selects; options inside them follow'},
  {key: 'w-input-rounded', group: 'Shape', label: 'Input radius', description: 'Also the side padding of options; half the height at most'},
  {key: 'w-input-gap', group: 'Shape', label: 'Input gap', description: 'Between the field border and the options in it'},
  {key: 'w-button-height', group: 'Shape', label: 'Button height'},
  {key: 'w-button-rounded', group: 'Shape', label: 'Button radius', description: 'Also the side padding; half the height at most'},
  {key: 'w-list-header-height', group: 'Shape', label: 'List header height'},
  {key: 'w-list-header-rounded', group: 'Shape', label: 'List header radius'},
  {key: 'w-checkbox-size', group: 'Shape', label: 'Checkbox size'},
  {key: 'font-sans', group: 'Font', label: 'Font family', description: 'Only MontSerrat is loaded on this site; other families must be installed locally'},
] as const satisfies {key: string, group: string, label: string, description?: string}[]

export type TokenKey = typeof TOKENS[number]['key']

export type ThemeTokens = Partial<Record<TokenKey, string>>

/** What this site renders with: the kit's theme tokens, and the `w-*` values `style.css` sets on `body`. */
export const DEFAULT_TOKENS: Record<TokenKey, string> = {
  'color-primary': '#9087e2',
  'color-primary-dark': '#5b4fc4',
  'color-primary-light': '#f4f3fc',
  'color-primary-darkest': '#23222e',
  'color-default': '#ffffff',
  'color-default-dark': 'oklch(21% 0.006 285.885)',
  'color-black-default': '#333333',
  'color-negative': '#f35555',
  'color-negative-dark': '#cc3636',
  'color-positive': '#77d460',
  'color-positive-dark': '#5bb245',
  'color-warning': '#ffda56',
  'color-warning-dark': '#e6b919',
  'color-info': '#82adff',
  'color-info-dark': '#407ae5',
  'w-input-height': '2.25rem',
  'w-input-rounded': '0.5rem',
  'w-input-gap': '0.125rem',
  'w-button-height': '2.25rem',
  'w-button-rounded': '0.75rem',
  'w-list-header-height': '2.25rem',
  'w-list-header-rounded': '0.75rem',
  'w-checkbox-size': '0.75rem',
  'font-sans': 'MontSerrat, system-ui, sans-serif',
}

export const PRESETS = [
  {id: 'default', name: 'Default', tokens: {}},
  {
    id: 'ocean',
    name: 'Ocean',
    tokens: {
      'color-primary': '#5aa9e6',
      'color-primary-dark': '#2b7bc0',
      'color-primary-light': '#eef6fd',
      'color-primary-darkest': '#1b2530',
    },
  },
  {
    id: 'forest',
    name: 'Forest',
    tokens: {
      'color-primary': '#52b788',
      'color-primary-dark': '#2d8a5f',
      'color-primary-light': '#eef8f3',
      'color-primary-darkest': '#1c2a24',
      'w-input-rounded': '1.125rem',
      'w-button-rounded': '1.125rem',
    },
  },
  {
    id: 'sunset',
    name: 'Sunset',
    tokens: {
      'color-primary': '#f4976c',
      'color-primary-dark': '#d8612e',
      'color-primary-light': '#fdf2ec',
      'color-primary-darkest': '#2e231e',
      'color-default-dark': '#1f1b1a',
    },
  },
  {
    id: 'compact',
    name: 'Compact',
    tokens: {
      'color-primary': '#71717a',
      'color-primary-dark': '#52525b',
      'color-primary-light': '#f4f4f5',
      'color-primary-darkest': '#27272a',
      'w-input-height': '2rem',
      'w-input-rounded': '0.25rem',
      'w-input-gap': '0.125rem',
      'w-button-height': '2rem',
      'w-button-rounded': '0.25rem',
      'w-list-header-height': '2rem',
      'w-list-header-rounded': '0.25rem',
    },
  },
] as const satisfies {id: string, name: string, tokens: ThemeTokens}[]

export type PresetId = typeof PRESETS[number]['id']

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

  return {...findPreset(preset)?.tokens, ...tokens}
}

const toCss = (tokens: ThemeTokens) => {
  const declarations = Object.entries(tokens).map(([key, value]) => `--${ key }: ${ value };`)

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
 * CSS for an app's stylesheet: changed colors and fonts as theme tokens, and every shape variable, since an app's
 * defaults differ from this site's.
 */
export const getThemeCss = (tokens: ThemeTokens) => {
  const effective = {...DEFAULT_TOKENS, ...tokens}
  const theme = TOKENS.filter(token => !token.key.startsWith('w-') && effective[token.key] !== DEFAULT_TOKENS[token.key])
  const body = TOKENS.filter(token => token.key.startsWith('w-'))

  return [
    ...theme.length ? ['@theme {', ...theme.map(token => `  --${ token.key }: ${ effective[token.key] };`), '}', ''] : [],
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
