import {shallowRef} from 'vue'

type LocaleSource = string | (() => string)

const locale = shallowRef<LocaleSource>('en-GB')

/**
 * Sets the locale dates, times and durations are formatted in, app-wide. Called once, before the app mounts.
 * A getter, such as `() => i18n.global.locale.value`, is read as the value renders, so it follows a change of locale.
 */
export const setLocale = (value: LocaleSource): void => {
  locale.value = value
}

/** The locale set with `setLocale`, `en-GB` by default. Read in render or in a computed, so it updates. */
export const getLocale = (): string => {
  const value = locale.value

  return typeof value === 'function' ? value() : value
}

const cache = new Map<string, unknown>()

/** An `Intl` formatter for the current locale, created once per locale and options. */
export const getIntl = <T>(key: string, create: (locale: string) => T): T => {
  const current = getLocale()
  const cacheKey = `${ current }|${ key }`

  if (!cache.has(cacheKey)) cache.set(cacheKey, create(current))

  return cache.get(cacheKey) as T
}
