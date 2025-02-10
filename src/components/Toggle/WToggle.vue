<template>
  <div
    :class="{
      'mb-4 mt-1': !noMargin,
      [typeof $attrs.class === 'string' ? $attrs.class : '']: true,
    }"
  >
    <button
      class="w-ripple-trigger w-hover-circle-trigger w-hover-circle-opacity-[0.08] isolate grid w-full select-none items-center gap-4 text-start focus:outline-none"
      :class="{
        'cursor-not-allowed opacity-50': disabled,
        'cursor-progress': loading,
        'cursor-pointer': !readonly && !loading && !disabled,
        'grid-cols-[1fr,auto]': !rightLabel,
        'grid-cols-[auto,1fr]': rightLabel,
      }"
      :disabled="disabled"
      @click="updateModelValue"
    >
      <div
        v-if="title"
        class="text-accent font-semibold"
        :class="{
          'order-1': rightLabel,
          'text-xs': small,
          'text-base': !small,
        }"
      >
        {{ title }}
      </div>

      <div
        class="relative my-4 h-4 w-10 min-w-10 max-w-10 rounded-lg"
        :class="{
          'bg-gray-400 dark:bg-gray-700': !value || loading,
          'bg-primary-default dark:bg-primary-dark bg-opacity-70 dark:bg-opacity-70': value && !loading,
        }"
      >
        <div
          class="square-6 absolute -top-1 z-10 flex items-center justify-center rounded-full border border-solid shadow-md transition-[right]"
          :class="{
            'right-4': value === false,
            'right-2': value === null,
            'right-0': value === true,
            'w-ripple w-hover-circle': !disabled && !readonly,
            'bg-default border-default dark:border-gray-100 dark:bg-gray-100': !value || loading,
            'bg-primary-default dark:bg-primary-dark border-primary-default dark:border-primary-dark': value && !loading,
          }"
        >
          <WSpinner
            v-if="loading"
            class="text-description [--spinner-size:1.25rem]"
          />
        </div>
      </div>
    </button>

    <div
      v-if="description"
      class="text-description whitespace-pre-wrap break-words text-xs font-normal"
    >
      {{ description }}
    </div>
  </div>
</template>

<script lang="ts" setup generic="Value extends boolean | null = boolean">
import type {ToggleProps} from './types'

import {computed} from 'vue'

import WSpinner from '@/components/Spinner/WSpinner.vue'

import {Notify} from '@/utils/Notify'

defineOptions({inheritAttrs: false})

const props = withDefaults(
  defineProps<ToggleProps<Value>>(),
  {
    description: undefined,
    title: undefined,
    intermediate: false as unknown as undefined,
  },
)

const emit = defineEmits<{
  (e: 'update:modelValue', value: Value): void
}>()

const value = computed<boolean | null>({
  get: () => {
    if (props.modelValue === null) return null

    if (props.negate) return !props.modelValue

    return props.modelValue
  },
  set: value => {
    if (props.disabled || props.loading || props.readonly) return

    const newValue = (value === null ? null : props.negate ? !value : value) as Value

    const errorMessage = Array.isArray(props.validate)
      ? props.validate.map(item => item(newValue)).join(', ')
      : props.validate?.(newValue)

    if (errorMessage) {
      Notify.warn({
        title: 'Error',
        caption: errorMessage,
      })

      return
    }

    emit('update:modelValue', newValue)
  },
})

const updateModelValue = () => {
  if (props.intermediate) {
    value.value = value.value === null ? true : value.value === false ? null : false
  } else {
    value.value = !value.value
  }
}
</script>
