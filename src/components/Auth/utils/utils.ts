const EXPIRATION_DATE_KEY = 'exp'
const REFRESH_TIMESTAMP_KEY = 'refresh-ts'
const REFRESH_BUFFER_TIMEOUT = 3 * 1000
const REFRESH_BUFFER_TICK = 1000

function getCookie(name: string): string {
  name = name + '='

  for (const item of decodeURIComponent(document.cookie).split('; ')) {
    if (item.startsWith(name)) return item.substring(name.length)
  }

  return ''
}

function setCookie(name: string, value: string, expires?: Date) {
  document.cookie = name + '=' + encodeURIComponent(value) + '; Path=/;' + (expires ? ' Expires=' + expires.toUTCString() + ';' : '')
}

function deleteCookie(name: string) {
  document.cookie = name + '=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;'
}

const EXP_FACTOR = 1000

export function checkExpirationDate(): boolean | null {
  const exp = Number.parseFloat(getCookie(EXPIRATION_DATE_KEY))

  if (!exp || !Number.isFinite(exp)) return null

  return exp > Date.now() / EXP_FACTOR
}

export function updateExpirationDate(date: Date) {
  const exp = (date.getTime() / EXP_FACTOR).toString()
  setCookie(EXPIRATION_DATE_KEY, exp, date)
  localStorage.setItem(EXPIRATION_DATE_KEY, exp)
}

export function setExpirationDate() {
  const exp = Number.parseFloat(getCookie(EXPIRATION_DATE_KEY))

  if (!exp || !Number.isFinite(exp)) return

  localStorage.setItem(EXPIRATION_DATE_KEY, exp.toString())
}

export function removeExpirationDate() {
  localStorage.removeItem(EXPIRATION_DATE_KEY)
  deleteCookie(EXPIRATION_DATE_KEY)
}

let refreshTimestampTimeout: NodeJS.Timeout | null = null

export function setRefreshTimestamp() {
  localStorage.setItem(REFRESH_TIMESTAMP_KEY, new Date().getTime().toString())

  if (refreshTimestampTimeout) clearTimeout(refreshTimestampTimeout)

  refreshTimestampTimeout = setTimeout(() => {
    localStorage.removeItem(REFRESH_TIMESTAMP_KEY)
  }, REFRESH_BUFFER_TIMEOUT)
}

export function removeRefreshTimestamp(): void {
  localStorage.removeItem(REFRESH_TIMESTAMP_KEY)
}

export function getLastRefreshPromise(): Promise<void> | null {
  const lastRefreshTimeStamp = Number.parseInt(localStorage.getItem(REFRESH_TIMESTAMP_KEY) ?? '')

  if (!Number.isInteger(lastRefreshTimeStamp) || lastRefreshTimeStamp <= 0) return null

  const diff = new Date().getTime() - lastRefreshTimeStamp

  if (diff <= 0 || diff > REFRESH_BUFFER_TIMEOUT) return null

  let count = Math.floor((REFRESH_BUFFER_TIMEOUT - diff) / REFRESH_BUFFER_TICK)

  return new Promise<void>((resolve, reject) => {
    const interval = setInterval(async () => {
      if (count < 1) {
        clearInterval(interval)
        reject(new Error('Timed out'))
      } else if (checkExpirationDate()) {
        clearInterval(interval)
        resolve()
      } else {
        count--
      }
    }, REFRESH_BUFFER_TICK)
  })
}