<template>
  <WSelectStringified
    v-bind="{
      ...props,
      modelValue,
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
  </WSelectStringified>
</template>

<script lang="ts" setup generic="Model, FieldType extends string, QueryParamsOptions, QueryParams, Data extends DefaultData, OptionComponent extends SelectOptionComponent<Data>">
import type {FormAsyncSelectStringifiedProps} from './types'
import type {SelectOptionComponent} from '@/components/Select/types'

import WSelectStringified from '@/components/Select/WSelectStringified.vue'

import {useFormAsync} from '@/utils/useFormAsync'

const props = withDefaults(
  defineProps<FormAsyncSelectStringifiedProps<Model, FieldType, QueryParamsOptions, QueryParams, Data, OptionComponent>>(),
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