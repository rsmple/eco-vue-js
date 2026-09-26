<template>
  <WInput
    ref="input"
    v-bind="{
      ...props,
      async: true,
      errorMessage: errorMessageValue ?? errorMessage,
    }"
    :class="$attrs.class"
    @update:model-value="onUpdateModelValue"
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
  </WInput>
</template>

<script lang="ts" setup generic="Type extends InputType = 'text'">
import type {InputAsyncProps} from './types'

import {ref, watch} from 'vue'

import WInput from '@/components/Input/WInput.vue'

type ModelValue = Required<InputAsyncProps<Type>>['modelValue']

defineOptions({inheritAttrs: false})

const props = withDefaults(
  defineProps<InputAsyncProps<Type>>(),
  {
    readonly: undefined,
    disabled: undefined,
    skeleton: undefined,
    unclickable: null,
  },
)

const emit = defineEmits<{
  (e: 'update:model-value', value: NonNullable<ModelValue> | undefined): void
}>()

const errorMessageValue = ref<string | undefined>()

const getErrorMessage = (value: ModelValue | undefined): string | undefined => {
  if (!props.validate) return undefined

  if (props.validate instanceof Array) return props.validate.map(fn => fn(value)).filter(item => item).join(', ') || undefined

  return props.validate(value) || undefined
}

watch(() => props.modelValue, (newValue: ModelValue | undefined): void => {
  errorMessageValue.value = getErrorMessage(newValue)
})

const onUpdateModelValue = (newValue: NonNullable<ModelValue> | undefined) => {
  // Validate the value being saved, not the last accepted one — otherwise one invalid value blocks every later save.
  errorMessageValue.value = getErrorMessage(newValue)

  if (errorMessageValue.value) return

  emit('update:model-value', newValue)
}
</script>
