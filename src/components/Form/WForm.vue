<template>
  <div>
    <slot />
  </div>
</template>

<script lang="ts" setup>
import {computed, provide, inject, watch, onBeforeUnmount, toRef} from 'vue'
import {wFormUnlistener} from './models/injection'
import {useFormErrorMessageMap} from './use/useFormErrorMessageMap'
import {useFormHasChangesMap} from './use/useFormHasChangesMap'
import {useFormInitModelMap} from './use/useFormInitModelMap'
import {useFormInvalidateMap} from './use/useFormInvalidateMap'
import {useFormTitleMap} from './use/useFormTitleMap'
import {useFormValidateMap} from './use/useFormValidateMap'

const props = defineProps<{
  name?: string
  title?: string
}>()

const emit = defineEmits<{
  (e: 'update:isValid', value: boolean | undefined): void
  (e: 'update:hasChanges', value: boolean): void
}>()

const name = computed(() => props.name)

const {titleGetter, titleMapUnlistener} = useFormTitleMap(name, toRef(props, 'title'))
const {errorMessageMapUnlistener, isValid, errorMessage} = useFormErrorMessageMap(name, titleGetter)
const {hasChangesMapUnlistener, hasChanges} = useFormHasChangesMap(name)
const {validateMapUnlistener, validate} = useFormValidateMap(name, titleGetter, value => emit('update:isValid', value))
const {invalidateMapUnlistener, invalidate} = useFormInvalidateMap(name)
const {initModelMapUnlistener, initModel} = useFormInitModelMap(name)

const unlistener = (key: string) => {
  titleMapUnlistener(key)
  errorMessageMapUnlistener(key)
  hasChangesMapUnlistener(key)
  validateMapUnlistener(key)
  invalidateMapUnlistener(key)
  initModelMapUnlistener(key)
}

provide(wFormUnlistener, unlistener)

const unlistenerInjected = inject(wFormUnlistener, undefined)

watch(isValid, value => emit('update:isValid', value))

watch(hasChanges, value => emit('update:hasChanges', value))

onBeforeUnmount(() => {
  if (props.name) {
    unlistenerInjected?.(props.name)
  }

  emit('update:isValid', undefined)
})

defineExpose({
  isValid,
  validate,
  invalidate,
  initModel,
  errorMessage,
})

</script>
