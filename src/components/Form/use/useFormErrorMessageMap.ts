import {type Ref, computed, inject, provide, ref, watch} from 'vue'

import {wFormErrorMessageUpdater} from '../models/injection'
import {compileMessage} from '../models/utils'

export const useFormErrorMessageMap = (name: Ref<string | undefined>, titleGetter: (key: string) => string) => {
  const errorMessageMap = ref<Record<string, string>>({})
  const isValid = computed<boolean>(() => !Object.values(errorMessageMap.value).some(item => item))

  const errorMessageMapUpdater = (key: string, value: string | undefined): void => {
    if (!value) errorMessageMapUnlistener(key)
    else errorMessageMap.value[key] = value

    if (!name.value) errorMessageUpdaterInjected?.(key, value)
  }

  const errorMessageMapUnlistener = (key: string) => {
    if (key in errorMessageMap.value) delete errorMessageMap.value[key]
  }

  const errorMessage = computed(() => {
    return Object.keys(errorMessageMap.value).map(key => compileMessage(titleGetter(key), errorMessageMap.value[key])).filter(item => item).join('\n')
  })

  provide(wFormErrorMessageUpdater, errorMessageMapUpdater)

  const errorMessageUpdaterInjected = inject(wFormErrorMessageUpdater, undefined)

  watch(errorMessage, value => {
    if (name.value) {
      errorMessageUpdaterInjected?.(name.value, value)
    }
  })

  return {
    errorMessageMapUnlistener,
    isValid,
    errorMessage,
    errorMessageMap,
  }
}
