import {type Ref} from 'vue'

import {useFormValueMap} from './useFormValueMap'

import {wFormInitModelUpdater} from '../models/injection'

export const useFormInitModelMap = (name: Ref<string | undefined>) => {
  const {map, value, unlistener} = useFormValueMap(
    wFormInitModelUpdater,
    name,
    map => (): void => {
      Object.keys(map.value).forEach(key => {
        map.value[key]?.()
      })
    },
  )

  return {
    initModelMapUnlistener: unlistener,
    initModel: value,
    initModelMap: map,
  }
}
