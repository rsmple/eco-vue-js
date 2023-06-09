
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

export const isEqualObj = (obj1: Record<string, unknown>, obj2: Record<string, unknown>, exclude?: string[]): boolean => {
  return [...Object.keys(obj1), ...Object.keys(obj2)].every(key => exclude?.includes(key) || obj1[key] === obj2[key])
}
