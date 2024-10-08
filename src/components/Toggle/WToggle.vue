<template>
  <div
    :class="{
      'mt-1 mb-4': !noMargin,
      [typeof $attrs.class === 'string' ? $attrs.class : '']: true,
    }"
  >
    <button
      class="grid gap-4 w-ripple-trigger w-hover-circle-trigger w-hover-circle-opacity-[0.08] select-none items-center w-full text-start focus:outline-none"
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
        class="font-semibold text-accent"
        :class="{
          'order-1': rightLabel,
          'text-xs': small,
          'text-base': !small,
        }"
      >
        {{ title }}
      </div>

      <div
        class="relative h-4 w-10 max-w-10 min-w-10 my-4 rounded-lg"
        :class="{
          'bg-gray-400 dark:bg-gray-700': !modelValue || loading,
          'bg-primary-default dark:bg-primary-dark bg-opacity-70 dark:bg-opacity-70': modelValue && !loading,
        }"
      >
        <div
          class="absolute square-6 -top-1 rounded-full transition-all"
          :class="{
            'right-4': modelValue === false,
            'right-2': modelValue === null,
            'right-0': modelValue === true,
            'w-ripple w-hover-circle': !disabled && !readonly,
          }"
        >
          <div
            class="h-full w-full rounded-full shadow-md z-10 flex items-center justify-center text-description"
            :class="{
              'bg-default dark:bg-gray-100': !modelValue || loading,
              'bg-primary-default dark:bg-primary-dark': modelValue && !loading,
            }"
          >
            <WSpinner
              v-if="loading"
              class="[--spinner-size:1.25rem]"
            />
          </div>
        </div>
      </div>
    </button>

    <div
      v-if="description"
      class="text-xs font-normal text-description whitespace-pre-wrap break-words"
    >
      {{ description }}
    </div>
  </div>
</template>

<script lang="ts" setup generic="Value extends boolean | null = boolean">
import WSpinner from '@/components/Spinner/WSpinner.vue'
import type {ToggleProps} from './types'

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
