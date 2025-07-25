<template>
  <WButtonGroup
    v-bind="{
      ...props,
      modelValue: modelValue as FieldType,
      list: list as (FieldType)[],
      optionComponent: optionComponent as ButtonGroupOptionComponent<FieldType> | undefined,
      loading: loading || submitting,
      disabled: disabled || isLoadingError,
      skeleton: skeleton || !data,
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
      v-if="$slots.option"
      #option="{option, selected}"
    >
      <slot
        name="option"
        :option="option"
        :selected="selected"
      />
    </template>
  </WButtonGroup>
</template>

<script lang="ts" setup generic="Model, FieldType extends string | number | boolean | null, QueryParams, Entity extends Record<string, unknown>, ValueGetter extends {fn(value: Entity): FieldType}['fn'] | undefined = undefined">
import type {FormAsyncButtonGroupProps} from './types'
import type {ButtonGroupOptionComponent} from '../Button/types'

import WButtonGroup from '@/components/Button/WButtonGroup.vue'

import {useFormAsync} from './use/useFormAsync'

const props = withDefaults(
  defineProps<FormAsyncButtonGroupProps<Model, FieldType, QueryParams, Entity, ValueGetter>>(),
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