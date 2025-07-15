import {type Reactive, type Ref, reactive, watch} from 'vue'
import {useRouter} from 'vue-router'

import type WForm from '@/components/Form/WForm.vue'
import type WFormValidator from '@/components/Form/WFormValidator.vue'

import {Notify} from '@/utils/Notify'

import {get} from './utils'

type ErrorResponse<Response> = {
  [Key in 'detail' | 'non_field_errors' | keyof Response]?: Key extends 'detail' ? string : string[]
}

export class ApiError<Data extends RequestData = NonNullable<unknown>, ErrorData = ErrorResponse<Data>> extends Error {
  constructor(public readonly response: RequestResponse<ErrorData, Data>) {
    super()
  }
}

export class ApiErrorCancel<Data extends RequestData = NonNullable<unknown>> extends ApiError<Data, undefined> {
  constructor(response: RequestResponse<undefined, Data>) {
    super(response)
  }
}

export const handleApiError = <Error>(
  error: Error,
  form?: {invalidate: ComponentInstance<typeof WForm>['invalidate']} | null,
  field?: string,
  formValidator?: {invalidate: ComponentInstance<typeof WFormValidator>['invalidate']} | null,
): Promise<Error> => {
  if (error instanceof ApiError && !(error instanceof ApiErrorCancel)) {
    const caption = (error.response?.data as ErrorResponse<NonNullable<unknown>>)?.detail
      ?? error.response?.data?.non_field_errors?.join(', ')
      ?? (field ? (get<string[], Record<string, string[]>>(error.response?.data as Record<string, string[]> ?? {}, field))?.join(', ') : undefined)

    Notify.error({
      title: 'Error',
      caption: typeof caption === 'string' && caption.length < 200 ? caption : undefined,
    })

    if (formValidator && caption && caption.length < 200) formValidator.invalidate(caption)
    if (error.response?.data instanceof Object) form?.invalidate(error.response.data)
  }

  return Promise.reject(error)
}

export const encodeQueryParam = <T>(value: T): EncodeQueryParam<T> | undefined => {
  if (value === undefined) return undefined

  if (Array.isArray(value)) {
    if (value.length === 0) return undefined

    if (value.every(Number.isInteger) || value.every(item => typeof item === 'string')) return value.join(',') as EncodeQueryParam<T>
    else return JSON.stringify(value) as EncodeQueryParam<T>
  } else {
    if (value instanceof Object) return JSON.stringify(value) as EncodeQueryParam<T>
    else return `${ value }` as EncodeQueryParam<T>
  }
}

export const encodeQueryParams = <T>(params: T): EncodeQueryParams<T> => {
  const result = {} as EncodeQueryParams<T>

  for (const key in params) {
    const value = encodeQueryParam(params[key])

    if (value === undefined || (Array.isArray(value) && value.length === 0)) continue

    result[key] = value
  }

  return result
}

export const encodeRouteParams = <T>(params: T): Partial<EncodeQueryParams<T>> => {
  const result = {} as Partial<EncodeQueryParams<T>>

  for (const key in params) {
    const value = encodeQueryParam(params[key])

    if (value === undefined || value === '' || (Array.isArray(value) && value.length === 0)) {
      result[key] = undefined
    } else {
      result[key] = value
    }
  }

  return result
}

export const createUseQueryParams = <QueryParams extends Record<string, unknown>>(config: {[Key in keyof QueryParams]: ParseFn<QueryParams[Key]>}) => {
  const keyList = Object.keys(config) as Array<keyof QueryParams>

  const parse = (queryParams: Partial<QueryParams> | Reactive<Partial<QueryParams>>, value: EncodeQueryParams<Partial<QueryParams>>) => {
    for (const key of keyList) {
      const resultValue = config[key](value[key])

      if (queryParams[key as keyof typeof queryParams] === resultValue) continue

      if (
        resultValue === undefined ||
        Number.isNaN(resultValue) ||
        (Array.isArray(resultValue) && resultValue.length === 0)
      ) {
        delete queryParams[key as keyof typeof queryParams]
      } else {
        queryParams[key as keyof typeof queryParams] = resultValue as typeof queryParams[keyof typeof queryParams]
      }
    }
  }

  const queryParams = reactive<Partial<QueryParams>>({})
  let lastQuery: EncodeQueryParams<Partial<QueryParams>> | null = null

  const fn = (route: {query: EncodeQueryParams<Partial<QueryParams>>, hash?: string}, enabled?: Ref<boolean>) => {
    const router = useRouter()

    const updateQueryParams = (value: Partial<QueryParams>) => {
      router.replace({
        query: {...route.query as Record<string, string>, ...encodeRouteParams(value)},
        hash: Object.keys(value).length === 1 && 'ordering' in value ? route.hash : undefined,
      })
    }

    const handle = watch(() => route.query, value => {
      if (lastQuery === value) return
      parse(queryParams, value)
      lastQuery = value
    }, {immediate: enabled ? enabled.value : true})

    if (enabled) {
      watch(enabled, value => {
        if (value) handle.resume()
        else handle.pause()
      }, {immediate: true})
    }
  
    return {
      queryParams,
      updateQueryParams,
    }
  }

  fn.config = config
  fn.parse = parse

  return fn as typeof fn & {QueryParams: Partial<QueryParams>}
}
