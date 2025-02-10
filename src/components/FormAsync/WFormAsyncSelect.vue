<template>
  <WSelect
    v-bind="{
      ...props,
      modelValue: modelValue,
      skeleton: skeleton || !data,
      disabled: disabled || isLoadingError,
      loading: loading || submitting,
    }"
    @select="showModal($event)"
    @unselect="showModal($event)"
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

<script lang="ts" setup generic="Model, FieldType extends string | number, QueryParamsOptions, QueryParams, Data extends DefaultData, OptionComponent extends SelectOptionComponent<Data>">
import type {FormAsyncSelectProps} from './types'
import type {SelectOptionComponent} from '@/components/Select/types'

import {computed, onBeforeUnmount, ref, toRef} from 'vue'

import WSelect from '@/components/Select/WSelect.vue'

import {Modal} from '@/utils/Modal'
import {Notify} from '@/utils/Notify'
import {handleApiError} from '@/utils/api'
import {get, set} from '@/utils/utils'

type PayloadType = PartialNested<Model>

const props = withDefaults(defineProps<FormAsyncSelectProps<Model, FieldType, QueryParamsOptions, QueryParams, Data, OptionComponent>>(), {queryEnabled: undefined})

const emit = defineEmits<{
  (e: 'success', value: Model): void
}>()

const {data, setData, isLoadingError} = props.noParams === true
  ? (props.useQueryFn as UseQueryEmpty<Model>)({enabled: toRef(props, 'queryEnabled')})
  : (props.useQueryFn as UseQueryWithParams<Model, QueryParams>)(toRef(props, 'queryParams'), {enabled: toRef(props, 'queryEnabled')})
const submitting = ref(false)

const modelValue = computed<FieldType[]>(() => get<FieldType[], PayloadType>((data.value ?? {}) as PayloadType, props.field) ?? [])

const save = (value: FieldType) => {
  if (submitting.value) return

  submitting.value = true

  const newValue = modelValue.value.slice()
  const index = newValue.indexOf(value)
  if (index === -1) newValue.push(value)
  else newValue.splice(index, 1)

  return props.apiMethod(set<FieldType[], PayloadType>(
    {} as PayloadType,
    props.field,
    newValue,
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