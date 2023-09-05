<template>
  <WInputSuggest
    ref="inputComponent"
    :model-value="inputValue"
    :title="title"
    :horizontal-align="HorizontalAlign.RIGHT_INNER"
    :content-max-height="520"
    :content-max-width="480"
    @update:model-value="updateInputValue"
    @close="formatModelValue"
    @keypress:enter="inputComponent?.blur()"
  >
    <template #content>
      <div
        class="sm:p-6 sm:w-[28rem] sm-not:w-screen sm-not:px-3"
        @mousedown.prevent=""
      >
        <WDatePickerSingle
          :model-value="modelValue"
          :title="title"
          @update:model-value="$emit('update:model-value', $event)"
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

const props = defineProps<{
  title?: string
  modelValue?: Date | undefined
}>()

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

const formatModelValue = () => {
  inputValue.value = props.modelValue ? dateFormat(props.modelValue) : ''
}

</script>