
const overflowScrollRegexp = /auto|scroll|overlay/

const getStyleValue = (node: Element, prop: string) => getComputedStyle(node, null).getPropertyValue(prop)

const isScroll = (node: Element) => overflowScrollRegexp.test(
  getStyleValue(node, 'overflow') +
  getStyleValue(node, 'overflow-y') +
  getStyleValue(node, 'overflow-x'),
)

export const getScrollParent = (node: Element): Element | null =>
  node.parentElement
    ? isScroll(node.parentElement)
      ? node.parentElement
      : getScrollParent(node.parentElement)
    : null

export const getAllScrollParents = (node?: Element, max = 10): Array<Element> => {
  const arr: Array<Element> = []

  let parent = node && getScrollParent(node)

  if (parent) arr.push(parent)

  while (parent && arr.length < max) {
    parent = getScrollParent(parent)
    if (parent) arr.push(parent)
  }

  return arr
}

export const hasParent = (parent: Element, current: Element): boolean => {
  if (current === parent) return true
  else if (!current.parentElement) return false
  else return hasParent(parent, current.parentElement)
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type DebounceCb = (...args: any[]) => void

export function debounce<T extends DebounceCb>(cb: T, delay = 200): T {
  let timeout: NodeJS.Timeout | undefined

  return function (this: unknown, ...args: Parameters<T>) {
    if (timeout) clearTimeout(timeout)

    timeout = setTimeout(() => {
      timeout = undefined
      cb.apply(this, args)
    }, delay)
  } as T
}

export function throttle<T extends DebounceCb>(cb: T, delay = 200): T {
  let timeout: NodeJS.Timeout | undefined

  return function (this: unknown, ...args: Parameters<T>) {
    if (timeout) return

    cb.apply(this, args)

    timeout = setTimeout(() => {
      timeout = undefined
    }, delay)
  } as T
}

export const isEqualArr = (arr1: unknown[], arr2: unknown[]): boolean => {
  return arr1.length === arr2.length && arr1.every(item => arr2.includes(item))
}

export const isEqualObj = (obj1: Record<string, unknown>, obj2: Record<string, unknown>, exclude?: string[], include?: string[]): boolean => {
  return Object.keys({...obj1, ...obj2})
    .every(key => {
      if (include && !include.includes(key)) return true

      if (exclude?.includes(key) || obj1[key] === obj2[key]) return true

      if (Array.isArray(obj1[key]) && Array.isArray(obj2[key])) return isEqualArr(obj1[key] as unknown[], obj2[key] as unknown[])

      return false
    })
}

export const percentCompactFormatter = Intl.NumberFormat('en', {notation: 'compact', style: 'percent'})
export const numberCompactFormatter = Intl.NumberFormat('en', {notation: 'compact'})
export const numberFormatter = Intl.NumberFormat('fr')

export const isClientSide: boolean = typeof window !== 'undefined'

let iterator = 1

export const genId = () => {
  return iterator++
}

export const isId = (value: unknown): value is number => {
  return typeof value === 'number' && Number.isInteger(value) && value > 0
}

export const parseId = (value: unknown): number => {
  if (typeof value === 'number' && isId(value)) return value

  if (typeof value !== 'string') return NaN

  const parsed = Number.parseInt(value)

  if (isId(parsed)) return parsed

  return NaN
}

export const isPage = (value: unknown): value is number => isId(value)

export const isIndex = (value: unknown): value is number => {
  return typeof value === 'number' && Number.isInteger(value) && value >= 0
}

export const parseIndex = (value: unknown): number => {
  if (typeof value === 'number' && isIndex(value)) return value

  if (typeof value !== 'string') return NaN

  const parsed = Number.parseInt(value)

  if (isIndex(parsed)) return parsed

  return NaN
}
