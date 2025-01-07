import {type Ref, computed} from 'vue'

import {useFormValueMap} from './useFormValueMap'

import {wFormHasChangesUpdater} from '../models/injection'

export const useFormHasChangesMap = (name: Ref<string | undefined>) => {
  const {map, value, unlistener} = useFormValueMap(
    wFormHasChangesUpdater,
    name,
    map => computed(() => Object.values(map.value).some(value => value)),
  )

  return {
    hasChangesMapUnlistener: unlistener,
    hasChanges: value,
    hasChangesMap: map,
  }
}
