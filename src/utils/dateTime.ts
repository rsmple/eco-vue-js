export const weekdayShortFormatter = Intl.DateTimeFormat('en', {weekday: 'short'})
export const monthShortFormatter = Intl.DateTimeFormat('en', {month: 'short'})
export const dateFormatter = Intl.DateTimeFormat('en', {year: 'numeric', month: 'numeric', day: 'numeric'})

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

  return date.toISOString().split('T')[0]
}

export function dateFormat(date: Date): string {
  const month = date.getMonth() + 1
  const day = date.getDate()
  return `${day.toString().padStart(2, '0')}.${month.toString().padStart(2, '0')}.${date.getFullYear()}`
}

export function timeFormat(date: Date): string {
  return date.toLocaleTimeString('en-GB')
}

export function datetimeFormat(date: Date): string {
  return `${dateFormat(date)} ${timeFormat(date)}`
}

export function durationHumanize(durationSeconds: number): string {
  const seconds = durationSeconds % 60
  if (durationSeconds === seconds) return getDurationString(seconds)

  const durationMinutes = (durationSeconds - seconds) / 60
  const minutes = durationMinutes % 60
  if (durationMinutes === minutes) return getDurationString(seconds, minutes)

  const durationHours = (durationMinutes - minutes) / 60
  const hours = durationHours % 24
  if (durationHours === hours) return getDurationString(seconds, minutes, hours)

  const durationDays = (durationHours - hours) / 24

  return getDurationString(seconds, minutes, hours, durationDays)
}

function getDurationString(seconds: number, minutes?: number, hours?: number, days?: number) {
  const parts: string[] = []

  if (days) parts.push(`${days} d`)
  if (hours) parts.push(`${hours} h`)
  if (minutes && !days) parts.push(`${minutes} m`)
  if (seconds && !days && !hours) parts.push(`${seconds} s`)

  return parts.join(' ')
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

export function isSameDate(a: Date, b: Date): boolean {
  return a.getDate() === b.getDate() && isSameMonth(a, b)
}

export function isSameMonth(a: Date, b: Date): boolean {
  return a.getMonth() === b.getMonth() && isSameYear(a, b)
}

export function isSameYear(a: Date, b: Date): boolean {
  return a.getFullYear() === b.getFullYear()
}
