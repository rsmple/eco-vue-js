<template>
  <WInput
    ref="input"
    v-bind="{
      ...props,
      modelValue: value,
      errorMessage: errorMessageValue ?? errorMessage,
      hasChanges: hasChanges || hasChangesValue,
      allowClear: (!textarea || allowClear) && focused,
      loading: undefined as never,
    }"
    :class="$attrs.class"
    @keypress:enter="handleEnterPress"
    @click="open"
    @blur="props.textSecure || !hasChangesValue ? cancel() : save(); focused = false;"
    @focus="focused = true"
    @paste="handlePaste"
    @update:model-value="value = $event"
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

    <template
      v-if="!skeleton && textSecure && focused"
      #bottom
    >
      <div class="flex justify-end gap-4 pt-5">
        <WButton
          :semantic-type="SemanticType.SECONDARY"
          :disabled="disabled || loading"
          class="basis-32"
          @mousedown.prevent=""
          @click="cancel"
        >
          Cancel
        </WButton>

        <WButton
          :semantic-type="SemanticType.PRIMARY"
          :loading="loading"
          :disabled="disabled"
          class="basis-32"
          @mousedown.prevent=""
          @click="save"
        >
          Save
        </WButton>
      </div>
    </template>

    <template
      v-if="debounce && !hideDebounce"
      #inner
    >
      <div class="absolute inset-x-3 bottom-[calc((var(--w-input-height)-1.75em)/2)] isolate h-0.5">
        <Transition
          enter-active-class="transition-opacity"
          leave-active-class="transition-opacity"
          enter-from-class="opacity-0"
          leave-to-class="opacity-0"
        >
          <div
            v-if="timeout"
            class="absolute inset-0 -z-10 bg-gray-200 dark:bg-gray-700"
          />
        </Transition>

        <Transition
          enter-active-class="transition-[width] ease-linear rounded-sm duration-[var(--debounce-duration)]"
          enter-from-class="w-0"
          enter-to-class="w-full"
          leave-active-class="hidden"
        >
          <div
            v-if="timeout"
            :key="timeout.toString()"
            class="bg-primary dark:bg-primary-dark relative h-full rounded-sm"
            :style="{'--debounce-duration': debounce + 'ms'}"
          />
        </Transition>
      </div>
    </template>
  </WInput>
</template>

<script lang="ts" setup generic="Type extends InputType = 'text'">
import type {InputAsyncProps} from './types'

import {computed, ref, toRef, useTemplateRef, watch} from 'vue'

import WButton from '@/components/Button/WButton.vue'
import WInput from '@/components/Input/WInput.vue'

import {SemanticType} from '@/utils/SemanticType'
import {useComponentStates} from '@/utils/useComponentStates'

type ModelValue = Required<InputAsyncProps<Type>>['modelValue']

defineOptions({inheritAttrs: false})

const props = withDefaults(
  defineProps<InputAsyncProps<Type>>(),
  {
    readonly: undefined,
    disabled: undefined,
    skeleton: undefined,
    unclickable: null,
  },
)

const emit = defineEmits<{
  (e: 'update:model-value', value: ModelValue | undefined): void
}>()

const {isReadonly, isDisabled} = useComponentStates(props)

const focused = ref(false)
const saved = ref(false)
const value = ref<ModelValue | undefined>()
const inputRef = useTemplateRef('input')
const errorMessageValue = ref<string | undefined>()
const hasChangesValue = computed(() => props.modelValue !== value.value)

const timeout = ref<NodeJS.Timeout | null>(null)

const doClearTimeout = () => {
  if (timeout.value) {
    clearTimeout(timeout.value)
    timeout.value = null
  }
}

const reset = () => {
  doClearTimeout()

  value.value = props.modelValue

  focused.value = false
}

const cancel = () => {
  reset()

  inputRef.value?.blur()
}

const save = async () => {
  if (isDisabled.value || isReadonly.value || props.loading) return

  emitUpdateModelValue(value.value)
}

const open = () => {
  if (isDisabled.value || isReadonly.value || props.loading) return

  inputRef.value?.focus()
}

watch(toRef(props, 'modelValue'), modelValue => {
  doClearTimeout()

  value.value = modelValue

  if (!props.placeholderSecure && saved.value) {
    inputRef.value?.blur()

    saved.value = false
  }
}, {immediate: true})

watch(value, (newValue: ModelValue | undefined): void => {
  if (!props.validate) return

  if (props.validate instanceof Array) {
    errorMessageValue.value = props.validate.map(fn => fn(newValue)).filter(item => item).join(', ') || undefined
  } else {
    errorMessageValue.value = props.validate(newValue) || undefined
  }
})

const emitUpdateModelValue = (newValue: ModelValue | undefined) => {
  if (isDisabled.value || isReadonly.value || props.loading) return
  if (errorMessageValue.value) return
  if (props.placeholderSecure) inputRef.value?.blur()

  if (timeout.value) clearTimeout(timeout.value)

  emit('update:model-value', newValue)

  if (!props.placeholderSecure) saved.value = true
}

const handleEnterPress = (event: KeyboardEvent): void => {
  if (props.textarea) return

  doClearTimeout()

  event.stopPropagation()
  event.preventDefault()

  if (value.value !== props.modelValue) emitUpdateModelValue(value.value)
}

const handlePaste = () => {
  doClearTimeout()

  if (!value.value) return

  if (value.value !== props.modelValue) emitUpdateModelValue(value.value)
}

const saveDebounced = () => {
  if (value.value !== props.modelValue) emit('update:model-value', value.value)

  timeout.value = null
}

const updateModelValueDebounced = () => {
  if (timeout.value) clearTimeout(timeout.value)

  if (value.value === props.modelValue) {
    timeout.value = null
    return
  }

  timeout.value = setTimeout(saveDebounced, props.debounce)
}

if (props.debounce) {
  watch(value, updateModelValueDebounced)
}
</script>
