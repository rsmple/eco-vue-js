import {type Ref, computed} from 'vue'

import {useFormValueMap} from './useFormValueMap'

import {wFormErrorMessageUpdater} from '../models/injection'
import {compileMessage} from '../models/utils'

export const useFormErrorMessageMap = (name: Ref<string | undefined>, titleGetter: (key: string) => string) => {
  const {map, value, unlistener} = useFormValueMap(
    wFormErrorMessageUpdater,
    name,
    map => computed(() => Object.keys(map.value).map(key => compileMessage(titleGetter(key), map.value[key])).filter(item => item).join('\n') || undefined),
  )

  const isValid = computed<boolean>(() => !Object.values(map.value).some(item => item))

  return {
    errorMessageMapUnlistener: unlistener,
    isValid,
    errorMessage: value,
    errorMessageMap: map,
  }
}
