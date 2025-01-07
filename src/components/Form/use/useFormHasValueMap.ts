import {type Ref, computed, inject, provide, ref, watch} from 'vue'

import {wFormHasValueUpdater} from '../models/injection'

export const useFormHasValueMap = (name: Ref<string | undefined>) => {
  const hasValueMap = ref<Record<string, boolean>>({})
  const hasValue = computed<boolean | null>(() => {
    const items = Object.values(hasValueMap.value)

    if (items.length === 0) return null

    return items.length !== 0 && items.every(value => value)
  })

  const hasValueMapUpdater = (key: string, value: boolean | null): void => {
    if (value === null) hasValueMapUnlistener(key)
    else hasValueMap.value[key] = value

    if (!name.value) hasValueUpdaterInjected?.(key, value)
  }

  const hasValueMapUnlistener = (key: string) => {
    if (key in hasValueMap.value) delete hasValueMap.value[key]
  }

  provide(wFormHasValueUpdater, hasValueMapUpdater)

  const hasValueUpdaterInjected = inject(wFormHasValueUpdater, undefined)

  watch(hasValue, value => {
    if (name.value) {
      hasValueUpdaterInjected?.(name.value, value)
    }
  }, {immediate: true})

  return {
    hasValueMapUnlistener,
    hasValue,
    hasValueMap,
  }
}
