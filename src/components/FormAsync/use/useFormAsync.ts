import type {FormAsyncProps} from '../types'

import {computed, onBeforeUnmount, ref, toRef} from 'vue'

import {Modal} from '@/utils/Modal'
import {Notify} from '@/utils/Notify'
import {handleApiError} from '@/utils/api'
import {get, set} from '@/utils/utils'

export const useFormAsync = <Model, FieldType, QueryParams>(props: FormAsyncProps<Model, FieldType, QueryParams>, onSuccess: (value: Model) => void) => {
  const enabled = toRef(props, 'queryEnabled')

  const {data, setData, isLoadingError} = props.noParams === true
    ? props.useQueryFn({enabled})
    : props.useQueryFn(toRef(props, 'queryParams'), {enabled})

  const submitting = ref(false)

  const modelValue = computed<FieldType | undefined>(() => get<FieldType, PartialNested<Model>>((data.value ?? {}) as PartialNested<Model>, props.field))

  const save = (value: FieldType) => {
    if (submitting.value) return

    submitting.value = true

    return props.apiMethod(set<FieldType, PartialNested<Model>>({} as PartialNested<Model>, props.field, value))
      .then(response => {
        setData(response.data)

        Notify.success({title: 'Saved'})

        onSuccess(response.data)
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

  return {
    isLoadingError,
    data,
    modelValue,
    submitting,
    showModal,
  }
}
