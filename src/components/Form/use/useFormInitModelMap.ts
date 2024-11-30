import {type Ref, inject, onBeforeMount, provide, ref} from 'vue'

import {wFormInitModelUpdater} from '../models/injection'
import {removeKey} from '../models/utils'

export const useFormInitModelMap = (name: Ref<string | undefined>) => {
  const initModelMap = ref<Record<string, () => void>>({})

  const initModelMapUpdater = (key: string, value: () => void): void => {
    initModelMap.value = {...initModelMap.value, [key]: value}
  }

  const initModelMapUnlistener = (key: string) => {
    initModelMap.value = removeKey(initModelMap.value, key)
  }

  const initModel = (): void => {
    Object.keys(initModelMap.value).forEach(key => {
      initModelMap.value[key]?.()
    })
  }

  provide(wFormInitModelUpdater, initModelMapUpdater)

  const initModelInjected = inject(wFormInitModelUpdater, undefined)

  onBeforeMount(() => {
    if (name.value) {
      initModelInjected?.(name.value, initModel)
    }
  })

  return {
    initModelMapUnlistener,
    initModel,
  }
}
