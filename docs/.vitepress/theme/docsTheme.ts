import {computed, ref, shallowRef, toRaw, watch} from 'vue'

import {THEME_QUERY_PARAM, TOKENS, type ThemeConfig, type ThemeTokens, type Token, type TokenKey, findPreset, getThemeStyleCss, getTokenError, getTokens, isTokenInLayout, isTokenKey, normalizeConfig, parseThemeParam} from '@/utils/themeConfig'
import {CANVAS_GLOWS, FULL_HUE_RANGE, type HueRange, LAYOUTS, LAYOUT_TOKENS, NEUTRAL_SCALES, NOISE_LEVELS, OVERLAY_MATERIALS, PRESETS, type PresetId, RANDOM_STYLES, type RandomStyleId, expandTokens, getHueGradient, getHueSwatch, getLayoutClass, getRandomTokens, getThemeBlock, isFullHueRange, isHueRange, isLayoutId, isRandomStyleId} from '@/utils/themePresets'

import rolesCss from '../../../package/tailwind-base/css/roles.css?raw'
import themeCss from '../../../package/tailwind-base/css/theme.css?raw'
import {THEME_STORAGE_KEY as STORAGE_KEY, THEME_STYLE_ID as STYLE_ID} from '../themeHeadScript'

export {DATA_HUES, TOKENS, type ThemeConfig, type ThemeTokens, type TokenKey, findPreset, getTokenError, getTokens, isTokenInLayout, isTokenKey, normalizeConfig, parseThemeParam, parseThemeReply} from '@/utils/themeConfig'
export {FULL_HUE_RANGE, type HueRange, LAYOUTS, NEUTRAL_SCALES, NOISE_LEVELS, OVERLAY_MATERIALS, PRESETS, type PresetId, RANDOM_STYLES, type RandomStyleId, getHueGradient, getHueSwatch, isFullHueRange}

/** Groups the playground shows collapsed, with what they are for. */
export const ADVANCED_GROUPS: Record<string, string> = {
  Data: 'Distinct hues for categories: chart series, plant kinds, syntax. Each works as a tone, in both modes.',
  Roles: 'What components paint with, by purpose. Each takes a palette color by default, so a theme sets them only to break from the palette: a darker line, a tinted surface. A role is set per mode.',
}

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
  'w-shadow-lift': '0.5rem',
  layout: 'flat',
  overlay: 'frosted',
  'w-inner-margin': '1rem',
  'w-inner-margin-sm': '1.5rem',
  'w-section-rounded': '0px',
  'w-section-gap': '0px',
  'w-card-padding': '1rem',
  'w-card-rounded': '1rem',
  'w-chrome-gap': '0px',
  'w-chrome-rounded': '0px',
  'role-canvas': 'var(--role-surface)',
  'role-canvas-dark': 'var(--role-surface-dark)',
  ...CANVAS_GLOWS,
  noise: 'none',
}

/** The defaults of a theme's layout, over the site's: what an unset layout token falls back to. */
export const getLayoutDefaults = (tokens: ThemeTokens): ThemeTokens => isLayoutId(tokens.layout) ? LAYOUT_TOKENS[tokens.layout] as ThemeTokens : {}

/** What each token of a theme falls back to when unset: its preset's value, its layout's, or the site's. */
export const getBaseTokens = (config: ThemeConfig): Record<TokenKey, string> => {
  const preset = findPreset(config.preset)?.tokens as ThemeTokens | undefined
  const layout = config.layout ?? preset?.layout

  // The layout itself falls back to the preset's: the one picked is what the other tokens fall back with.
  return {...DEFAULT_TOKENS, ...preset, ...getLayoutDefaults({layout}), layout: preset?.layout ?? DEFAULT_TOKENS.layout} as Record<TokenKey, string>
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

/**
 * A random primary and status tones in `randomStyle` with the neutral scale, size and radius that go with them, and the
 * glass canvas's gradient; see `getRandomTokens`. The layout style, its sizes and the grain stay as they are: a theme
 * is generated for the layout in use.
 */
export const setRandomTheme = () => {
  randomSource = {style: randomStyle.value, hues: randomHues.value, draws: []}
  makeRandomTheme()
}

/** What the random theme in use was made from: replayed to make the same theme again for another layout. */
let randomSource: {style: RandomStyleId, hues: HueRange, draws: number[]} | null = null

const makeRandomTheme = () => {
  if (!randomSource) return

  const {style, hues, draws} = randomSource
  const tokens = getTokens(themeConfig.value)
  const layoutTokens = Object.fromEntries(TOKENS.filter(token => (token.group === 'Layout' || token.key === 'noise') && tokens[token.key]).map(token => [token.key, tokens[token.key]]))
  const layout = isLayoutId(tokens.layout) ? tokens.layout : undefined
  let index = 0
  // The same draws in the same order, and new ones past them where the new layout asks for more.
  const random = () => draws[index++] ??= Math.random()

  randomConfig.value = normalizeConfig({...layoutTokens, ...getRandomTokens(style, hues, random, layout)})
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
  const wasRandom = isRandomTheme.value
  const config = {...themeConfig.value}

  delete config[key]

  const base = getBaseTokens({...config, [key]: value.trim()})
  const trimmed = value.trim()

  themeConfig.value = trimmed && !getTokenError(key, trimmed) && trimmed !== base[key] ? {...config, [key]: trimmed} : config

  // A random theme is made for its layout: a new layout makes it again for that one, and it stays the random theme.
  if (wasRandom && key === 'layout') makeRandomTheme()
}

/** The playground form's model: every token as typed, empty when unset. */
export type ThemeFormModel = Record<TokenKey, string>

export const toFormModel = (config: ThemeConfig): ThemeFormModel => Object.fromEntries(TOKENS.map(token => [token.key, config[token.key] ?? ''])) as ThemeFormModel

/**
 * Sets the tokens the playground form saved, as `setToken` does. The form sends only valid values; an invalid one
 * that gets here anyway is skipped and the token keeps its value. Returns the new config.
 */
export const setTokens = (tokens: Partial<ThemeFormModel>): ThemeConfig => {
  const config = {...themeConfig.value}
  const base = getBaseTokens({...config, ...tokens.layout?.trim() ? {layout: tokens.layout.trim()} : {}})

  for (const [key, item] of Object.entries(tokens) as [TokenKey, string][]) {
    const value = item.trim()

    if (value && getTokenError(key, value)) continue

    if (value && value !== base[key]) config[key] = value
    else delete config[key]
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
    '- "noise" is one of: ' + NOISE_LEVELS.map(level => level.id).join(', ') + '. The w-canvas-glow-* colors tint the glass layout\'s page background only.',
    '- "overlay" is one of: ' + OVERLAY_MATERIALS.map(material => material.id).join(', ') + ': lens glass for dropdowns, menus and the bars, frosted otherwise.',
    '- "layout" is one of: ' + LAYOUTS.map(layout => `${ layout.id } (${ layout.look.toLowerCase() })`).join(', ') + '. Its sizes are set only to change the layout\'s own.',
    '- Primary and the status colors are fills under black or white text, whichever reads better by APCA: white on fills with less luminance than a gray of L 71%, so a saturated purple or blue at L 65% still takes white. A fill with white text needs 3:1 contrast with the page, in light mode against the background and in dark mode against the dark background, and its text APCA Lc 60. Avoid fills right at the switch, where neither text reaches it. Keep status fills with white text near Lc 68, no deeper than Lc 70, so they don\'t outweigh the content beside them. When one value cannot pass in both modes, set its -dark variant.',
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
 * CSS for an app's stylesheet: changed colors, roles and fonts as theme tokens, and every shape variable, since an
 * app's defaults differ from this site's. A card or glass layout ships with the kit as a class (`layouts.css`), so
 * only what the theme changes from it is written out, and a role it sets goes on `:root`, past the class.
 */
export const getThemeCss = (tokens: ThemeTokens) => {
  const layout = isLayoutId(tokens.layout) && tokens.layout !== 'flat' ? tokens.layout : undefined
  const preset: Record<string, string> = layout ? LAYOUT_TOKENS[layout] : {}
  const effective = {...DEFAULT_TOKENS, ...preset, ...tokens}
  const isOwn = (key: string, value: string) => preset[key] !== value
  const changed = TOKENS.filter(token => !token.key.startsWith('w-') && token.kind !== 'layout' && token.kind !== 'overlay' && token.kind !== 'noise' && effective[token.key] !== DEFAULT_TOKENS[token.key] && isOwn(token.key, effective[token.key])).map(token => [token.key, effective[token.key]] as const)
  const theme = getThemeBlock(Object.fromEntries(changed.filter(([key]) => !(key in preset))))
  const root = changed.filter(([key]) => key in preset)
  // The grain is a picture, so `w-canvas-image` below carries it: expanded with the rest of the layout's tokens.
  // The playground's sizes, and what the theme sets besides its layout's, such as its opacities and shadows.
  const body = Object.entries({
    ...Object.fromEntries(TOKENS.filter(token => token.key.startsWith('w-') && isTokenInLayout(token, effective.layout)).map(token => [token.key, effective[token.key]])),
    ...Object.fromEntries(expandTokens(tokens).filter(([key]) => key.startsWith('w-') && !isTokenKey(key))),
  }).filter(([key, value]) => isOwn(key, value))

  return [
    ...layout ? [`/* The ${ layout } layout: \`class="${ getLayoutClass(layout) }"\` on <html>. */`, ''] : [],
    ...theme ? [theme, ''] : [],
    ...root.length ? [':root {', ...root.map(([key, value]) => `  --${ key }: ${ value };`), '}', ''] : [],
    'body {',
    ...body.map(([key, value]) => `  --${ key }: ${ value };`),
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
    const css = getThemeStyleCss(getTokens(config))

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
