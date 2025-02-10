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
    @blur="close"
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

      <template v-if="!readonly && !hideButton">
        <WSkeleton
          v-if="skeleton"
          class="w-skeleton-w-11 w-skeleton-h-11 w-skeleton-rounded-lg"
        />

        <button
          v-else
          class="square-11 bg-default dark:bg-default-dark relative flex items-center justify-center rounded-lg border border-solid border-gray-200 dark:border-gray-800"
          :class="{
            'cursor-not-allowed': disabled,
            'cursor-progress': loading,
            'w-ripple w-ripple-hover': !disabled && !loading,
            'bg-primary-default dark:bg-primary-dark text-default dark:text-default-dark': canSave,
            'text-description': !canSave,
          }"
          @click.stop.prevent="toggle"
          @mousedown.stop.prevent=""
        >
          <WSpinner
            v-if="loading"
            class="w-spinner-size-5"
          />

          <IconCheck v-else-if="canSave" />

          <IconSlash v-else-if="focused" />

          <IconEdit v-else />

          <WTooltip
            v-if="!loading && focused"
            :text="canSave ? 'Save' : 'Cancel'"
          />
        </button>
      </template>
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
            class="bg-primary-default dark:bg-primary-dark relative h-full rounded-sm"
            :style="{'--debounce-duration': debounce + 'ms'}"
          />
        </Transition>
      </div>
    </template>
  </WInput>
</template>

<script lang="ts" setup generic="Type extends InputType = 'text'">
import type {InputAsyncProps} from './types'

import {computed, nextTick, ref, toRef, useTemplateRef, watch} from 'vue'

import WInput from '@/components/Input/WInput.vue'
import WSkeleton from '@/components/Skeleton/WSkeleton.vue'
import WSpinner from '@/components/Spinner/WSpinner.vue'
import WTooltip from '@/components/Tooltip/WTooltip.vue'

import IconCheck from '@/assets/icons/default/IconCheck.svg?component'
import IconEdit from '@/assets/icons/sax/IconEdit.svg?component'
import IconSlash from '@/assets/icons/sax/IconSlash.svg?component'

import {Modal} from '@/utils/Modal'
import {SemanticType} from '@/utils/SemanticType'

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

let closeModal: (() => void) | null = null

const close = () => {
  closeModal?.()

  doClearTimeout()

  if (props.textarea && !props.textSecure && value.value !== props.modelValue) {
    closeModal = Modal.addConfirm({
      title: `Discard changes${ props.title ? ' for ' + props.title : '' }?`,
      description: 'Leaving the form will undo any edits.',
      acceptText: 'Discard',
      intermediateText: 'Save',
      acceptSemanticType: SemanticType.WARNING,
      onAccept: reset,
      onIntermediate: () => {
        emitUpdateModelValue(value.value)

        focused.value = false
      },
    }, () => {
      closeModal = null

      nextTick().then(() => {
        if (focused.value) inputRef.value?.focus()
      })
    })
  } else if (props.debounce) {
    if (canSave.value) emitUpdateModelValue(value.value)
  } else {
    value.value = props.modelValue

    focused.value = false
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
