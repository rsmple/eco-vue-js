import {type Ref, computed} from 'vue'

import {useFormValueMap} from './useFormValueMap'

import {wFormHasValueUpdater} from '../models/injection'

export const useFormHasValueMap = (name: Ref<string | undefined>) => {
  const {map, value, unlistener} = useFormValueMap(
    wFormHasValueUpdater,
    name,
    map => computed(() => {
      const items = Object.values(map.value)
  
      if (items.length === 0) return null
  
      return items.length !== 0 && items.every(value => value)
    }),
  )

  return {
    hasValueMapUnlistener: unlistener,
    hasValue: value,
    hasValueMap: map,
  }
}
