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
    @keypress:enter="inputComponent?.blur()"
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

    <template #content>
      <div
        class="sm:p-6 sm:w-[28rem] sm-not:w-screen sm-not:px-3"
        @mousedown.prevent=""
      >
        <WDatePickerSingle
          :model-value="modelValue"
          :title="title"
          @update:model-value="$emit('update:model-value', $event); formatModelValue($event)"
        />
      </div>
    </template>
  </WInputSuggest>
</template>

<script lang="ts" setup>
import {ref} from 'vue'
import WDatePickerSingle from '@/components/DatePicker/WDatePickerSingle.vue'
import {dateFormat, parseDate} from '@/utils/dateTime'
import WInputSuggest from '@/components/Input/WInputSuggest.vue'
import {HorizontalAlign} from '@/utils/HorizontalAlign'
import type {InputSuggestProps} from './types'

interface Props extends Omit<InputSuggestProps<'text'>, 'modelValue'> {
  modelValue?: Date | undefined
}

defineOptions({inheritAttrs: false})

const props = withDefaults(
  defineProps<Props>(),
  {
    modelValue: undefined,
    maxHeight: 520,
    maxWidth: 480,
    horizontalAlign: HorizontalAlign.RIGHT_INNER,
  },
)

const emit = defineEmits<{
  (e: 'update:model-value', value: Date | undefined): void
}>()

const inputComponent = ref<ComponentInstance<typeof WInputSuggest<'text'>> | undefined>()

const inputValue = ref<string>(props.modelValue ? dateFormat(props.modelValue) : '')

const updateInputValue = (value: string) => {
  inputValue.value = value

  const date = parseDate(value)

  if (date) emit('update:model-value', date)
}

const formatModelValue = (value: Date | undefined) => {
  inputValue.value = value ? dateFormat(value) : ''
}

</script>