<template>
  <WInput
    ref="input"
    v-bind="{
      ...props,
      modelValue: value,
      disabledActions: (!focused && !hasChangesValue) || disabledActions,
      errorMessage: errorMessageValue ?? errorMessage,
      hasChanges: hasChanges || hasChangesValue,
      allowClear: !textarea || allowClear,
      loading: undefined as never,
    }"
    :class="$attrs.class"
    @keypress:enter="handleEnterPress"
    @click="open"
    @blur="toggle(); focused = false;"
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
      v-if="$slots.subtitle || true"
      #subtitle
    >
      <slot name="subtitle" />
    </template>

    <template
      v-if="(!readonly && !hideButton) || $slots.right"
      #right
    >
      <slot name="right" />

      <WButtonInput
        v-if="!readonly && !hideButton"
        :icon="canSave ? markRaw(IconCheck) : focused ? markRaw(IconSlash) : markRaw(IconEdit)"
        :tooltip-text="!loading && focused ? canSave ? 'Save' : 'Cancel' : undefined"
        :loading="loading"
        :skeleton="skeleton"
        :disabled="disabled"
        :class="{
          'bg-primary dark:bg-primary-dark text-default dark:text-default-dark': canSave,
        }"
        @click="toggle"
      />
    </template>

    <template
      v-if="debounce"
      #inner
    >
      <div class="absolute inset-x-3 bottom-1 isolate h-0.5">
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

import {computed, markRaw, ref, toRef, useTemplateRef, watch} from 'vue'

import WButtonInput from '@/components/Button/WButtonInput.vue'
import WInput from '@/components/Input/WInput.vue'

import IconCheck from '@/assets/icons/default/IconCheck.svg?component'
import IconEdit from '@/assets/icons/sax/IconEdit.svg?component'
import IconSlash from '@/assets/icons/sax/IconSlash.svg?component'

type ModelValue = Required<InputAsyncProps<Type>>['modelValue']

defineOptions({inheritAttrs: false})

const props = defineProps<InputAsyncProps<Type>>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: ModelValue | undefined): void
}>()

const focused = ref(false)
const saved = ref(false)
const value = ref<ModelValue | undefined>()
const inputRef = useTemplateRef('input')
const errorMessageValue = ref<string | undefined>()
const hasChangesValue = computed(() => props.modelValue !== value.value)
const canSave = computed(() => (props.textSecure && focused.value) || hasChangesValue.value)

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

const toggle = async () => {
  if (props.disabled || props.loading) return

  if (canSave.value) {
    emitUpdateModelValue(value.value)
  } else {
    if (focused.value) cancel()
    else open()
  }
}

const open = () => {
  if (props.disabled || props.loading) return

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
  if (props.disabled || props.loading) return
  if (errorMessageValue.value) return
  if (props.placeholderSecure) inputRef.value?.blur()

  emit('update:modelValue', newValue)

  if (!props.placeholderSecure) saved.value = true
}

const handleEnterPress = (event: KeyboardEvent): void => {
  if (props.textarea) return

  doClearTimeout()

  event.stopPropagation()
  event.preventDefault()

  if (canSave.value) emitUpdateModelValue(value.value)
}

const handlePaste = () => {
  doClearTimeout()

  if (!value.value) return

  if (canSave.value) emitUpdateModelValue(value.value)
}

const saveDebounced = () => {
  if (canSave.value) emit('update:modelValue', value.value)

  timeout.value = null
}

const updateModelValueDebounced = () => {
  if (timeout.value) clearTimeout(timeout.value)

  if (!canSave.value) {
    timeout.value = null
    return
  }

  timeout.value = setTimeout(saveDebounced, props.debounce)
}

if (props.debounce) {
  watch(value, updateModelValueDebounced)
}
</script>
