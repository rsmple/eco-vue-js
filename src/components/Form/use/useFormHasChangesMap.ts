import {type Ref, computed, inject, provide, ref, watch} from 'vue'

import {wFormHasChangesUpdater} from '../models/injection'

export const useFormHasChangesMap = (name: Ref<string | undefined>) => {
  const hasChangesMap = ref<Record<string, true>>({})
  const hasChanges = computed<boolean>(() => Object.keys(hasChangesMap.value).length !== 0)

  const hasChangesMapUpdater = (key: string, value: boolean): void => {
    if (!value) hasChangesMapUnlistener(key)
    else hasChangesMap.value[key] = value

    if (!name.value) hasChangesUpdaterInjected?.(key, value)
  }

  const hasChangesMapUnlistener = (key: string) => {
    if (key in hasChangesMap.value) delete hasChangesMap.value[key]
  }

  provide(wFormHasChangesUpdater, hasChangesMapUpdater)

  const hasChangesUpdaterInjected = inject(wFormHasChangesUpdater, undefined)

  watch(hasChanges, value => {
    if (name.value) {
      hasChangesUpdaterInjected?.(name.value, value)
    }
  })

  return {
    hasChangesMapUnlistener,
    hasChanges,
    hasChangesMap,
  }
}
