<template>
  <WToggle
    v-bind="{
      ...props,
      modelValue: modelValue === null ? null : negate ? !modelValue : modelValue,
      loading: loading || !data,
      disabled: !data || isLoadingError || disabled,
      intermediate: intermediate && data !== undefined,
    }"
    @update:model-value="showModal(($event === null ? null : props.negate ? !$event : $event) as FieldType)"
  />
</template>

<script lang="ts" setup generic="Model, FieldType extends boolean | null, QueryParams">
import {computed, onBeforeUnmount, ref, toRef} from 'vue'
import WToggle from '@/components/Toggle/WToggle.vue'
import {Notify} from '@/utils/Notify'
import {Modal} from '@/utils/Modal'
import {handleApiError} from '@/utils/api'
import type {FormAsyncToggleProps} from './types'
import {get, set} from '@/utils/utils'

type PayloadType = PartialNested<Model>

const props = defineProps<FormAsyncToggleProps<Model, FieldType, QueryParams>>()

const emit = defineEmits<{
  (e: 'success', value: Model): void
}>()

const {data, setData, isLoadingError} = props.noParams === true
  ? (props.useQueryFn as UseQueryEmpty<Model>)({enabled: toRef(props, 'queryEnabled')})
  : (props.useQueryFn as UseQueryWithParams<Model, QueryParams>)(toRef(props, 'queryParams'), {enabled: toRef(props, 'queryEnabled')})
const loading = ref(false)

const modelValue = computed<FieldType>(() => get(data.value as Model ?? {}, props.field) ?? null as FieldType)

const save = (value: FieldType) => {
  if (loading.value) return

  const errorMessage = Array.isArray(props.validate)
    ? props.validate.map(item => item(value as Parameters<ValidateFn>[0])).join(', ')
    : props.validate?.(value as Parameters<ValidateFn>[0])

  if (errorMessage) {
    Notify.warn({
      title: 'Error',
      caption: errorMessage,
    })

    return
  }

  loading.value = true

  props.apiMethod(set({}, props.field, value) as PayloadType)
    .then(response => {
      setData(response.data)

      Notify.success({title: 'Saved'})

      emit('success', response.data)
    })
    .catch(error => handleApiError(error, undefined, props.field))
    .finally(() => {
      loading.value = false
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
