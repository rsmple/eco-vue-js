<template>
  <WButtonGroup
    v-bind="{
      ...props,
      modelValue: modelValue as FieldType,
      list: list as (FieldType)[],
      optionComponent: optionComponent as ButtonGroupOptionComponent<FieldType> | undefined,
      loading: submittingItem,
      disabled: disabled || isLoadingError,
      skeleton: skeleton || !data,
    }"
    @update:model-value="showModal($event as FieldType)"
  >
    <template
      v-if="$slots.option"
      #option="{option, selected}"
    >
      <slot
        name="option"
        :option="option"
        :selected="selected"
      />
    </template>
  </WButtonGroup>
</template>

<script lang="ts" setup generic="Model, FieldType extends string | number | boolean | null, QueryParams, Entity extends Record<string, unknown>, ValueGetter extends {fn(value: Entity): FieldType}['fn'] | undefined = undefined">
import {computed, onBeforeUnmount, ref, toRef} from 'vue'
import {Notify} from '@/utils/Notify'
import WButtonGroup from '@/components/Button/WButtonGroup.vue'
import type {FormAsyncButtonGroupProps} from './types'
import {get, set} from '@/utils/utils'
import {handleApiError} from '@/utils/api'
import {Modal} from '@/utils/Modal'
import type {ButtonGroupOptionComponent} from '../Button/types'

type PayloadType = PartialNested<Model>

const props = defineProps<FormAsyncButtonGroupProps<Model, FieldType, QueryParams, Entity, ValueGetter>>()

const {data, setData, isLoadingError} = props.noParams === true
  ? (props.useQueryFn as UseQueryEmpty<Model>)({enabled: toRef(props, 'queryEnabled')})
  : (props.useQueryFn as UseQueryWithParams<Model, QueryParams>)(toRef(props, 'queryParams'), {enabled: toRef(props, 'queryEnabled')})
const submittingItem = ref<FieldType | undefined>()

const modelValue = computed<FieldType | null>(() => get<FieldType, PayloadType>(data.value ?? {}, props.field) ?? null)

const save = (value: FieldType) => {
  if (submittingItem.value !== undefined) return

  submittingItem.value = value

  return props.apiMethod(set<FieldType, PayloadType>({}, props.field, value))
    .then(response => {
      setData(response.data)

      Notify.success({title: 'Saved'})
    })
    .catch(error => handleApiError(error, undefined, props.field))
    .finally(() => {
      submittingItem.value = undefined
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