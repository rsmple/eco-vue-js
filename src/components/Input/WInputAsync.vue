<template>
  <div :class="{'pt-3': !title && !$slots.title?.().length}">
    <WInput
      ref="input"
      v-model="value"
      :title="title"
      :description="description"
      :placeholder="placeholder"
      :disabled-actions="!focused && !hasChangesValue"
      :type="(type as Type | undefined)"
      :error-message="errorMessageValue ?? errorMessage"
      :skeleton="skeleton"
      :textarea="textarea"
      :name="name"
      :mono="mono"
      :text-secure="textSecure"
      :placeholder-secure="placeholderSecure"
      :max-length="maxLength"
      :has-changes="hasChanges || hasChangesValue"
      :disabled="disabled"
      :required="required"
      :no-margin="noMargin"
      :allow-clear="!textarea"
      :resize="resize"
      :allow-paste="allowPaste"
      class="w-full"
      @keypress:enter="handleEnterPress"
      @click="open"
      @blur="close"
      @focus="focused = true"
    >
      <template
        v-if="$slots.title?.().length"
        #title
      >
        <slot name="title" />
      </template>

      <template #right>
        <slot name="right" />

        <WSkeleton
          v-if="skeleton"
          class="square-11 w-skeleton-rounded-lg"
        />

        <button
          v-else
          class="relative square-11 rounded-lg flex items-center justify-center"
          :class="{
            'cursor-not-allowed': disabled,
            'cursor-progress': loading,
            'w-ripple w-ripple-hover': !disabled && !loading,
            'bg-primary-default dark:bg-primary-dark text-default dark:text-default-dark': focused,
            'text-description': !focused,
          }"
          @click="toggle"
          @mousedown.stop.prevent=""
        >
          <WSpinner v-if="loading" />

          <IconCheck v-else-if="hasChanges || focused" />

          <IconEdit v-else />
        </button>
      </template>
    </WInput>
  </div>
</template>

<script lang="ts" setup generic="Type extends InputType = 'text'">
import {computed, nextTick, ref, toRef, watch} from 'vue'
import WInput from '@/components/Input/WInput.vue'
import WSpinner from '@/components/Spinner/WSpinner.vue'
import IconEdit from '@/assets/icons/default/IconEdit.svg?component'
import IconCheck from '@/assets/icons/default/IconCheck.svg?component'
import WSkeleton from '@/components/Skeleton/WSkeleton.vue'
import {Modal} from '@/utils/Modal'
import {SemanticType} from '@/utils/SemanticType'

type ModelValue = Type extends 'number' ? number : string

const props = defineProps<{
  modelValue?: ModelValue | undefined
  title?: string
  description?: string
  validate?: ValidateFn | ValidateFn[]
  type?: Type
  placeholder?: string
  loading?: boolean
  disabled?: boolean
  skeleton?: boolean
  textarea?: boolean
  name?: string
  mono?: boolean
  textSecure?: boolean
  placeholderSecure?: boolean
  maxLength?: number
  required?: boolean
  hasChanges?: boolean
  errorMessage?: string
  noMargin?: boolean
  resize?: boolean
  allowPaste?: boolean
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: ModelValue | undefined): void
}>()

const focused = ref(false)
const value = ref<ModelValue | undefined>()
const input = ref<ComponentInstance<typeof WInput<Type>> | undefined>()
const errorMessageValue = ref<string | undefined>()
const hasChangesValue = computed(() => props.modelValue !== value.value)

const toggle = async () => {
  if (props.disabled || props.loading) return

  if (hasChangesValue.value || (props.textSecure && focused.value)) {
    emitUpdateModelValue(value.value)
  } else {
    open()
  }
}

let closeModal: (() => void) | null = null

const close = () => {
  closeModal?.()

  if (props.textarea && value.value !== props.modelValue) {
    closeModal = Modal.addConfirm({
      title: `Discard changes${props.title ? ' for ' + props.title : ''}?`,
      description: 'Leaving the form will undo any edits.',
      acceptText: 'Discard',
      acceptSemanticType: SemanticType.WARNING,
      onAccept: () => {
        value.value = props.modelValue

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
}

const handleEnterPress = (event: KeyboardEvent): void => {
  if (props.textarea) return

  event.stopPropagation()
  event.preventDefault()

  emitUpdateModelValue(value.value)
}

</script>
