<template>
  <WSelect
    v-bind="{
      ...props,
      modelValue: modelValue ?? [],
      skeleton: skeleton || !data,
      disabled: disabled || isLoadingError,
      loading: loading || submitting,
      readonly: readonlyInjected || readonly,
    }"
    @select="showModal(getNewValue($event))"
    @unselect="showModal(getNewValue($event))"
  >
    <template
      v-if="$slots.title"
      #title
    >
      <slot name="title" />
    </template>

    <template
      v-if="$slots.subtitle"
      #subtitle
    >
      <slot name="subtitle" />
    </template>
  
    <template
      v-if="$slots.right"
      #right
    >
      <slot name="right" />
    </template>
  </WSelect>
</template>

<script lang="ts" setup generic="Model, FieldType extends string[] | number[], QueryParamsOptions, QueryParams, Data extends DefaultData, OptionComponent extends SelectOptionComponent<Data>">
import type {FormAsyncSelectProps} from './types'
import type {SelectOptionComponent} from '@/components/Select/types'

import WSelect from '@/components/Select/WSelect.vue'

import {useFormAsync} from './use/useFormAsync'

const props = withDefaults(defineProps<FormAsyncSelectProps<Model, FieldType, QueryParamsOptions, QueryParams, Data, OptionComponent>>(), {queryEnabled: undefined})

const emit = defineEmits<{
  (e: 'success', value: Model): void
}>()

const {isLoadingError, data, modelValue, submitting, readonlyInjected, showModal} = useFormAsync(props, value => emit('success', value))

const getNewValue = (value: FieldType[number]): FieldType => {
  const newValue = (modelValue.value?.slice() ?? []) as FieldType[number][]
  const index = newValue.indexOf(value)

  if (index === -1) newValue.push(value)
  else newValue.splice(index, 1)

  return newValue as FieldType
}
</script>