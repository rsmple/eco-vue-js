import {computed, inject, provide, ref, watch, type Ref} from 'vue'
import {wFormErrorMessageUpdater} from '../models/injection'
import {compileMessage, removeKey} from '../models/utils'

export const useFormErrorMessageMap = (name: Ref<string | undefined>, titleGetter: (key: string) => string) => {
  const errorMessageMap = ref<Record<string, string>>({})
  const isValid = computed<boolean>(() => !Object.values(errorMessageMap.value).some(item => item))

  const errorMessageMapUpdater = (key: string, value: string | undefined): void => {
    errorMessageMap.value = !value ? removeKey(errorMessageMap.value, key) : {...errorMessageMap.value, [key]: value}
  }

  const errorMessageMapUnlistener = (key: string) => {
    errorMessageMap.value = removeKey(errorMessageMap.value, key)
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
