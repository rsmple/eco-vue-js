import type {FieldConfig, FieldConfigMap, GetFieldLabels, ListFields} from '@/components/List/types'
import type {InjectionKey, VNode} from 'vue'

import {isField} from '@/components/List/models/utils'

const overflowScrollRegexp = /auto|scroll|overlay/

const getStyleValue = (node: Element, prop: string) => getComputedStyle(node, null).getPropertyValue(prop)

const isScroll = (node: Element) => overflowScrollRegexp.test(
  getStyleValue(node, 'overflow') +
  getStyleValue(node, 'overflow-y') +
  getStyleValue(node, 'overflow-x'),
)

export const getScrollParent = (node: Node): Element | null =>
  node.parentElement
    ? isScroll(node.parentElement)
      ? node.parentElement
      : getScrollParent(node.parentElement)
    : null

export const getAllScrollParents = (node?: Node, max = 10): Array<Element> => {
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

const getFormatter = (formatter: Intl.NumberFormat): Pick<Intl.NumberFormat, 'format'> => {
  return {
    format: (value: number) => formatter.format(value).replace(',', ' '),
  }
}

export const percentCompactFormatter = Intl.NumberFormat('en', {notation: 'compact', style: 'percent'})
export const percentFormatter = getFormatter(Intl.NumberFormat('en', {maximumFractionDigits: 3, style: 'percent'}))

export const numberCompactFormatter = Intl.NumberFormat('en', {notation: 'compact'})
export const numberFormatter = getFormatter(Intl.NumberFormat('en', {maximumFractionDigits: 3}))

export const isClientSide: boolean = typeof window !== 'undefined'

let iterator = 1

export const genId = () => {
  return iterator++
}

export const isId = (value: unknown): value is number => {
  return typeof value === 'number' && Number.isInteger(value) && value > 0
}

export const isIdArray = (value: unknown): value is number[] => {
  return Array.isArray(value) && value.every(isId)
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

export const parseString: ParseFn<string> = value => typeof value === 'string' ? value : undefined
export const parseBoolean: ParseFn<boolean> = value => value === 'true' ? true : value === 'false' ? false : undefined
export const parseInteger: ParseFn<number> = value => {
  const parsed = Number(value)

  if (Number.isInteger(parsed)) return parsed
}

export const parseStringList: ParseFn<string[]> = value => {
  if (typeof value !== 'string') return

  return value.split(',')
}

export const parseIntegerList: ParseFn<number[]> = value => {
  if (typeof value !== 'string') return

  return value.split(',').map(Number).filter(Number.isInteger)
}

export const parseIdList: ParseFn<number[]> = value => {
  if (typeof value !== 'string') return

  return value.split(',').map(Number).filter(isId)
}

export const parseSliceIndexes: ParseFn<[number, number]> = value => {
  if (typeof value !== 'string') return

  const parsed = parseIntegerList(value)

  if (parsed?.length === 2) return parsed as [number, number]
}

export const parseJson = <Data>(isValid: (value: unknown) => value is Data) => {
  return (value: unknown): Data | undefined => {
    if (!value || typeof value !== 'string') return undefined
  
    try {
      const parsed = JSON.parse(value)
  
      if (isValid(parsed)) return parsed
    } catch {}
  
    return undefined
  }
}

export const get = <FieldType, Data>(data: Data, path: keyof ObjectPaths<Data, FieldType>): FieldType | undefined => (path as string).split('.').reduce((result, current) => (result as Record<string, unknown>)?.[current] as Data, data) as FieldType | undefined

export const set = <FieldType, Data>(data: Data, path: keyof ObjectPaths<Data, FieldType>, value: FieldType): Data => {
  (path as string).split('.').reduce<Data>((acc, current, index, array) => {
    if (index !== array.length - 1) {
      if (!(acc as Record<string, unknown>)[current]) {
        (acc as Record<string, object>)[current] = {}
        return (acc as Record<string, unknown>)[current] as Data
      }
    } else {
      (acc as Record<string, FieldType>)[current] = value
    }

    return acc
  }, data)

  return data
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const getDefaultFieldConfigMap = <Fields extends ListFields<any, any>>(fields: Fields, visible: true extends IsTuple<Fields> ? GetFieldLabels<Fields>[] : string[]): FieldConfigMap<Fields> => {
  const result: Record<string, FieldConfig> = {}
  let order = 0

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const processFields = <F extends ListFields<any, any>>(fieldList: F) => {
    fieldList.forEach(field => {
      order++

      if (isField(field)) result[field.meta.label] = {
        width: null,
        visible: visible.includes(field.meta.label as typeof visible[number]),
        order,
        sticky: field.meta.sticky ?? false,
      }
      else processFields(field.meta.fields)
    })
  }

  processFields(fields)

  return result as FieldConfigMap<Fields>
}

export enum ListMode {
  TABLE = 'table',
  GRID = 'grid',
}

export enum Theme {
  LIGHT = 'light',
  DARK = 'dark',
}

export const unwrapSlots = (slots: VNode[]): VNode[] => {
  return slots.flatMap(slot => {
    if (typeof slot.type !== 'symbol') return slot
    else if (Array.isArray(slot?.children)) return unwrapSlots(slot.children as VNode[])
    else return []
  })
}

export const wBaseZIndex = Symbol('wBaseZIndex') as InjectionKey<number>

export const BASE_ZINDEX_MODAL = 1000
export const BASE_ZINDEX_BOTTOM_SHEET = 100
export const BASE_ZINDEX_ACTIONS_BAR = 40
export const BASE_ZINDEX_NAV_BAR = 30
export const BASE_ZINDEX_LIST_HEADER = 20
export const BASE_ZINDEX_HEADER_BAR = 10
export const BASE_ZINDEX_DROPDOWN = 2

export const getHasScrollbar = () => window.innerWidth - document.documentElement.clientWidth > 0

export enum WrapSelectionType {
  LINE_PREFIX = 'LINE_PREFIX',
  TOGGLE = 'TOGGLE'
}
