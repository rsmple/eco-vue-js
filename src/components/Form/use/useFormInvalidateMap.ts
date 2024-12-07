import {type Ref, inject, onBeforeMount, provide, ref} from 'vue'

import {wFormInvalidateUpdater} from '../models/injection'
import {removeKey} from '../models/utils'

type InvalidatePayload = Record<string, string | string[] | undefined>

export const useFormInvalidateMap = (name: Ref<string | undefined>) => {
  const invalidateMap = ref<Record<string, (messages: InvalidatePayload) => void>>({})

  const invalidateMapUpdater = (key: string, value: (messages: InvalidatePayload) => void): void => {
    invalidateMap.value = {...invalidateMap.value, [key]: value}
  }

  const invalidateMapUnlistener = (key: string) => {
    invalidateMap.value = removeKey(invalidateMap.value, key)
  }

  const invalidate = (payload: InvalidatePayload): void => {
    const value = name.value ? (payload[name.value] as unknown as InvalidatePayload | undefined ?? payload) : payload

    Object.keys(invalidateMap.value).forEach(key => {
      invalidateMap.value[key]?.(value)
    })
  }

  provide(wFormInvalidateUpdater, invalidateMapUpdater)

  const invalidateUpdaterInjected = inject(wFormInvalidateUpdater, undefined)

  onBeforeMount(() => {
    if (name.value) {
      invalidateUpdaterInjected?.(name.value, invalidate)
    }
  })

  return {
    invalidateMapUnlistener,
    invalidate,
  }
}
