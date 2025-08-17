<template>
  <WInputAsync
    v-bind="{
      ...props,
      modelValue: (textSecure ? undefined : modelValue) as string & number,
      skeleton: skeleton || !data,
      disabled: disabled || isLoadingError,
      loading: loading || submitting,
      validate: validateFn,
      placeholderSecure: textSecure ? !!modelValue : undefined,
    }"
    @update:model-value="showModal($event as FieldType)"
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

    <template
      v-if="$slots.prefix"
      #prefix="scope"
    >
      <slot
        name="prefix"
        v-bind="scope"
      />
    </template>

    <template
      v-if="$slots.before"
      #before="scope"
    >
      <slot
        name="before"
        v-bind="scope"
      />
    </template>
  </WInputAsync>
</template>

<script lang="ts" setup generic="Model, FieldType extends string | number, QueryParams">
import type {FormAsyncInputProps} from './types'

import {computed} from 'vue'

import WInputAsync from '@/components/Input/WInputAsync.vue'

import {validateRequired} from '@/utils/validate'

import {useFormAsync} from './use/useFormAsync'

const props = withDefaults(
  defineProps<FormAsyncInputProps<Model, FieldType, QueryParams>>(),
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

const validateFn = computed<ValidateFn[]>(() => {
  const result = Array.isArray(props.validate)
    ? props.validate.slice()
    : props.validate
      ? [props.validate]
      : []

  if (props.required && !props.textSecure) result.push(validateRequired)

  return result
})
</script>
