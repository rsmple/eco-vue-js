import type {InvalidatePayload, UniformValidate} from '../types'

import {h, ref} from 'vue'

import {Notify} from '@/utils/Notify'
import {ApiError, ApiErrorCancel, isRequestResponse} from '@/utils/api'

import WUniformErrorMessage from '../WUniformErrorMessage.vue'

export const useUniformSubmit = <ModelValue, OriginalModel>(
  payloadGetter: () => ModelValue,
  apiMethod: (value: ModelValue) => Promise<RequestResponse<OriginalModel>> | Promise<OriginalModel> | OriginalModel | undefined | void,
  validate: UniformValidate,
  invalidate: (payload: InvalidatePayload) => void,
  onSuccess: (value: OriginalModel) => void,
  initModel: (value: OriginalModel) => void,
  showMessage: (message: string, onlyChanged?: boolean) => void,
  noInitGetter: () => boolean,
) => {
  const submitting = ref(false)

  const submit = () => {
    if (submitting.value) return

    const message = validate(false, true)

    if (message) {
      Notify.warn({
        title: 'Form contains invalid data',
        caption: h(WUniformErrorMessage, {message}),
      })

      return
    }

    const payload = payloadGetter()

    let promise: ReturnType<typeof apiMethod> | undefined = undefined

    submitting.value = true

    promise = apiMethod(payload!)

    if (!(promise instanceof Promise)) Promise.resolve(promise)

    return (promise as Promise<OriginalModel> ?? Promise.resolve(undefined))
      .then(response => {
        const isResponse = isRequestResponse<OriginalModel>(response)
        const responseData = isResponse ? response.data : response

        showMessage('Saved', true)

        if (!noInitGetter()) initModel(responseData ?? payload as unknown as OriginalModel)
        onSuccess(responseData ?? payload as unknown as OriginalModel)
      })
      .catch(error => {
        if (error instanceof ApiError && !(error instanceof ApiErrorCancel)) {
          const messages = error.response?.data as InvalidatePayload | undefined

          const caption = !messages || typeof messages === 'string' || Array.isArray(messages)
            ? messages
            : messages.detail ??
            messages.non_field_errors ??
            messages

          const text = typeof caption === 'string' ? caption : Array.isArray(caption) && caption.every(item => typeof item === 'string') ? caption.join('. ') : undefined

          Notify.error({
            title: 'Error',
            caption: text && text.length < 200 ? text : undefined,
          })

          if (messages) invalidate(messages)
        }
      })
      .finally(() => {
        submitting.value = false
      })
  }

  return {
    submit,
    submitting,
  }
}
