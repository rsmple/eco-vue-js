<template>
  <WInputSuggest
    ref="inputComponent"
    v-bind="{
      ...props,
      modelValue: inputValue,
    }"
    :class="$attrs.class"
    @update:model-value="updateInputValue"
    @close="formatModelValue(modelValue)"
    @keypress:enter="inputComponentRef?.blur()"
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

    <template #content>
      <div
        class="sm-not:w-screen sm-not:px-3 sm:w-96"
        @mousedown.prevent=""
      >
        <WDatePickerSingle
          :model-value="modelValue"
          :title="title"
          :min-date="minDate"
          :max-date="maxDate"
          @update:model-value="$emit('update:model-value', $event); formatModelValue($event)"
        />
      </div>
    </template>
  </WInputSuggest>
</template>

<script lang="ts" setup>
import type {InputDateProps} from './types'

import {ref, useTemplateRef, watch} from 'vue'

import WDatePickerSingle from '@/components/DatePicker/WDatePickerSingle.vue'
import WInputSuggest from '@/components/Input/WInputSuggest.vue'

import {HorizontalAlign} from '@/utils/HorizontalAlign'
import {dateFormat, parseDate} from '@/utils/dateTime'

defineOptions({inheritAttrs: false})

const props = withDefaults(
  defineProps<InputDateProps>(),
  {
    modelValue: undefined,
    maxHeight: 440,
    maxWidth: 480,
    horizontalAlign: HorizontalAlign.RIGHT_INNER,
    minDate: undefined,
    maxDate: undefined,
    readonly: undefined,
    disabled: undefined,
    skeleton: undefined,
  },
)

const emit = defineEmits<{
  (e: 'update:model-value', value: Date | undefined): void
}>()

const inputComponentRef = useTemplateRef('inputComponent')

const inputValue = ref<string>(props.modelValue ? dateFormat(props.modelValue) : '')

const updateInputValue = (value: string) => {
  inputValue.value = value

  const date = parseDate(value)

  if (!date) return

  if (props.minDate && props.minDate > date) {
    emit('update:model-value', props.minDate)
    return
  }

  if (props.maxDate && props.maxDate < date) {
    emit('update:model-value', props.maxDate)
    return
  }

  emit('update:model-value', date)
}

const formatModelValue = (value: Date | undefined) => {
  inputValue.value = value ? dateFormat(value) : ''
}

watch(() => props.modelValue, value => {
  inputValue.value = value ? dateFormat(value) : ''
})
</script>