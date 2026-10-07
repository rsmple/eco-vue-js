import {getIntl} from './locale'

const dateTimeFormatter = (key: string, options: Intl.DateTimeFormatOptions | ((locale: string) => Intl.DateTimeFormatOptions)): Pick<Intl.DateTimeFormat, 'format' | 'formatToParts'> => {
  const get = () => getIntl(key, locale => new Intl.DateTimeFormat(locale, typeof options === 'function' ? options(locale) : options))

  return {
    format: date => get().format(date),
    formatToParts: date => get().formatToParts(date),
  }
}

/** Hours with a leading zero on a 24-hour clock, `14:05` and `09:05`, and without one on a 12-hour clock, `9:05 AM`. */
const timeOptions = (locale: string, seconds: boolean): Intl.DateTimeFormatOptions => {
  const hour12 = new Intl.DateTimeFormat(locale, {timeStyle: 'short'}).resolvedOptions().hour12

  return {hour: hour12 ? 'numeric' : '2-digit', minute: '2-digit', second: seconds ? '2-digit' : undefined}
}

/** Formatters in the locale set with `setLocale`. */
export const weekdayShortFormatter = dateTimeFormatter('weekdayShort', {weekday: 'short'})
export const weekdayNarrowFormatter = dateTimeFormatter('weekdayNarrow', {weekday: 'narrow'})
export const monthShortFormatter = dateTimeFormatter('monthShort', {month: 'short'})
export const dateFormatter = dateTimeFormatter('date', {year: 'numeric', month: 'numeric', day: 'numeric'})

const dayMonthFormatter = dateTimeFormatter('dayMonth', {day: '2-digit', month: 'short'})
const dayMonthYearFormatter = dateTimeFormatter('dayMonthYear', {day: '2-digit', month: 'short', year: 'numeric'})
const dateInputFormatter = dateTimeFormatter('dateInput', {day: '2-digit', month: '2-digit', year: 'numeric'})
const timeFormatter = dateTimeFormatter('time', {timeStyle: 'medium'})
const timeShortFormatter = dateTimeFormatter('timeShort', {timeStyle: 'short'})
const datetimeFormatters = {
  'year|seconds': dateTimeFormatter('datetime|year|seconds', locale => ({day: '2-digit', month: 'short', year: 'numeric', ...timeOptions(locale, true)})),
  'year|': dateTimeFormatter('datetime|year|', locale => ({day: '2-digit', month: 'short', year: 'numeric', ...timeOptions(locale, false)})),
  '|seconds': dateTimeFormatter('datetime||seconds', locale => ({day: '2-digit', month: 'short', ...timeOptions(locale, true)})),
  '|': dateTimeFormatter('datetime||', locale => ({day: '2-digit', month: 'short', ...timeOptions(locale, false)})),
}

const getDate = (year: number, month: number, day: number): Date | undefined => {
  const date = new Date(year, month - 1, day)

  return date.getFullYear() === year && date.getMonth() === month - 1 && date.getDate() === day ? date : undefined
}

export const dateRegexp = /\d\d\.\d\d\.\d\d\d\d/i

/** Reads `dd.mm.yyyy`, the same in every locale, such as from a query param. Returns `undefined` for text that is not a date. */
export const parseDateQuery = (value: string): Date | undefined => {
  if (!dateRegexp.test(value)) return

  const [day, month, year] = value.match(dateRegexp)![0].split('.').map(Number) as [number, number, number]

  return getDate(year, month, day)
}

/** The date as typed in a date field in the current locale: `07/10/2026` in `en-GB`, `10/07/2026` in `en-US`, `07.10.2026` in `ru`. `parseDateInput` reads it back. */
export function dateInputFormat(date: Date): string {
  return dateInputFormatter.format(date)
}

/** Reads a date typed as `dateInputFormat` writes it: the day, month and 4-digit year in the order of the current locale, with any separators. Returns `undefined` for text that is not a date. */
export const parseDateInput = (value: string): Date | undefined => {
  const numbers = value.match(/\d+/g)

  if (numbers?.length !== 3) return

  const order = dateInputFormatter.formatToParts(new Date()).map(part => part.type).filter(type => type === 'day' || type === 'month' || type === 'year')
  const parts = Object.fromEntries(order.map((type, index) => [type, numbers[index]!])) as Record<'day' | 'month' | 'year', string>

  if (parts.year.length !== 4) return

  return getDate(Number(parts.year), Number(parts.month), Number(parts.day))
}

export enum WeekDay {
  SUNDAY = 0,
  MONDAY = 1,
  TUESDAY = 2,
  WEDNESDAY = 3,
  THURSDAY = 4,
  FRIDAY = 5,
  SATURDAY = 6,
}

export enum Month {
  JANUARY = 0,
  FEBRUARY = 1,
  MARCH = 2,
  APRIL = 3,
  MAY = 4,
  JUNE = 5,
  JULY = 6,
  AUGUST = 7,
  SEPTEMBER = 8,
  OCTOBER = 9,
  NOVEMBER = 10,
  DECEMBER = 11,
}

export function dateToQueryString(date: Date): string {
  date = new Date(date)

  date.setMinutes(date.getMinutes() - date.getTimezoneOffset())

  return date.toISOString().split('T')[0]!
}

export type DateFormatOptions = {
  /** `always` shows the year, `auto` only when it is not the current one. Defaults to `always`. */
  year?: 'always' | 'auto'
}

export type TimeFormatOptions = {
  /** Shows the seconds. Defaults to `true`. */
  seconds?: boolean
}

export type DatetimeFormatOptions = DateFormatOptions & TimeFormatOptions

const hasYear = (date: Date, year: DateFormatOptions['year'] = 'always'): boolean => year === 'always' || !isSameYear(date, new Date())

/** The date with the month name, so it reads the same way in any locale: `07 Oct 2026`, or `Oct 07, 2026` in `en-US`. With `year: 'auto'`, `07 Oct` this year. */
export function dateFormat(date: Date, {year}: DateFormatOptions = {}): string {
  return (hasYear(date, year) ? dayMonthYearFormatter : dayMonthFormatter).format(date)
}

/** `14:30:05`, or `2:30:05 PM` in a locale with a 12-hour clock. With `seconds: false`, `14:30`. */
export function timeFormat(date: Date, {seconds = true}: TimeFormatOptions = {}): string {
  return (seconds ? timeFormatter : timeShortFormatter).format(date)
}

/** The date, then the time, joined the way the locale joins them: `07 Oct 2026, 14:30:05`. With `{year: 'auto', seconds: false}`, `07 Oct, 14:30` this year. */
export function datetimeFormat(date: Date, {year, seconds = true}: DatetimeFormatOptions = {}): string {
  return datetimeFormatters[`${ hasYear(date, year) ? 'year' : '' }|${ seconds ? 'seconds' : '' }`].format(date)
}

/** `Today` in the current locale, as a label. */
export function todayFormat(): string {
  const text = getIntl('today', locale => new Intl.RelativeTimeFormat(locale, {numeric: 'auto'})).format(0, 'day')

  return text.charAt(0).toLocaleUpperCase() + text.slice(1)
}

const minute = 60
const hour = 60 * minute
const day = 24 * hour
const month = 30 * day
const year = 365 * day

type DurationUnit = 'year' | 'month' | 'day' | 'hour' | 'minute' | 'second'

const durationUnits: [DurationUnit, number][] = [
  ['year', year],
  ['month', month],
  ['day', day],
  ['hour', hour],
  ['minute', minute],
  ['second', 1],
]

const getDurationParts = (seconds: number, round?: boolean): [DurationUnit, number][] => {
  if (round) {
    if (seconds < 1) return [['second', Math.round(seconds * 100) / 100]]
    if (seconds < minute) return [['second', Math.round(seconds)]]
    if (seconds < hour) return [['minute', Math.round(seconds / minute)]]
    if (seconds < 22 * hour) return [['hour', Math.round(seconds / hour)]]
    if (seconds < month) return [['day', Math.round(seconds / day)]]
    if (seconds < year) return [['month', Math.round(seconds / month)]]
    return [['year', Math.round(seconds / year)]]
  }

  let rest = seconds

  const values = durationUnits.map(([unit, size]): [DurationUnit, number] => {
    const value = size === 1 ? rest : Math.floor(rest / size)

    rest -= value * size

    return [unit, value]
  })

  const largest = values.findIndex(([, value]) => value !== 0)

  if (largest === -1) return [['second', 0]]

  return values.slice(largest, largest + 2).filter(([, value]) => value !== 0)
}

export type DurationFormatOptions = {
  /** `short` for `1 hr 30 mins`, `long` for `1 hour 30 minutes`. Defaults to `short`. */
  style?: 'short' | 'long'
  /** Keeps only the largest part, rounded: `2 hrs`. */
  round?: boolean
}

/** The duration in seconds, in the locale set with `setLocale`: `1 hr 30 mins`. Shows the largest part and the one right below it. */
export function durationFormat(durationSeconds: number, {style: unitDisplay = 'short', round}: DurationFormatOptions = {}): string {
  const negative = durationSeconds < 0

  const parts = getDurationParts(Math.abs(durationSeconds), round).map(([unit, value], index) => {
    const formatter = getIntl(`duration|${ unit }|${ unitDisplay }`, locale => new Intl.NumberFormat(locale, {style: 'unit', unit, unitDisplay}))

    return formatter.format(negative && index === 0 ? -value : value)
  })

  return getIntl('durationList', locale => new Intl.ListFormat(locale, {type: 'unit', style: 'narrow'})).format(parts)
}

export function getDurationRound(seconds: number): number {
  if (seconds < 0) return 0
  if (seconds <= 60) return Math.ceil(seconds / 10) * 10
  if (seconds <= 10 * minute) return Math.ceil(seconds / minute) * minute
  if (seconds <= 30 * minute) return Math.ceil(seconds / (minute * 10)) * minute * 10
  if (seconds <= 12 * hour) return Math.ceil(seconds / hour) * hour
  if (seconds <= 10 * day) return Math.ceil(seconds / day) * day
  if (seconds <= 30 * day) return Math.ceil(seconds / (day * 10)) * day * 10
  if (seconds <= 5.5 * month) return Math.ceil(seconds / month) * month
  return Math.ceil(seconds / year) * year
}

export function getStartOfMonth(date: Date = new Date()): Date {
  const year = date.getFullYear()
  const month = date.getMonth()

  const startOfMonth = new Date()
  startOfMonth.setFullYear(year, month, 1)

  return getStartOfDay(startOfMonth)
}

export function addDay(date: Date = new Date(), count: number): Date {
  const newDate = new Date(date)

  newDate.setDate(newDate.getDate() + count)

  return newDate
}

export function addMonth(date: Date = new Date(), count: number): Date {
  const newDate = new Date(date)

  newDate.setMonth(newDate.getMonth() + count)

  return newDate
}

export function addYear(date: Date = new Date(), count: number): Date {
  const newDate = new Date(date)

  newDate.setFullYear(newDate.getFullYear() + count)

  return newDate
}

export function getStartOfWeek(date: Date = new Date(), startFrom: WeekDay = WeekDay.MONDAY): Date {
  const startFromPrepared = startFrom || 7
  const dayOfWeek = date.getDay() || 7
  let diff = startFromPrepared - dayOfWeek

  if (diff > 0) diff -= 7

  const startOfWeek = new Date(date)

  startOfWeek.setDate(date.getDate() + diff)

  return getStartOfDay(startOfWeek)
}

export function getStartOfDay(date: Date = new Date()): Date {
  const startOfDay = new Date(date)

  startOfDay.setHours(0, 0, 0, 0)

  return startOfDay
}

export function getStartOfNextDay(date: Date = new Date()): Date {
  const startOfDay = getStartOfDay(date)

  startOfDay.setDate(startOfDay.getDate() + 1)

  return startOfDay
}

export function isSameDate(a: Date, b: Date): boolean {
  return a.getDate() === b.getDate() && isSameMonth(a, b)
}

export function isSameWeek(a: Date, b: Date): boolean {
  return isSameDate(getStartOfWeek(a), getStartOfWeek(b))
}

export function isSameMonth(a: Date, b: Date): boolean {
  return a.getMonth() === b.getMonth() && isSameYear(a, b)
}

export function isSameYear(a: Date, b: Date): boolean {
  return a.getFullYear() === b.getFullYear()
}
