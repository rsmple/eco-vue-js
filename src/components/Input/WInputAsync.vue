<template>
  <WInput
    ref="input"
    v-bind="{
      ...props,
      clearValue: getClearValue(),
      async: true,
      errorMessage: errorMessageValue ?? errorMessage,
    }"
    :class="$attrs.class"
    @update:model-value="onUpdateModelValue"
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

    <template
      v-if="$slots.prefix"
      #prefix="scope"
    >
      <slot
        name="prefix"
        v-bind="scope"
      />
    </template>

    <template
      v-if="$slots.before"
      #before="scope"
    >
      <slot
        name="before"
        v-bind="scope"
      />
    </template>
  </WInput>
</template>

<script lang="ts" setup generic="Type extends InputType = 'text', ClearValue extends InputClearValue = ''">
import type {InputAsyncProps, InputClearValue} from './types'

import {ref, watch} from 'vue'

import WInput from '@/components/Input/WInput.vue'

import {useClearValue} from '@/utils/useClearValue'

type ModelValue = Required<InputAsyncProps<Type>>['modelValue']
type EmitType = NonNullable<ModelValue> | Extract<ClearValue, null> | undefined

defineOptions({inheritAttrs: false})

const props = withDefaults(
  defineProps<InputAsyncProps<Type, ClearValue>>(),
  {
    readonly: undefined,
    disabled: undefined,
    skeleton: undefined,
    unclickable: null,
  },
)

const getClearValue = useClearValue(props, '')

const emit = defineEmits<{
  /** The saved value — on Enter, blur, `debounce` or Save — once it passes `validate`. */
  (e: 'update:model-value', value: EmitType): void
}>()

defineSlots<{
  /** Replaces the `title` text. */
  title?: () => void
  /** Content between the title and the field. */
  subtitle?: () => void
  /** Content to the right of the field. */
  right?: () => void
  /** Content before the text inside the field, such as chips. Also shown while readonly. */
  prefix?: (props: {modelValue: ModelValue | undefined}) => void
  /** Content right before the text, in the same box as the input. */
  before?: (props: {modelValue: ModelValue | undefined, focused: boolean}) => void
}>()

const errorMessageValue = ref<string | undefined>()

const getErrorMessage = (value: ModelValue | undefined): string | undefined => {
  if (!props.validate) return undefined

  if (props.validate instanceof Array) return props.validate.map(fn => fn(value)).filter(item => item).join(', ') || undefined

  return props.validate(value) || undefined
}

watch(() => props.modelValue, (newValue: ModelValue | undefined): void => {
  errorMessageValue.value = getErrorMessage(newValue)
})

const onUpdateModelValue = (newValue: EmitType) => {
  // Validate the value being saved, not the last accepted one — otherwise one invalid value blocks every later save.
  errorMessageValue.value = getErrorMessage(newValue)

  if (errorMessageValue.value) return

  emit('update:model-value', newValue)
}
</script>
