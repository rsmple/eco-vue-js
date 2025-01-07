import {type Ref} from 'vue'

import {useFormValueMap} from './useFormValueMap'

import {wFormTitleUpdater} from '../models/injection'

export const useFormTitleMap = (name: Ref<string | undefined>, title: Ref<string | undefined>) => {
  const {map, unlistener} = useFormValueMap(
    wFormTitleUpdater,
    name,
    title,
  )

  const titleGetter = (key: string): string => {
    return map.value[key] ?? ''
  }

  return {
    titleGetter,
    titleMapUnlistener: unlistener,
  }
}
