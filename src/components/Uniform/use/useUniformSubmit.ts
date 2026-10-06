import type {InvalidatePayload, UniformValidate} from '../types'

import {h, ref} from 'vue'

import {Notify} from '@/utils/Notify'
import {ApiError, ApiErrorCancel, isRequestResponse} from '@/utils/api'
import {getText} from '@/utils/texts'

import WUniformErrorMessage from '../WUniformErrorMessage.vue'

export const useUniformSubmit = <ModelValue, OriginalModel>(
  payloadGetter: () => ModelValue,
  apiMethod: (value: ModelValue) => Promise<RequestResponse<OriginalModel>> | Promise<OriginalModel> | OriginalModel | undefined | void,
  validate: UniformValidate,
  invalidate: (payload: InvalidatePayload) => void,
  onSuccess: (value: OriginalModel) => void,
  initModel: (value: OriginalModel | undefined, payload: ModelValue, partial: boolean) => void,
  showMessage: (message: string, onlyChanged?: boolean, fields?: string[]) => void,
  noInitGetter: () => boolean,
  asyncGetter: () => boolean,
  fullPayloadGetter: () => boolean | undefined,
) => {
  const submitting = ref(false)

  // A change made while saving is sent once the save ends.
  let resubmit = false

  const submit = (): Promise<boolean> => {
    if (submitting.value) {
      if (asyncGetter()) resubmit = true

      return Promise.resolve(false)
    }

    // Saving each change on its own: only the changed fields are checked, and the invalid ones wait without holding back the rest.
    const partial = asyncGetter() && !fullPayloadGetter()

    const message = validate(false, true, partial)

    if (message && !partial) {
      if (!asyncGetter()) Notify.warn({
        title: getText('invalidData'),
        caption: h(WUniformErrorMessage, {message}),
      })

      return Promise.resolve(false)
    }

    const payload = payloadGetter()

    if (partial && payload instanceof Object && !Object.keys(payload).length) return Promise.resolve(false)

    const fields = partial && payload instanceof Object ? Object.keys(payload) : undefined

    submitting.value = true

    const promise = apiMethod(payload!)

    return (promise instanceof Promise ? promise : Promise.resolve(promise as OriginalModel | undefined))
      .then(response => {
        const isResponse = isRequestResponse<OriginalModel>(response)
        const responseData = isResponse ? response.data : response

        showMessage('Saved', true, fields)

        if (!noInitGetter()) initModel(responseData, payload, partial)
        onSuccess(responseData ?? payload as unknown as OriginalModel)

        return true
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

        return false
      })
      .finally(() => {
        submitting.value = false

        if (resubmit) {
          resubmit = false
          submit()
        }
      })
  }

  return {
    submit,
    submitting,
  }
}
