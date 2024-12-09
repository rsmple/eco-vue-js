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
          'bg-gray-400 dark:bg-gray-700': !modelValue || loading,
          'bg-primary-default dark:bg-primary-dark bg-opacity-70 dark:bg-opacity-70': modelValue && !loading,
        }"
      >
        <div
          class="square-6 absolute -top-1 z-10 flex items-center justify-center rounded-full border border-solid shadow-md transition-[right]"
          :class="{
            'right-4': modelValue === false,
            'right-2': modelValue === null,
            'right-0': modelValue === true,
            'w-ripple w-hover-circle': !disabled && !readonly,
            'bg-default border-default dark:border-gray-100 dark:bg-gray-100': !modelValue || loading,
            'bg-primary-default dark:bg-primary-dark border-primary-default dark:border-primary-dark': modelValue && !loading,
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

import WSpinner from '@/components/Spinner/WSpinner.vue'

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

const updateModelValue = () => {
  if (props.disabled || props.loading || props.readonly) return

  if (props.intermediate) {
    emit('update:modelValue', (props.modelValue === null ? true : props.modelValue === false ? null : false) as Value)
  } else {
    emit('update:modelValue', !props.modelValue as Value)
  }
}
</script>
