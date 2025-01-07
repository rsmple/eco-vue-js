<template>
  <component :is="noTag ? WEmptyComponent : 'div'">
    <slot />
  </component>
</template>

<script lang="ts" setup>
import {inject, onBeforeUnmount, provide, toRef, watch} from 'vue'

import WEmptyComponent from '@/components/EmptyComponent/WEmptyComponent.vue'

import {wFormUnlistener} from './models/injection'
import {useFormErrorMessageMap} from './use/useFormErrorMessageMap'
import {useFormHasChangesMap} from './use/useFormHasChangesMap'
import {useFormHasValueMap} from './use/useFormHasValueMap'
import {useFormInitModelMap} from './use/useFormInitModelMap'
import {useFormInvalidateMap} from './use/useFormInvalidateMap'
import {useFormTitleMap} from './use/useFormTitleMap'
import {useFormValidateMap} from './use/useFormValidateMap'

const props = defineProps<{
  name?: string
  title?: string
  noTag?: boolean
}>()

const emit = defineEmits<{
  (e: 'update:is-valid', value: boolean | undefined): void
  (e: 'update:has-changes', value: boolean): void
  (e: 'update:has-value', value: boolean | null): void
}>()

const name = toRef(props, 'name')

const {titleGetter, titleMapUnlistener} = useFormTitleMap(name, toRef(props, 'title'))
const {errorMessageMapUnlistener, isValid, errorMessage, errorMessageMap} = useFormErrorMessageMap(name, titleGetter)
const {hasChangesMapUnlistener, hasChanges, hasChangesMap} = useFormHasChangesMap(name)
const {hasValueMapUnlistener, hasValue, hasValueMap} = useFormHasValueMap(name)
const {validateMapUnlistener, validate, validateMap} = useFormValidateMap(name, titleGetter, value => emit('update:is-valid', value))
const {invalidateMapUnlistener, invalidate, invalidateMap} = useFormInvalidateMap(name)
const {initModelMapUnlistener, initModel, initModelMap} = useFormInitModelMap(name)

const unlistener = (key: string) => {
  titleMapUnlistener(key)
  errorMessageMapUnlistener(key)
  hasChangesMapUnlistener(key)
  hasValueMapUnlistener(key)
  validateMapUnlistener(key)
  invalidateMapUnlistener(key)
  initModelMapUnlistener(key)
}

provide(wFormUnlistener, unlistener)

const unlistenerInjected = inject(wFormUnlistener, undefined)

watch(errorMessageMap, () => emit('update:is-valid', isValid.value))

watch(hasChanges, value => emit('update:has-changes', value))

watch(hasValue, value => emit('update:has-value', value))

onBeforeUnmount(() => {
  if (props.name) {
    unlistenerInjected?.(props.name)
  }

  emit('update:is-valid', undefined)
})

defineExpose({
  isValid,
  hasChanges,
  hasChangesMap,
  hasValue,
  hasValueMap,
  validate,
  validateMap,
  invalidate,
  invalidateMap,
  initModel,
  initModelMap,
  errorMessage,
  errorMessageMap,
})
</script>
