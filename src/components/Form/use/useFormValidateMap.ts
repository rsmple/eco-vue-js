import {inject, onBeforeMount, provide, ref, type Ref} from 'vue'
import {wFormValidateUpdater} from '../models/injection'
import {compileMessage, removeKey} from '../models/utils'

export const useFormValidateMap = (name: Ref<string | undefined>, titleGetter: (key: string) => string) => {
  const validateMap = ref<Record<string, (silent?: boolean) => string | undefined>>({})

  const validateMapUpdater = (key: string, value: () => string | undefined): void => {
    validateMap.value = {...validateMap.value, [key]: value}
  }

  const validateMapUnlistener = (key: string) => {
    validateMap.value = removeKey(validateMap.value, key)
  }

  const validate = (silent?: boolean): string | undefined => {
    const messages = Object.keys(validateMap.value).map(key => compileMessage(titleGetter(key), validateMap.value[key](silent))).filter(item => item)

    return messages.length === 0 ? undefined : messages.join('\n')
  }

  provide(wFormValidateUpdater, validateMapUpdater)

  const validateUpdaterInjected = inject(wFormValidateUpdater, undefined)

  onBeforeMount(() => {
    if (name.value) {
      validateUpdaterInjected?.(name.value, validate)
    }
  })

  return {
    validateMapUnlistener,
    validate,
  }
}
