<template>
  <div
    :class="{
      'mb-4 mt-1': !noMargin,
      [typeof $attrs.class === 'string' ? $attrs.class : '']: true,
    }"
  >
    <button
      class="w-ripple-trigger isolate grid w-full items-center text-start focus:outline-none"
      :class="{
        'cursor-not-allowed opacity-50': disabled,
        'cursor-progress': loading,
        'cursor-pointer': !readonly && !loading && !disabled,
        'cursor-auto select-text': readonly,
        'select-none': !readonly,
        'grid-cols-[1fr,auto]': (title || $slots.title) && !rightLabel,
        'grid-cols-[auto,1fr]': (title || $slots.title) && rightLabel,
        'gap-4': title || $slots.title,
        'justify-center': center,
      }"
      :disabled="disabled || readonly"
      @click="updateModelValue"
    >
      <div
        v-if="title || $slots.title"
        class="text-accent font-semibold"
        :class="{
          'order-1': rightLabel,
          'text-xs': small,
          'text-base': !small,
        }"
      >
        <slot name="title">
          {{ title }}
        </slot>
      </div>

      <div class="-h--w-input-height py-0.75">
        <div
          class="width-10 p-0.75 h-full rounded-full bg-[200%_auto] [background-position:right]"
          :class="{
            'bg-gray-300 dark:bg-gray-700': !value || loading,
            [semanticTypeBackgroundMap[SemanticType.PRIMARY]]: value && !loading,
          }"
        >
          <div class="relative grid size-full grid-cols-3">
            <div
              class="bg-default text-primary dark:text-primary-dark absolute z-10 flex aspect-square h-full items-center justify-center rounded-full shadow-md transition-[right]"
              :class="{
                'right-[calc(100%-1.25rem)]': value === false,
                'right-[calc(50%-0.625rem)]': value === null,
                'right-0': value === true,
                'w-ripple w-ripple-hover': !disabled && !readonly,
              }"
            >
              <WSpinner
                v-if="loading"
                class="text-description w-spinner-size-5"
              />

              <component
                :is="icon"
                v-else-if="icon"
                class="square-4"
              />
            </div>
          </div>
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
import {SemanticType, useSemanticTypeBackgroundMap} from '@/utils/SemanticType'

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

const semanticTypeBackgroundMap = useSemanticTypeBackgroundMap()

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
