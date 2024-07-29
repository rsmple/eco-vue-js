import {inject, onBeforeMount, provide, ref, type Ref} from 'vue'
import {wFormValidateUpdater} from '../models/injection'
import {compileMessage, removeKey} from '../models/utils'

export type ValidatePath = {
  [Key in string]: boolean | ValidatePath
}

export const useFormValidateMap = (name: Ref<string | undefined>, titleGetter: (key: string) => string, emitIsValid: (value: boolean) => void) => {
  const validateMap = ref<Record<string, (silent?: boolean, path?: ValidatePath) => string | undefined>>({})

  const validateMapUpdater = (key: string, value: () => string | undefined): void => {
    validateMap.value = {...validateMap.value, [key]: value}
  }

  const validateMapUnlistener = (key: string) => {
    validateMap.value = removeKey(validateMap.value, key)
  }

  const validate = (silent?: boolean, path?: ValidatePath): string | undefined => {
    const messages = Object.keys(validateMap.value)
      .map(key => {
        return compileMessage(
          titleGetter(key),
          validateMap.value[key](
            silent,
            path?.[key] instanceof Object
              ? path[key] as ValidatePath
              : path?.[key] === true
                ? undefined
                : path,
          ),
        )
      })
      .filter(item => item)

    if (!silent) emitIsValid(messages.length === 0)

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
