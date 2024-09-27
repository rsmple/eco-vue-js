<template>
  <WInputAsync
    v-bind="{
      ...props,
      modelValue: (textSecure ? undefined : modelValue) as string & number,
      skeleton: skeleton || !data,
      disabled: disabled || isLoadingError,
      loading: loading || submitting,
      validate: validateFn,
      placeholderSecure: textSecure ? !!modelValue : undefined,
    }"
    @update:model-value="showModal($event as FieldType)"
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
  </WInputAsync>
</template>

<script lang="ts" setup generic="Model, FieldType extends string | number, QueryParams">
import {computed, onBeforeUnmount, ref, toRef} from 'vue'
import WInputAsync from '@/components/Input/WInputAsync.vue'
import {Notify} from '@/utils/Notify'
import {validateRequired} from '@/utils/validate'
import {Modal} from '@/utils/Modal'
import {handleApiError} from '@/utils/api'
import type {FormAsyncInputProps} from './types'
import {get, set} from '@/utils/utils'

type PayloadType = PartialNested<Model>

const props = defineProps<FormAsyncInputProps<Model, FieldType, QueryParams>>()

const emit = defineEmits<{
  (e: 'success', value: Model): void
}>()

const {data, setData, isLoadingError} = props.noParams === true
  ? (props.useQueryFn as UseQueryEmpty<Model>)({enabled: toRef(props, 'queryEnabled')})
  : (props.useQueryFn as UseQueryWithParams<Model, QueryParams>)(toRef(props, 'queryParams'), {enabled: toRef(props, 'queryEnabled')})
const submitting = ref(false)

const modelValue = computed<FieldType | undefined>(() => get<FieldType, PayloadType>(data.value ?? {}, props.field))

const validateFn = computed<ValidateFn[]>(() => {
  const result = Array.isArray(props.validate)
    ? props.validate.slice()
    : props.validate
      ? [props.validate]
      : []

  if (props.required && !props.textSecure) result.push(validateRequired)

  return result
})

const save = (value: FieldType) => {
  if (submitting.value) return

  submitting.value = true

  return props.apiMethod(set<FieldType, PayloadType>({}, props.field, value))
    .then(response => {
      setData(response.data)

      Notify.success({title: 'Saved'})

      emit('success', response.data)
    })
    .catch(error => handleApiError(error, undefined, props.field))
    .finally(() => {
      submitting.value = false
    })
}

let closeModal: (() => void) | null = null

const showModal = (value: FieldType) => {
  closeModal?.()

  const confirmProps = props.confimGetter?.(value)

  if (!confirmProps) {
    save(value)
    return
  }

  closeModal = Modal.addConfirm({
    ...confirmProps,
    onAccept: () => {
      return save(value)
    },
  }, () => closeModal = null)
}

onBeforeUnmount(() => {
  closeModal?.()
  closeModal = null
})

</script>
