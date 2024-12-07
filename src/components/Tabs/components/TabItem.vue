<template>
  <WForm
    v-if="!removable || active"
    v-show="active"
    ref="form"
    :name="name"
    :title="title"
    @update:is-valid="$event === false && $emit('tab:switch', name)"
  >
    <slot />
  </WForm>
</template>

<script lang="ts" setup>
import {computed, nextTick, useTemplateRef, watch} from 'vue'

import WForm from '@/components/Form/WForm.vue'

import {useTabItemActiveListener} from '../use/useTabItemActiveListener'

const props = defineProps<{
  name: string
  title: string
  active: boolean
  removable: boolean
}>()

const emit = defineEmits<{
  (e: 'tab:switch', value: string): void
  (e: 'update:height', value: number): void
  (e: 'update:active'): void
}>()

const {callListeners} = useTabItemActiveListener()

const formRef = useTemplateRef('form')

const isValid = computed<boolean>(() => formRef.value?.isValid ?? true)
const hasChanges = computed<boolean>(() => formRef.value?.hasChanges ?? false)
const hasValue = computed<boolean | null>(() => formRef.value?.hasValue ?? null)
const errorMessage = computed<string | undefined>(() => formRef.value?.errorMessage)

const validate: ComponentInstance<typeof WForm>['validate'] = (...args) => formRef.value?.validate(...args)
const invalidate: ComponentInstance<typeof WForm>['invalidate'] = (...args) => formRef.value?.invalidate(...args)
const initModel: ComponentInstance<typeof WForm>['initModel'] = () => formRef.value?.initModel()

const emitHeight = (): void => {
  if (!formRef.value) return

  emit('update:height', formRef.value.$el.offsetHeight)
}

watch(() => props.active, async value => {
  if (value) emit('update:active')

  if (value) await nextTick()

  emitHeight()

  if (value) callListeners()
}, {immediate: true})

defineExpose({
  emitHeight,
  isValid,
  hasChanges,
  hasValue,
  errorMessage,
  validate,
  invalidate,
  initModel,
})
</script>