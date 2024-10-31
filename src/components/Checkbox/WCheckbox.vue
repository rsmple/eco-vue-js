<template>
  <button
    ref="element"
    class="flex gap-2 cursor-pointer select-none outline-none w-ripple-trigger w-hover-circle-trigger w-hover-circle-opacity-[0.08]"
    :class="{
      'cursor-progress': loading,
      'cursor-not-allowed opacity-70': disabled,
      'pt-1 pb-4': title,
      'items-start': alignTop,
      'items-center': !alignTop,
    }"
    @click="toggle"
  >
    <div
      class="relative flex justify-center items-center square-6 border border-solid isolate bg-default dark:bg-default-dark"
      :class="{
        'text-default dark:text-default-dark': modelValue && !disabled,
        'text-primary-default dark:text-primary-dark': !modelValue && !disabled,
        'text-gray-300 dark:text-gray-700': !modelValue && disabled,
        'w-ripple w-hover-circle before:text-accent after:text-accent': !disabled && !readonly,
        'rounded-full': radio,
        'rounded-md': !radio,
        'border-gray-300 dark:border-gray-700': disabled,
        'border-primary-default dark:border-primary-dark': !disabled,
      }"
      @keypress.enter.stop.prevent="toggle"
    >
      <Transition
        enter-active-class="transition-[opacity,transform]"
        leave-active-class="transition-[opacity,transform]"
        :enter-from-class="radio ? 'opacity-0 scale-[0.25!important]' : 'opacity-0 scale-[0.50!important]'"
        :leave-to-class="radio ? 'opacity-0 scale-[0.25!important]' : 'opacity-0 scale-[0.50!important]'"
      >
        <div
          v-show="modelValue !== false"
          class="absolute square-full -z-10 transition-[opacity,transform]"
          :class="{
            'scale-[0.33] rounded-full': radio && intermediate && modelValue === null,
            'scale-[0.66] rounded': !radio && intermediate && modelValue === null,
            'scale-[0.66] rounded-full': radio && !(intermediate && modelValue === null),
            'rounded': !radio && !(intermediate && modelValue === null),
            'bg-primary-default dark:bg-primary-dark': !disabled,
            'bg-gray-300 dark:bg-gray-700': disabled,
          }"
        />
      </Transition>

      <WSpinner
        v-if="loading"
        class="w-spinner-size-4"
      />

      <template v-else-if="icon">
        <component
          :is="icon"
          class="square-4"
        />
      </template>

      <IconCheck
        v-else-if="!radio"
        v-show="modelValue"
        class="square-4"
      />

      <WTooltip
        v-if="tooltipText"
        :text="tooltipText"
        :trigger="element"
        no-touch
        class="pointer-events-none"
      />
    </div>

    <div
      v-if="$slots.default?.().length || title"
      class="font-normal text-base text-accent flex items-center gap-1"
    >
      <slot>
        {{ title }}
      </slot>
    </div>
  </button>
</template>

<script lang="ts" setup>
import {ref} from 'vue'
import IconCheck from '@/assets/icons/default/IconCheck.svg?component'
import WTooltip from '@/components/Tooltip/WTooltip.vue'
import WSpinner from '@/components/Spinner/WSpinner.vue'

const props = defineProps<{
  modelValue: boolean | null
  title?: string
  disabled?: boolean
  readonly?: boolean
  icon?: SVGComponent
  radio?: boolean
  loading?: boolean
  intermediate?: boolean
  tooltipText?: string
  allowShift?: boolean
  alignTop?: boolean
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void
  (e: 'update-shift:modelValue', value: boolean): void
}>()

const element = ref<HTMLButtonElement | undefined>()

const toggle = (e: MouseEvent | KeyboardEvent): void => {
  if (props.disabled || props.readonly || props.loading) return

  if (props.allowShift && e.shiftKey) {
    emit('update-shift:modelValue', !props.modelValue)
    return
  } else {
    emit('update:modelValue', !props.modelValue)
  }
}

</script>
