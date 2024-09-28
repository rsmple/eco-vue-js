<template>
  <WSelect
    v-bind="{
      ...props,
      modelValue: modelValue,
      skeleton: skeleton || !data,
      disabled: disabled || isLoadingError,
      loading: loading || submitting,
    }"
    @select="showModal($event, true)"
    @unselect="showModal($event, false)"
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
  </WSelect>
</template>

<script lang="ts" setup generic="Model, FieldType extends string | number, QueryParams, Data extends DefaultData, OptionComponent extends SelectOptionComponent<Data>">
import {computed, onBeforeUnmount, ref, toRef} from 'vue'
import type {FormAsyncSelectProps} from './types'
import type {SelectOptionComponent} from '@/components/Select/types'
import WSelect from '@/components/Select/WSelect.vue'
import {get, set} from '@/utils/utils'
import {Notify} from '@/utils/Notify'
import {handleApiError} from '@/utils/api'
import {Modal} from '@/utils/Modal'

type PayloadType = PartialNested<Model>

const props = defineProps<FormAsyncSelectProps<Model, FieldType, QueryParams, Data, OptionComponent>>()

const emit = defineEmits<{
  (e: 'success', value: Model): void
}>()

const {data, setData, isLoadingError} = props.noParams === true
  ? (props.useQueryFn as UseQueryEmpty<Model>)({enabled: toRef(props, 'queryEnabled')})
  : (props.useQueryFn as UseQueryWithParams<Model, QueryParams>)(toRef(props, 'queryParams'), {enabled: toRef(props, 'queryEnabled')})
const submitting = ref(false)

const modelValue = computed<FieldType[]>(() => get<FieldType[], PayloadType>(data.value ?? {}, props.field) ?? [])

const save = (value: FieldType, isSelect: boolean) => {
  if (submitting.value) return

  submitting.value = true

  return props.apiMethod(set<FieldType[], PayloadType>(
    {},
    props.field,
    isSelect ? [...modelValue.value, value] : modelValue.value.filter(item => item !== value),
  ))
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

const showModal = (value: FieldType, isSelect: boolean) => {
  closeModal?.()

  const confirmProps = props.confimGetter?.(value, isSelect)

  if (!confirmProps) {
    save(value, isSelect)
    return
  }

  closeModal = Modal.addConfirm({
    ...confirmProps,
    onAccept: () => {
      return save(value, isSelect)
    },
  }, () => closeModal = null)
}

onBeforeUnmount(() => {
  closeModal?.()
  closeModal = null
})

</script>