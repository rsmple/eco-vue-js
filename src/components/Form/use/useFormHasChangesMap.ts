import {type Ref, computed, inject, provide, ref, watch} from 'vue'

import {wFormHasChangesUpdater} from '../models/injection'
import {removeKey} from '../models/utils'

export const useFormHasChangesMap = (name: Ref<string | undefined>) => {
  const hasChangesMap = ref<Record<string, true>>({})
  const hasChanges = computed<boolean>(() => Object.keys(hasChangesMap.value).length !== 0)

  const hasChangesMapUpdater = (key: string, value: boolean): void => {
    hasChangesMap.value = !value ? removeKey(hasChangesMap.value, key) : {...hasChangesMap.value, [key]: value}
  }

  const hasChangesMapUnlistener = (key: string) => {
    hasChangesMap.value = removeKey(hasChangesMap.value, key)
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
  }
}
