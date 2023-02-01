<template>
  <div :class="{'pt-3': !title && !$slots.title?.().length}">
    <WInput
      ref="input"
      v-model="value"
      :title="title"
      :description="description"
      :placeholder="placeholder"
      :readonly="!isEdit"
      :type="type"
      :error-message="errorMessage"
      :skeleton="skeleton"
      :textarea="textarea"
      allow-clear
      class="w-full"
      @keypress:enter="emitUpdateModelValue(value)"
      @click="open"
      @blur="close"
    >
      <template
        v-if="$slots.title?.().length"
        #title
      >
        <slot name="title" />
      </template>

      <template #right>
        <component
          :is="skeleton ? WSkeleton : 'div'"
          class="relative h-11 w-11 min-w-[44px] max-w-[44px] rounded-lg flex items-center justify-center text-description"
          :class="{
            'cursor-not-allowed': disabled || loading,
            'hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer tw-ripple': !disabled && !loading,
          }"
          @click="toggle"
          @mousedown.stop.prevent=""
        >
          <WSpinner v-if="loading" />

          <IconCheck v-else-if="isEdit" />

          <IconEdit v-else />
        </component>
      </template>
    </WInput>
  </div>
</template>

<script lang="ts" setup>
import {nextTick, ref, toRef, watch} from 'vue'
import WInput from '@/components/Input/WInput.vue'
import WSpinner from '@/components/Spinner/WSpinner.vue'
import IconEdit from '@/assets/icons/default/IconEdit.svg?component'
import IconCheck from '@/assets/icons/default/IconCheck.svg?component'
import WSkeleton from '@/components/Skeleton/WSkeleton.vue'

type ValidateFn = (value: string | number | undefined) => string | undefined

const props = defineProps<{
  modelValue?: string | number
  title?: string
  description?: string
  validate?: ValidateFn | ValidateFn[]
  type?: string
  placeholder?: string
  loading?: boolean
  disabled?: boolean
  skeleton?: boolean
  textarea?: boolean
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: string | number | undefined): void
}>()

const value = ref(props.modelValue)
const isEdit = ref(false)
const input = ref<typeof WInput>()
const errorMessage = ref<string | undefined>()

watch(toRef(props, 'modelValue'), modelValue => {
  value.value = modelValue

  isEdit.value = false
})

const toggle = async () => {
  if (props.disabled || props.loading) return

  if (isEdit.value) {
    emitUpdateModelValue(value.value)
  } else {
    isEdit.value = true

    await nextTick()

    input.value?.focus()
  }
}

const close = () => {
  if (!isEdit.value) return

  isEdit.value = false

  value.value = props.modelValue
}

const open = () => {
  if (props.disabled || props.loading) return

  isEdit.value = true
}

watch(value, (newValue: string | number | undefined): void => {
  if (!props.validate) return

  if (props.validate instanceof Array) {
    errorMessage.value = props.validate.map(fn => fn(newValue)).filter(item => item).join(', ') || undefined
  } else {
    errorMessage.value = props.validate(newValue) || undefined
  }
})

const emitUpdateModelValue = async (newValue: string | number | undefined) => {
  if (props.disabled || props.loading) return
  if (errorMessage.value) return
  if (newValue === props.modelValue) {
    isEdit.value = false

    return
  }

  emit('update:modelValue', value.value)
}

</script>
