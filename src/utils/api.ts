import type WForm from '@/components/Form/WForm.vue'
import type WFormValidator from '@/components/Form/WFormValidator.vue'
import {Notify} from '@/utils/Notify'
import {get} from './utils'

export class ApiError<Response, Data extends RequestData = RequestData> extends Error {
  constructor(public readonly response: RequestResponse<Response, Data>) {
    super()
  }
}

export class ApiErrorCancel<Response, Data extends RequestData = RequestData> extends ApiError<Response, Data> {
  constructor(response: RequestResponse<Response, Data>) {
    super(response)
  }
}

export const handleApiError = <Error>(
  error: Error,
  form?: {invalidate: ComponentInstance<typeof WForm>['invalidate']},
  field?: string,
  formValidator?: {invalidate: ComponentInstance<typeof WFormValidator>['invalidate']},
): Promise<Error> => {
  if (error instanceof ApiError && !(error instanceof ApiErrorCancel)) {
    const caption = error.response?.data?.detail
      ?? error.response?.data?.non_field_errors?.join(', ')
      ?? (field ? (get(error.response?.data, field) as string[])?.join(', ') : undefined)

    Notify.error({
      title: 'Error',
      caption: typeof caption === 'string' && caption.length < 200 ? caption : undefined,
    })

    if (formValidator && caption.length < 200) formValidator.invalidate(caption)
    if (error.response?.data instanceof Object) form?.invalidate(error.response.data)
  }

  return Promise.reject(error)
}
