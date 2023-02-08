import {inject, onBeforeMount, provide, ref, type Ref} from 'vue'
import {wFormInvalidateUpdater} from '../models/injection'
import {removeKey} from '../models/utils'

export const useFormInvalidateMap = (name: Ref<string | undefined>) => {
  const invalidateMap = ref<Record<string, (messages: Record<string, string>) => void>>({})

  const invalidateMapUpdater = (key: string, value: (messages: Record<string, string>) => void): void => {
    invalidateMap.value = {...invalidateMap.value, [key]: value}
  }

  const invalidateMapUnlistener = (key: string) => {
    invalidateMap.value = removeKey(invalidateMap.value, key)
  }

  const invalidate = (payload: Record<string, string>): void => {
    Object.keys(payload).forEach(key => {
      invalidateMap.value[key]?.(payload)
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
