import {isEqualArrObj, throttle} from '@/utils/utils'

export const scrollToValidator = throttle((element: HTMLElement): void => {
  element.scrollIntoView({
    behavior: 'smooth',
    block: 'center',
    inline: 'nearest',
  })
}, 300)

export const getChangedPayload = <Result>(newValueObj: NonNullable<unknown>, oldValueObj: NonNullable<unknown>): Result => {
  const result: Result = {} as Result

  for (const key of Object.keys(newValueObj)) {
    const newValue = newValueObj[key as keyof typeof newValueObj] as unknown
    const oldValue = oldValueObj[key as keyof typeof oldValueObj] as unknown
    if (Array.isArray(newValue) && Array.isArray(oldValue)) {
      if (!isEqualArrObj(newValue, oldValue)) result[key as keyof Result] = newValueObj[key as keyof typeof newValueObj]
    } else if (newValue instanceof Object && oldValue instanceof Object) {
      const changed = getChangedPayload<NonNullable<unknown> & Result[keyof Result]>(newValue, oldValue)
      if (Object.keys(changed).length) result[key as keyof Result] = changed
    } else if (newValue !== oldValue) {
      result[key as keyof Result] = newValueObj[key as keyof typeof newValueObj]
    }
  }

  return result
}