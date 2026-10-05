import type {UniformInstance} from '../types'

import {getAllScrollParents, isEqualArrObj, throttle} from '@/utils/utils'

const isInRect = (rect: DOMRect, top: number, bottom: number, left: number, right: number): boolean =>
  rect.top >= top && rect.bottom <= bottom && rect.left >= left && rect.right <= right

const isFullyVisible = (element: HTMLElement): boolean => {
  const rect = element.getBoundingClientRect()

  if (!isInRect(rect, 0, window.innerHeight, 0, window.innerWidth)) return false

  return getAllScrollParents(element).every(parent => {
    const parentRect = parent.getBoundingClientRect()

    return isInRect(rect, parentRect.top, parentRect.bottom, parentRect.left, parentRect.right)
  })
}

export const scrollToValidator = throttle((element: HTMLElement): void => {
  if (isFullyVisible(element)) return

  element.scrollIntoView({
    behavior: 'smooth',
    block: 'center',
    inline: 'nearest',
  })
}, 300)

export const getChangedPayload = <Result>(newValueObj: NonNullable<unknown>, oldValueObj: NonNullable<unknown>, instanceList: UniformInstance[] | undefined): Result => {
  const result: Result = {} as Result

  for (const key of Object.keys(newValueObj)) {
    const newValue = newValueObj[key as keyof typeof newValueObj] as unknown
    const oldValue = oldValueObj[key as keyof typeof oldValueObj] as unknown
    if (newValue instanceof Date && oldValue instanceof Date) {
      if (newValue.getTime() !== oldValue.getTime()) result[key as keyof Result] = newValueObj[key as keyof typeof newValueObj]
    } else if (Array.isArray(newValue) && Array.isArray(oldValue)) {
      if (!isEqualArrObj(newValue, oldValue)) result[key as keyof Result] = newValueObj[key as keyof typeof newValueObj]
    } else if (newValue instanceof Object && oldValue instanceof Object) {
      const changed = getChangedPayload<NonNullable<unknown> & Result[keyof Result]>(newValue, oldValue, undefined)
      if (Object.keys(changed).length) result[key as keyof Result] = instanceList?.some(item => item.field === key && item.fullPayload)
        ? newValue as Result[keyof Result]
        : changed
    } else if (newValue !== oldValue) {
      result[key as keyof Result] = newValueObj[key as keyof typeof newValueObj]
    }
  }

  return result
}