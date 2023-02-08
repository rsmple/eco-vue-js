import {inject, provide, ref, watch, type Ref} from 'vue'
import {wFormTitleUpdater} from '../models/injection'
import {removeKey} from '../models/utils'

export const useFormTitleMap = (name: Ref<string | undefined>, title: Ref<string | undefined>) => {
  const titleMap = ref<Record<string, string>>({})

  const titleMapUpdater = (key: string, value: string | undefined): void => {
    titleMap.value = !value ? removeKey(titleMap.value, key) : {...titleMap.value, [key]: value}
  }

  const titleMapUnlistener = (key: string) => {
    titleMap.value = removeKey(titleMap.value, key)
  }

  const titleGetter = (key: string) => {
    return titleMap.value[key] ?? key
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
