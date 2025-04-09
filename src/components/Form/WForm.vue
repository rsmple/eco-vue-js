<template>
  <component :is="noTag ? WEmptyComponent : 'div'">
    <slot />
  </component>
</template>

<script lang="ts" setup>
import {computed, inject, onBeforeUnmount, provide, toRef, watch} from 'vue'

import WEmptyComponent from '@/components/EmptyComponent/WEmptyComponent.vue'

import {wFormErrorMessageUpdater, wFormHasChangesUpdater, wFormHasShownUpdater, wFormHasValueUpdater, wFormInitModelUpdater, wFormInvalidateUpdater, wFormTitleUpdater, wFormUnlistener, wFormValidateUpdater} from './models/injection'
import {type ValidatePath, compileMessage} from './models/utils'
import {useFormValueMap} from './use/useFormValueMap'

const props = defineProps<{
  name?: string
  title?: string
  noTag?: boolean
}>()

const emit = defineEmits<{
  (e: 'update:is-valid', value: boolean | undefined): void
  (e: 'update:has-changes', value: boolean): void
  (e: 'update:has-value', value: boolean | null): void
  (e: 'update:has-shown', value: boolean): void
}>()

const name = toRef(props, 'name')

const titleMap = useFormValueMap(wFormTitleUpdater, name, toRef(props, 'title'))

const titleGetter = (key: string): string => {
  return titleMap.map.value[key] ?? ''
}

const errorMessageMap = useFormValueMap(
  wFormErrorMessageUpdater,
  name,
  map => computed(() => Object.keys(map.value).map(key => compileMessage(titleGetter(key), map.value[key])).filter(item => item).join('\n') || undefined),
)

const isValid = computed<boolean>(() => !Object.values(errorMessageMap.map.value).some(item => item))

const hasChangesMap = useFormValueMap(
  wFormHasChangesUpdater,
  name,
  map => computed(() => Object.values(map.value).some(value => value)),
)

const hasValueMap = useFormValueMap(
  wFormHasValueUpdater,
  name,
  map => computed(() => {
    const items = Object.values(map.value)
  
    if (items.length === 0) return null
  
    return items.length !== 0 && items.every(value => value)
  }),
)

const hasShownMap = useFormValueMap(
  wFormHasShownUpdater,
  name,
  map => computed(() => Object.values(map.value).some(value => value)),
  false,
)

const validateMap = useFormValueMap(
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
  
    if (!silent) emit('update:is-valid', messages.length === 0)
  
    return messages.length === 0 ? undefined : messages.join('\n')
  },
)

type InvalidatePayload = Record<string, string | string[] | undefined>

const invalidateMap = useFormValueMap(
  wFormInvalidateUpdater,
  name,
  map => (payload: InvalidatePayload): void => {
    const value = name.value ? (payload[name.value] as unknown as InvalidatePayload | undefined ?? payload) : payload
  
    Object.keys(map.value).forEach(key => {
      map.value[key]?.(value)
    })
  },
)

const initModelMap = useFormValueMap(
  wFormInitModelUpdater,
  name,
  map => (): void => {
    Object.keys(map.value).forEach(key => {
      map.value[key]?.()
    })
  },
)

const unlistenerInjected = inject(wFormUnlistener, undefined)

const unlistener = (key: string) => {
  titleMap.unlistener(key)
  errorMessageMap.unlistener(key)
  hasChangesMap.unlistener(key)
  hasValueMap.unlistener(key)
  hasShownMap.unlistener(key)
  validateMap.unlistener(key)
  invalidateMap.unlistener(key)
  initModelMap.unlistener(key)

  if (!props.name) unlistenerInjected?.(key)
}

provide(wFormUnlistener, unlistener)

watch(errorMessageMap.map, () => emit('update:is-valid', isValid.value))

watch(hasChangesMap.value, value => emit('update:has-changes', value))

watch(hasValueMap.value, value => emit('update:has-value', value))

watch(hasShownMap.value, value => emit('update:has-shown', value))

onBeforeUnmount(() => {
  if (props.name) {
    unlistenerInjected?.(props.name)
  }

  emit('update:is-valid', undefined)
})

defineExpose({
  isValid,
  hasChanges: hasChangesMap.value,
  hasChangesMap: hasChangesMap.map,
  hasValue: hasValueMap.value,
  hasValueMap: hasValueMap.map,
  hasShown: hasShownMap.value,
  hasShownMap: hasShownMap.map,
  validate: validateMap.value,
  validateMap: validateMap.map,
  invalidate: invalidateMap.value,
  invalidateMap: invalidateMap.map,
  initModel: initModelMap.value,
  initModelMap: initModelMap.map,
  errorMessage: errorMessageMap.value,
  errorMessageMap: errorMessageMap.map,
})
</script>
