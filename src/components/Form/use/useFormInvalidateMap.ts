import {type Ref} from 'vue'

import {useFormValueMap} from './useFormValueMap'

import {wFormInvalidateUpdater} from '../models/injection'

type InvalidatePayload = Record<string, string | string[] | undefined>

export const useFormInvalidateMap = (name: Ref<string | undefined>) => {
  const {map, value, unlistener} = useFormValueMap(
    wFormInvalidateUpdater,
    name,
    map => (payload: InvalidatePayload): void => {
      const value = name.value ? (payload[name.value] as unknown as InvalidatePayload | undefined ?? payload) : payload
  
      Object.keys(map.value).forEach(key => {
        map.value[key]?.(value)
      })
    },
  )

  return {
    invalidateMapUnlistener: unlistener,
    invalidate: value,
    invalidateMap: map,
  }
}
