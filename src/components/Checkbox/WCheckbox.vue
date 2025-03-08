<template>
  <button
    ref="element"
    v-bind="{class: $attrs.class, style: $attrs.style as StyleValue}"
    class="w-ripple-trigger w-hover-circle-trigger w-hover-circle-opacity-[0.08] flex cursor-pointer select-none gap-2 outline-none"
    :class="{
      'cursor-progress': loading,
      'cursor-not-allowed opacity-70': disabled,
      'pb-4 pt-1': title,
      'items-start': alignTop,
      'items-center': !alignTop,
    }"
    @click="toggle"
  >
    <div
      class="square-[1.5em] bg-default dark:bg-default-dark relative isolate flex items-center justify-center border border-solid [font-size:--w-checkbox-size]"
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
          class="square-full absolute -z-10 transition-[opacity,transform]"
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
        class="w-spinner-size-[1em]"
      />

      <template v-else-if="icon">
        <component
          :is="icon"
          class="square-[1em]"
        />
      </template>

      <IconCheck
        v-else-if="!radio"
        v-show="modelValue"
        class="square-[1em]"
      />

      <WTooltip
        v-if="tooltipText && !disabled"
        :text="tooltipText"
        :trigger="(elementRef as HTMLButtonElement)"
        no-touch
        class="pointer-events-none"
      />
    </div>

    <div
      v-if="$slots.default || title"
      class="text-accent flex items-center gap-1"
    >
      <slot>
        {{ title }}
      </slot>
    </div>
  </button>
</template>

<script lang="ts" setup>
import type {CheckboxProps} from './types'

import {type StyleValue, useTemplateRef} from 'vue'

import WSpinner from '@/components/Spinner/WSpinner.vue'
import WTooltip from '@/components/Tooltip/WTooltip.vue'

import IconCheck from '@/assets/icons/default/IconCheck.svg?component'

defineOptions({inheritAttrs: false})

const props = defineProps<CheckboxProps>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void
}>()

const elementRef = useTemplateRef('element')

const toggle = (): void => {
  if (props.disabled || props.readonly || props.loading) return

  emit('update:modelValue', !props.modelValue)
}
</script>
