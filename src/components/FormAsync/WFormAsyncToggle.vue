<template>
  <WToggle
    v-bind="{
      ...props,
      modelValue,
      loading: loading || !data || submitting,
      disabled: !data || isLoadingError || disabled,
    }"
    @update:model-value="showModal"
  >
    <template
      v-if="$slots.title"
      #title
    >
      <slot name="title" />
    </template>
  </WToggle>
</template>

<script lang="ts" setup generic="Model, FieldType extends boolean | null, QueryParams">
import type {FormAsyncToggleProps} from './types'

import WToggle from '@/components/Toggle/WToggle.vue'

import {useFormAsync} from '@/utils/useFormAsync'

const props = withDefaults(
  defineProps<FormAsyncToggleProps<Model, FieldType, QueryParams>>(),
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
