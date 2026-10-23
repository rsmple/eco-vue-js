import type {LocationQuery} from 'vue-router'

import {type Ref, ref} from 'vue'

import {EXPIRATION_DATE_KEY, checkExpirationDate, getLastRefreshPromise, removeExpirationDate, removeRefreshTimestamp, setExpirationDate, setRefreshTimestamp} from '@/components/Auth/utils/utils'

import {ApiError, ApiErrorCancel, ApiErrorUnavailable, UNAVAILABLE_STATUS_LIST, encodeQueryParams} from './api'

export {updateExpirationDate} from '@/components/Auth/utils/utils'

export const getURLParams = (params: RequestConfig['params'] | LocationQuery): string => {
  return new URLSearchParams(encodeQueryParams(params) as Record<string, string>).toString()
}

const HEADERS_JSON: Record<string, string> = {
  'Content-Type': 'application/json',
  'Access-Control-Allow-Origin': '*',
}

const HEADERS_FORMDATA: Record<string, string> = {
  'Access-Control-Allow-Origin': '*',
}

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface Config {}

type ApiUrl = Config extends {ApiUrl: infer Value} ? Value : `/${ string }/`
type BaseUrl = `/${ string }` | `http://${ string }` | `https://${ string }`

export interface ApiClient {
  baseUrl: string

  get<R>(url: ApiUrl, config?: RequestConfig<never>): Promise<RequestResponse<R, NonNullable<unknown>>>

  post<R, D extends RequestData = RequestData>(url: ApiUrl, data?: Required<RequestConfig<D>>['data'], config?: Omit<RequestConfig<D>, 'data'>): Promise<RequestResponse<R, D>>

  patch<R, D extends RequestData = RequestData>(url: ApiUrl, data?: Required<RequestConfig<D>>['data'], config?: Omit<RequestConfig<D>, 'data'>): Promise<RequestResponse<R, D>>

  delete<R>(url: ApiUrl, config?: RequestConfig<never>): Promise<RequestResponse<R, NonNullable<unknown>>>
}

export class ApiClientInstance implements ApiClient {
  refreshPromise: Promise<void> | null = null
  private readonly auth = ref(true)
  public readonly useAuth: () => Ref<boolean>

  constructor(private config: {
    tokenGetter?: () => string | null
    tokenRefresh?: () => Promise<void>
    refreshUrl?: ApiUrl
    onFailure?: (response: Response) => void
    credentials?: RequestCredentials
    baseUrl?: BaseUrl
    noRecheck?: boolean
    /** Cookie holding when to refresh the session, in epoch seconds. Defaults to `exp` */
    expirationCookie?: string
  }) {
    if (typeof window !== 'undefined' && !config.noRecheck) {
      this.checkAuth()
      setInterval(() => void this.checkAuth(), 500)
      window.addEventListener('storage', () => void this.checkAuth())
    }

    this.useAuth = () => {
      return this.auth
    }
  }

  private get expirationCookie(): string {
    return this.config.expirationCookie ?? EXPIRATION_DATE_KEY
  }

  setOnFailure(value: (response: Response) => void) {
    this.config.onFailure = value
  }

  logout() {
    removeExpirationDate(this.expirationCookie)

    this.auth.value = false
  }

  private async refresh(): Promise<void> {
    if (!this.refreshPromise) {
      const refreshTimeoutPromise = getLastRefreshPromise(this.expirationCookie)

      if (refreshTimeoutPromise) {
        this.refreshPromise = refreshTimeoutPromise
          .then(() => {
            this.refreshPromise = null

            this.auth.value = true
          })
          .catch(async () => {
            this.refreshPromise = null

            const check = this.checkAuth()

            if (!check) {
              if (this.refreshPromise) return this.refreshPromise

              if (check === null) {
                this.auth.value = false

                return Promise.reject()
              }

              return this.refresh()
            }
          })
      } else {
        setRefreshTimestamp(this.expirationCookie)

        const promise = this.config.tokenRefresh
          ? this.config.tokenRefresh()
          : this.fetch('GET', this.config.refreshUrl!, {updateToken: true})

        this.refreshPromise = promise
          .then(() => {
            this.refreshPromise = null
            this.auth.value = true
          })
          .catch((error: unknown) => {
            this.refreshPromise = null

            if (!(error instanceof ApiErrorUnavailable)) this.auth.value = false

            return Promise.reject(error)
          })
          .finally(() => removeRefreshTimestamp(this.expirationCookie))
      }
    }

    return this.refreshPromise
  }

  checkAuth() {
    let result

    if (this.config.tokenGetter) result = !!this.config.tokenGetter?.()
    else result = checkExpirationDate(this.expirationCookie)

    if (result !== false) this.auth.value = result !== null
    if (result === null) removeExpirationDate(this.expirationCookie)

    return result
  }

  private get canRefresh(): boolean {
    return !!(this.config.refreshUrl || this.config.tokenRefresh)
  }

  private setAuthorization(headers: Headers): boolean {
    if (!this.config.tokenGetter) return true

    const token = this.config.tokenGetter()

    if (!token) return false

    headers.set('Authorization', 'Bearer ' + token)

    return true
  }

  private async send<R, D extends RequestData>(request: Request, config: RequestConfig<D> | undefined, refreshOnUnauthorized: boolean): Promise<RequestResponse<R, D>> {
    const requestClone = refreshOnUnauthorized ? request.clone() : null

    let response: Response

    try {
      response = await fetch(request)
    } catch (error) {
      if (error instanceof DOMException && error.name === 'AbortError') throw new ApiErrorCancel<D>({data: undefined, config, request})

      throw new ApiErrorUnavailable<D>({data: undefined, config, request})
    }

    const data = await response.json().catch(() => undefined)

    if (response.ok) return {data, status: response.status, config, request}

    if (response.status === 401 && requestClone) {
      if (this.canRefresh) {
        await this.refresh()

        if (this.setAuthorization(requestClone.headers)) return this.send<R, D>(requestClone, config, false)
      }

      this.auth.value = false
    }

    this.config.onFailure?.(response)

    const ErrorClass = UNAVAILABLE_STATUS_LIST.includes(response.status) ? ApiErrorUnavailable : ApiError

    throw new ErrorClass<D>({data, status: response.status, config, request})
  }

  private async fetch<R, D extends RequestData>(method: string, url: ApiUrl, config?: RequestConfig<D>, baseUrl?: BaseUrl): Promise<RequestResponse<R, D>> {
    const headers = new Headers(config?.data instanceof FormData ? HEADERS_FORMDATA : HEADERS_JSON)

    if (!config?.noAuth && !config?.updateToken) {
      if (this.refreshPromise) await this.refreshPromise

      const check = this.checkAuth()

      if (!check) {
        if (check !== null && this.canRefresh) await this.refresh()

        if (!this.checkAuth() && !this.config.tokenGetter) {
          this.auth.value = false

          return Promise.reject()
        }
      }

      if (!this.setAuthorization(headers)) {
        this.auth.value = false

        return Promise.reject()
      }
    }

    const params = config?.params ? '?' + getURLParams(config.params) : ''

    const request = new Request(
      (baseUrl ?? this.config.baseUrl) + url + params,
      {
        method: method,
        mode: 'cors',
        cache: 'no-cache',
        credentials: this.config.credentials ?? 'same-origin',
        headers,
        redirect: 'follow',
        referrerPolicy: 'no-referrer',
        body: config?.data ? config.data instanceof FormData ? config.data : JSON.stringify(config.data) : undefined,
        signal: config?.signal,
      },
    )

    try {
      return await this.send<R, D>(request, config, !config?.noAuth && !config?.updateToken)
    } finally {
      if (config?.updateToken) setExpirationDate(this.expirationCookie)
    }
  }

  public get baseUrl() {
    return this.config.baseUrl ?? ''
  }

  get<R>(url: ApiUrl, config?: RequestConfig<never>) {
    return this.fetch<R, NonNullable<unknown>>('GET', url, config)
  }

  post<R, D extends RequestData = RequestData>(url: ApiUrl, data?: Required<RequestConfig<D>>['data'], config?: Omit<RequestConfig<D>, 'data'>) {
    return this.fetch<R, D>('POST', url, {data, ...config})
  }

  patch<R, D extends RequestData = RequestData>(url: ApiUrl, data?: Required<RequestConfig<D>>['data'], config?: Omit<RequestConfig<D>, 'data'>) {
    return this.fetch<R, D>('PATCH', url, {data, ...config})
  }

  delete<R>(url: ApiUrl, config?: RequestConfig<never>) {
    return this.fetch<R, NonNullable<unknown>>('DELETE', url, config)
  }

  addInstance(baseUrl: BaseUrl): ApiClient {
    return {
      baseUrl,

      get: <R>(url: ApiUrl, config?: RequestConfig<never>) => {
        return this.fetch<R, NonNullable<unknown>>('GET', url, config, baseUrl)
      },

      post: <R, D extends RequestData = RequestData>(url: ApiUrl, data?: Required<RequestConfig<D>>['data'], config?: Omit<RequestConfig<D>, 'data'>) => {
        return this.fetch<R, D>('POST', url, {data, ...config}, baseUrl)
      },

      patch: <R, D extends RequestData = RequestData>(url: ApiUrl, data?: Required<RequestConfig<D>>['data'], config?: Omit<RequestConfig<D>, 'data'>) => {
        return this.fetch<R, D>('PATCH', url, {data, ...config}, baseUrl)
      },

      delete: <R>(url: ApiUrl, config?: RequestConfig<never>) => {
        return this.fetch<R, NonNullable<unknown>>('DELETE', url, config, baseUrl)
      },
    }
  }
}
