import {type Ref, inject, provide, ref, watch} from 'vue'

import {wFormTitleUpdater} from '../models/injection'

export const useFormTitleMap = (name: Ref<string | undefined>, title: Ref<string | undefined>) => {
  const titleMap = ref<Record<string, string>>({})

  const titleMapUpdater = (key: string, value: string | undefined): void => {
    if (!value) titleMapUnlistener(key)
    else titleMap.value[key] = value

    if (!name.value) titleUpdaterInjected?.(key, value)
  }

  const titleMapUnlistener = (key: string) => {
    if (key in titleMap.value) delete titleMap.value[key]
  }

  const titleGetter = (key: string) => {
    return titleMap.value[key]
  }

  provide(wFormTitleUpdater, titleMapUpdater)

  const titleUpdaterInjected = inject(wFormTitleUpdater, undefined)

  watch(title, value => {
    if (name.value) {
      titleUpdaterInjected?.(name.value, value)
    }
  }, {immediate: true})

  return {
    titleGetter,
    titleMapUnlistener,
  }
}
