<template>
  <WSelectAsyncSingle
    v-bind="{
      ...props,
      modelValue: modelValue,
      skeleton: skeleton || !data,
      disabled: disabled || isLoadingError,
      loading: loading || submitting,
    }"
    @update:model-value="showModal(($event ?? null) as FieldType)"
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
  </WSelectAsyncSingle>
</template>

<script lang="ts" setup generic="Model, FieldType extends string | number, QueryParamsOptions, QueryParams, Data extends DefaultData, OptionComponent extends SelectOptionComponent<Data>, AllowClear extends boolean = false">
import type {FormAsyncSelectInfiniteSingleProps} from './types'
import type {SelectOptionComponent} from '@/components/Select/types'

import WSelectAsyncSingle from '@/components/Select/WSelectAsyncSingle.vue'

import {useFormAsync} from './use/useFormAsync'

const props = withDefaults(
  defineProps<FormAsyncSelectInfiniteSingleProps<Model, FieldType, QueryParamsOptions, QueryParams, Data, OptionComponent, AllowClear>>(),
  {
    queryEnabled: undefined,
    readonly: undefined,
    disabled: undefined,
    skeleton: undefined,
  },
)

const emit = defineEmits<{
  (e: 'success', value: Model): void
}>()

const {isLoadingError, data, modelValue, submitting, showModal} = useFormAsync(props, value => emit('success', value))
</script>