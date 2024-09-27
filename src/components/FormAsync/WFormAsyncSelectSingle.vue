<template>
  <WSelectSingle
    v-bind="{
      ...props,
      modelValue: modelValue,
      skeleton: skeleton || !data,
      disabled: disabled || isLoadingError,
      loading: loading || submitting,
    }"
    @update:model-value="showModal(($event ?? null) as FieldType)"
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
  </WSelectSingle>
</template>

<script lang="ts" setup generic="Model, FieldType extends string | number, QueryParams, Data extends DefaultData, OptionComponent extends SelectOptionComponent<Data>, AllowClear extends boolean = false">
import {computed, onBeforeUnmount, ref, toRef} from 'vue'
import type {FormAsyncSelectProps} from './types'
import type {SelectOptionComponent} from '@/components/Select/types'
import WSelectSingle from '@/components/Select/WSelectSingle.vue'
import {get, set} from '@/utils/utils'
import {Notify} from '@/utils/Notify'
import {handleApiError} from '@/utils/api'
import {Modal} from '@/utils/Modal'

type PayloadType = PartialNested<Model>

const props = defineProps<FormAsyncSelectProps<Model, FieldType, QueryParams, Data, OptionComponent, AllowClear>>()

const emit = defineEmits<{
  (e: 'success', value: Model): void
}>()

const {data, setData, isLoadingError} = props.noParams === true
  ? (props.useQueryFn as UseQueryEmpty<Model>)({enabled: toRef(props, 'queryEnabled')})
  : (props.useQueryFn as UseQueryWithParams<Model, QueryParams>)(toRef(props, 'queryParams'), {enabled: toRef(props, 'queryEnabled')})
const submitting = ref(false)

const modelValue = computed<FieldType | null>(() => get<FieldType, PayloadType>(data.value ?? {}, props.field) ?? null)

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