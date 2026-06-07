export const weekdayShortFormatter = Intl.DateTimeFormat('en', {weekday: 'short'})
export const monthShortFormatter = Intl.DateTimeFormat('en', {month: 'short'})
export const dateFormatter = Intl.DateTimeFormat('en', {year: 'numeric', month: 'numeric', day: 'numeric'})

export const dateRegexp = /\d\d\.\d\d\.\d\d\d\d/i

export const parseDate = (value: string): Date | undefined => {
  if (!dateRegexp.test(value)) return

  const timestamp = Date.parse(value.split('.').reverse().join('.'))

  if (isNaN(timestamp)) return

  return new Date(timestamp)
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

export function dateFormat(date: Date): string {
  const month = date.getMonth() + 1
  return `${ date.getDate().toString().padStart(2, '0') }.${ month.toString().padStart(2, '0') }.${ date.getFullYear() }`
}

export function dateFormatShort(date: Date): string {
  return `${ date.getDate().toString().padStart(2, '0') } ${ monthShortFormatter.format(date) }`
}

export function timeFormat(date: Date): string {
  return date.toLocaleTimeString('en-GB')
}

export function timeFormatShort(date: Date): string {
  return date.toLocaleTimeString('en-GB', {timeStyle: 'short'})
}

export function datetimeFormat(date: Date): string {
  return `${ dateFormat(date) } ${ timeFormat(date) }`
}

export function durationHumanize(durationSeconds: number, full?: boolean, round?: boolean): string {
  const cb = full ? getDurationStringFull : getDurationString

  const seconds = durationSeconds % 60
  if (durationSeconds === seconds) return round ? cb(Math.round(seconds)) : cb(seconds)

  const durationMinutes = (durationSeconds - seconds) / 60
  const minutes = durationMinutes % 60
  if (durationMinutes === minutes) return round ? cb(0, Math.round(minutes + (seconds / 60))) : cb(seconds, minutes)

  const durationHours = (durationMinutes - minutes) / 60
  const hours = durationHours % 24
  if (durationHours === hours && (!round || durationHours < 22)) return round ? cb(0, 0, Math.round(hours + (minutes / 60))) :cb(seconds, minutes, hours)

  const durationDays = (durationHours - hours) / 24
  const days = durationDays % 365
  if (durationDays === days) {
    if (days < 30) return round ? cb(0, 0, 0, Math.round(days + (hours / 24))) : cb(seconds, minutes, hours, days)

    const newDays = days % 30
    const months = (days - newDays) / 30

    return round ? cb(0, 0, 0, 0, Math.round(months)) : cb(seconds, minutes, hours, newDays, months)
  } else {
    const durationYears = (durationDays - days) / 365

    if (days < 30) return round ? cb(0, 0, 0, 0, 0, Math.round(durationYears)) : cb(seconds, minutes, hours, days, 0, durationYears)

    const newDays = days % 30
    const months = (days - newDays) / 30

    return round ? cb(0, 0, 0, 0, 0, Math.round(durationYears)) : cb(seconds, minutes, hours, newDays, months, durationYears)
  }
}

function getDurationString(seconds: number, minutes?: number, hours?: number, days?: number, months?: number, years?: number) {
  const parts: string[] = []

  if (years) parts.push(`${ years } Y`)
  if (months) parts.push(`${ months } M`)
  if (days) parts.push(`${ days } d`)
  if (hours) parts.push(`${ hours } h`)
  if (minutes && !days) parts.push(`${ minutes } m`)
  if (seconds && !days && !hours) parts.push(`${ seconds } s`)

  return parts.join(' ')
}

function getDurationStringFull(seconds: number, minutes?: number, hours?: number, days?: number, months?: number, years?: number) {
  const parts: string[] = []

  if (years) parts.push(`${ years } year${ years === 1 ? '' : 's' }`)
  if (months) parts.push(`${ months } month${ months === 1 ? '' : 's' }`)
  if (days) parts.push(`${ days } day${ days === 1 ? '' : 's' }`)
  if (hours) parts.push(`${ hours } hour${ hours === 1 ? '' : 's' }`)
  if (minutes && !days) parts.push(`${ minutes } minute${ minutes === 1 ? '' : 's' }`)
  if (seconds && !days && !hours) parts.push(`${ seconds } second${ seconds === 1 ? '' : 's' }`)

  return parts.join(' ')
}

const minute = 60
const hour = 60 * minute
const day = 24 * hour
const month = 30 * day
const year = 365 * day

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
