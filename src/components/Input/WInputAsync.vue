<template>
  <div :class="{'pt-3': !title && !$slots.title?.().length}">
    <WInput
      ref="input"
      v-model="value"
      :title="title"
      :description="description"
      :placeholder="placeholder"
      :disabled-actions="!focused && !hasChanges"
      :type="(type as Type | undefined)"
      :error-message="errorMessage"
      :skeleton="skeleton"
      :textarea="textarea"
      :name="name"
      :mono="mono"
      :text-secure="textSecure"
      :placeholder-secure="placeholderSecure"
      :max-length="maxLength"
      :has-changes="hasChanges"
      :disabled="disabled"
      allow-clear
      class="w-full"
      @keypress:enter.stop.prevent="emitUpdateModelValue(value)"
      @click="open"
      @blur="close(); focused = false"
      @focus="focused = true"
    >
      <template
        v-if="$slots.title?.().length"
        #title
      >
        <slot name="title" />
      </template>

      <template #right>
        <WSkeleton
          v-if="skeleton"
          class="square-11 w-skeleton-rounded-lg"
        />

        <button
          v-else
          class="relative square-11 rounded-lg flex items-center justify-center text-description"
          :class="{
            'cursor-not-allowed': disabled,
            'cursor-progress': loading,
            'w-ripple w-ripple-hover': !disabled && !loading,
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
import {computed, ref, toRef, watch} from 'vue'
import WInput from '@/components/Input/WInput.vue'
import WSpinner from '@/components/Spinner/WSpinner.vue'
import IconEdit from '@/assets/icons/default/IconEdit.svg?component'
import IconCheck from '@/assets/icons/default/IconCheck.svg?component'
import WSkeleton from '@/components/Skeleton/WSkeleton.vue'

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
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: ModelValue | undefined): void
}>()

const focused = ref(false)
const value = ref<ModelValue | undefined>()
const input = ref<ComponentInstance<typeof WInput<Type>> | undefined>()
const errorMessage = ref<string | undefined>()
const hasChanges = computed(() => props.modelValue !== value.value)

const toggle = async () => {
  if (props.disabled || props.loading) return

  if (hasChanges.value) {
    emitUpdateModelValue(value.value)
  } else {
    open()
  }
}

const close = () => {
  value.value = props.modelValue
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
    errorMessage.value = props.validate.map(fn => fn(newValue)).filter(item => item).join(', ') || undefined
  } else {
    errorMessage.value = props.validate(newValue) || undefined
  }
})

const emitUpdateModelValue = (newValue: ModelValue | undefined) => {
  if (props.disabled || props.loading) return
  if (errorMessage.value) return
  if (props.placeholderSecure) input.value?.blur()

  emit('update:modelValue', newValue)
}

</script>
