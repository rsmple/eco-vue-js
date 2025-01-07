import {type Ref} from 'vue'

import {useFormValueMap} from './useFormValueMap'

import {wFormValidateUpdater} from '../models/injection'
import {type ValidatePath, compileMessage} from '../models/utils'

export const useFormValidateMap = (name: Ref<string | undefined>, titleGetter: (key: string) => string, emitIsValid: (value: boolean) => void) => {
  const {map, value, unlistener} = useFormValueMap(
    wFormValidateUpdater,
    name,
    map => (silent?: boolean, path?: ValidatePath): string | undefined => {
      const messages = Object.keys(map.value)
        .map(key => {
          return compileMessage(
            titleGetter(key),
            map.value[key](
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
    },
  )

  return {
    validateMapUnlistener: unlistener,
    validate: value,
    validateMap: map,
  }
}
