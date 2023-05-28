<template>
  <button
    class="flex gap-2 cursor-pointer select-none outline-none w-ripple-trigger w-hover-circle-trigger items-center w-hover-circle-opacity-[0.08]"
    :class="{
      'cursor-progress': loading,
      'cursor-not-allowed opacity-25': disabled,
      'mt-1 mb-4': title,
    }"
    @click.stop.prevent="toggle"
  >
    <div
      class="relative flex justify-center items-center square-6 border border-solid border-primary-default dark:border-primary-dark text-accent"
      :class="{
        'bg-primary-default dark:bg-primary-dark ': !disabled && value && !radio,
        'rounded-full': radio,
        'rounded-md': !radio,
        'border-gray-300 dark:border-gray-700': disabled,
        'w-ripple w-hover-circle': !disabled && !readonly,
      }"
      @keypress.enter.stop.prevent="toggle"
    >
      <WSpinner
        v-if="loading"
        class="w-spinner-size-4 text-primary-default dark:text-primary-dark"
      />

      <div
        v-else-if="radio"
        v-show="value"
        class="square-4 bg-primary-default dark:bg-primary-dark rounded-full"
      />

      <div
        v-else-if="intermediate && value === null"
        class="square-4 bg-primary-default dark:bg-primary-dark rounded"
      />

      <IconCheck
        v-else
        v-show="value"
        class="square-4 text-default dark:text-default-dark"
      />
    </div>

    <div
      v-if="$slots.default?.().length || title"
      class="font-normal text-base text-accent"
    >
      <slot>
        {{ title }}
      </slot>
    </div>

    <WTooltip
      v-if="tooltipText"
      :text="tooltipText"
      no-touch
      class="pointer-events-none"
    />
  </button>
</template>

<script lang="ts" setup>
import {computed} from 'vue'
import IconCheck from '@/assets/icons/default/IconCheck.svg?component'
import WTooltip from '@/components/Tooltip/WTooltip.vue'
import WSpinner from '@/components/Spinner/WSpinner.vue'

const props = defineProps<{
  modelValue: boolean | null
  title?: string
  disabled?: boolean
  readonly?: boolean
  radio?: boolean
  loading?: boolean
  intermediate?: boolean
  tooltipText?: string
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void
}>()

const value = computed<boolean | null>({
  get: (): boolean | null => props.modelValue,
  set: (value: boolean | null): void => emit('update:modelValue', value === true),
})

const toggle = (): void => {
  if (props.disabled || props.readonly || props.loading) return

  value.value = !value.value
}

</script>
