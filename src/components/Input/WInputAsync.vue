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
      v-if="!readonly || $slots.right"
      #right
    >
      <slot name="right" />

      <template v-if="!readonly">
        <WSkeleton
          v-if="skeleton"
          class="square-11 w-skeleton-rounded-lg"
        />

        <button
          v-else
          class="relative square-11 rounded-lg flex items-center justify-center bg-default dark:bg-default-dark border border-solid border-gray-200 dark:border-gray-800"
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
          <WSpinner v-if="loading" />

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
  </WInput>
</template>

<script lang="ts" setup generic="Type extends InputType = 'text'">
import {computed, nextTick, ref, toRef, watch} from 'vue'
import WInput from '@/components/Input/WInput.vue'
import WSpinner from '@/components/Spinner/WSpinner.vue'
import IconEdit from '@/assets/icons/sax/IconEdit.svg?component'
import IconCheck from '@/assets/icons/default/IconCheck.svg?component'
import IconSlash from '@/assets/icons/sax/IconSlash.svg?component'
import WSkeleton from '@/components/Skeleton/WSkeleton.vue'
import {Modal} from '@/utils/Modal'
import {SemanticType} from '@/utils/SemanticType'
import type {InputAsyncProps} from './types'
import WTooltip from '@/components/Tooltip/WTooltip.vue'

type ModelValue = Required<InputAsyncProps<Type>>['modelValue']

defineOptions({inheritAttrs: false})

const props = defineProps<InputAsyncProps<Type>>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: ModelValue | undefined): void
}>()

const focused = ref(false)
const saved = ref(false)
const value = ref<ModelValue | undefined>()
const input = ref<ComponentInstance<typeof WInput<Type>> | undefined>()
const errorMessageValue = ref<string | undefined>()
const hasChangesValue = computed(() => props.modelValue !== value.value)
const canSave = computed(() => (props.textSecure && focused.value) || hasChangesValue.value)

const reset = () => {
  value.value = props.modelValue

  focused.value = false
}

const cancel = () => {
  reset()

  input.value?.blur()
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

  if (props.textarea && !props.textSecure && value.value !== props.modelValue) {
    closeModal = Modal.addConfirm({
      title: `Discard changes${props.title ? ' for ' + props.title : ''}?`,
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
        if (focused.value) input.value?.focus()
      })
    })
  } else {
    value.value = props.modelValue

    focused.value = false
  }
}

const open = () => {
  if (props.disabled || props.loading) return

  input.value?.focus()
}

watch(toRef(props, 'modelValue'), modelValue => {
  value.value = modelValue

  if (!props.placeholderSecure && saved.value) {
    input.value?.blur()

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
  if (props.placeholderSecure) input.value?.blur()

  emit('update:modelValue', newValue)

  if (!props.placeholderSecure) saved.value = true
}

const handleEnterPress = (event: KeyboardEvent): void => {
  if (props.textarea) return

  event.stopPropagation()
  event.preventDefault()

  emitUpdateModelValue(value.value)
}

const handlePaste = () => {
  if (!value.value) return

  if (hasChangesValue.value || (props.textSecure && focused.value)) {
    emitUpdateModelValue(value.value)
  }
}

</script>
