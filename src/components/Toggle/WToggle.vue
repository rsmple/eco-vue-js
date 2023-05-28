<template>
  <div
    class="flex gap-4 w-hover-circle-trigger w-ripple-trigger w-hover-circle-opacity-[0.08] select-none items-center"
    :class="{
      'cursor-not-allowed opacity-70': disabled,
      'cursor-progress': loading,
      'cursor-pointer': !readonly && !loading && !disabled,
      'mt-1 mb-4': !noMargin,
    }"
    @click="!disabled && !loading && !readonly && $emit('update:modelValue', !modelValue)"
  >
    <div
      v-if="title"
      class="font-semibold text-accent flex-1"
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
          'right-4': !modelValue,
          'right-0': modelValue,
          'w-hover-circle w-ripple': !disabled && !readonly,
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
  </div>
</template>

<script lang="ts" setup>
import WSpinner from '@/components/Spinner/WSpinner.vue'

defineProps<{
  modelValue: boolean
  title?: string
  small?: boolean
  disabled?: boolean
  loading?: boolean
  readonly?: boolean
  rightLabel?: boolean
  noMargin?: boolean
}>()

defineEmits<{
  (e: 'update:modelValue', value: boolean): void
}>()

</script>
