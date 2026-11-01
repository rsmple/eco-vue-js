export const EXPIRATION_DATE_KEY = 'exp'
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

// Apps sharing an origin each need their own key, so one app's refresh does not hold up the other's
function getRefreshTimestampKey(key: string): string {
  return key === EXPIRATION_DATE_KEY ? REFRESH_TIMESTAMP_KEY : key + '-' + REFRESH_TIMESTAMP_KEY
}

export function checkExpirationDate(key = EXPIRATION_DATE_KEY): boolean | null {
  const exp = Number.parseFloat(getCookie(key))

  if (!exp || !Number.isFinite(exp)) return null

  return exp > Date.now() / EXP_FACTOR
}

export function updateExpirationDate(date: Date, key = EXPIRATION_DATE_KEY) {
  const exp = (date.getTime() / EXP_FACTOR).toString()
  setCookie(key, exp, date)
  localStorage.setItem(key, exp)
}

export function setExpirationDate(key = EXPIRATION_DATE_KEY) {
  const exp = Number.parseFloat(getCookie(key))

  if (!exp || !Number.isFinite(exp)) return

  localStorage.setItem(key, exp.toString())
}

export function removeExpirationDate(key = EXPIRATION_DATE_KEY) {
  localStorage.removeItem(key)
  deleteCookie(key)
}

const refreshTimestampTimeouts = new Map<string, ReturnType<typeof setTimeout>>()

export function setRefreshTimestamp(key = EXPIRATION_DATE_KEY) {
  const refreshKey = getRefreshTimestampKey(key)

  localStorage.setItem(refreshKey, new Date().getTime().toString())

  clearTimeout(refreshTimestampTimeouts.get(refreshKey))

  refreshTimestampTimeouts.set(refreshKey, setTimeout(() => {
    refreshTimestampTimeouts.delete(refreshKey)
    localStorage.removeItem(refreshKey)
  }, REFRESH_BUFFER_TIMEOUT))
}

export function removeRefreshTimestamp(key = EXPIRATION_DATE_KEY): void {
  localStorage.removeItem(getRefreshTimestampKey(key))
}

export function getLastRefreshPromise(key = EXPIRATION_DATE_KEY): Promise<void> | null {
  const lastRefreshTimeStamp = Number.parseInt(localStorage.getItem(getRefreshTimestampKey(key)) ?? '')

  if (!Number.isInteger(lastRefreshTimeStamp) || lastRefreshTimeStamp <= 0) return null

  const diff = new Date().getTime() - lastRefreshTimeStamp

  if (diff <= 0 || diff > REFRESH_BUFFER_TIMEOUT) return null

  let count = Math.floor((REFRESH_BUFFER_TIMEOUT - diff) / REFRESH_BUFFER_TICK)

  return new Promise<void>((resolve, reject) => {
    const interval = setInterval(async () => {
      if (count < 1) {
        clearInterval(interval)
        reject(new Error('Timed out'))
      } else if (checkExpirationDate(key)) {
        clearInterval(interval)
        resolve()
      } else {
        count--
      }
    }, REFRESH_BUFFER_TICK)
  })
}