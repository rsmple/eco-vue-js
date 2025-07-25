import type {LocationQuery, RouteRecordRaw} from 'vue-router'

import {ref} from 'vue'

import WRouteAuth from '@/components/Auth/WRouteAuth.vue'
import WRouteAuthNo from '@/components/Auth/WRouteAuthNo.vue'

import {checkExpirationDate, getLastRefreshPromise, removeExpirationDate, removeRefreshTimestamp, setExpirationDate, setRefreshTimestamp} from '@/components/Auth/utils/utils'

import {ApiError, ApiErrorCancel, encodeQueryParams} from './api'

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

type ApiUrl = `/${ string }/`
type BaseUrl = `/${ string }`

export interface ApiClient {
  baseUrl: string

  get<R>(url: ApiUrl, config?: RequestConfig<never>): Promise<RequestResponse<R, NonNullable<unknown>>>

  post<R, D extends RequestData = RequestData>(url: ApiUrl, data?: Required<RequestConfig<D>>['data'], config?: Omit<RequestConfig<D>, 'data'>): Promise<RequestResponse<R, D>>

  patch<R, D extends RequestData = RequestData>(url: ApiUrl, data?: Required<RequestConfig<D>>['data'], config?: Omit<RequestConfig<D>, 'data'>): Promise<RequestResponse<R, D>>

  delete<R>(url: ApiUrl, config?: RequestConfig<never>): Promise<RequestResponse<R, NonNullable<unknown>>>
}

export class ApiClientInstance implements ApiClient {
  refreshPromise: Promise<void> | null = null
  isAuthFailed = ref(false)

  constructor(private config: {
    tokenGetter?: () => string | null
    refreshUrl?: ApiUrl
    onFailure?: (response: Response) => void
    credentials?: RequestCredentials
    baseUrl?: BaseUrl
    routeNameAuth: string
    routeNameAuthNo: string
  }) {}

  get routeNameAuth() {
    return this.config.routeNameAuth
  }

  get routeNameAuthNo() {
    return this.config.routeNameAuthNo
  }

  setOnFailure(value: (response: Response) => void) {
    this.config.onFailure = value
  }

  logout() {
    removeExpirationDate()
  }

  private async retry(request: Request) {
    const newRequest = request.clone()

    const response = await fetch(request)

    return {
      data: await response.json(),
      status: response.status,
      request: newRequest,
    }
  }

  private async refresh(): Promise<void> {
    if (!this.refreshPromise) {
      const refreshTimeoutPromise = getLastRefreshPromise()

      if (refreshTimeoutPromise) {
        this.refreshPromise = refreshTimeoutPromise
          .then(() => {
            this.refreshPromise = null

            this.isAuthFailed.value = false
          })
          .catch(async () => {
            this.refreshPromise = null

            const check = this.checkAuth()

            if (!check) {
              if (this.refreshPromise) return this.refreshPromise

              if (check === null) {
                this.isAuthFailed.value = true

                return Promise.reject()
              }

              return this.refresh()
            }
          })
      } else {
        setRefreshTimestamp()

        this.refreshPromise = this.fetch('GET', this.config.refreshUrl!, {updateToken: true})
          .then(() => {
            this.refreshPromise = null
          })
          .catch((error: unknown) => {
            this.refreshPromise = null

            this.isAuthFailed.value = true

            return Promise.reject(error)
          })
          .finally(removeRefreshTimestamp)
      }
    }

    return this.refreshPromise
  }

  checkAuth() {
    let result

    if (this.config.tokenGetter) result = !!this.config.tokenGetter?.()
    else result = checkExpirationDate()

    if (result) this.isAuthFailed.value = false

    return result
  }

  private fetch<R, D extends RequestData>(method: string, url: ApiUrl, config?: RequestConfig<D>, baseUrl?: BaseUrl): Promise<RequestResponse<R, D>> {
    return new Promise(async (resolve, reject) => {
      const headers = new Headers(config?.data instanceof FormData ? HEADERS_FORMDATA : HEADERS_JSON)

      if (!config?.noAuth && !config?.updateToken) {
        if (this.refreshPromise) await this.refreshPromise

        const check = this.checkAuth()

        if (!check) {
          if (check === null) {
            this.isAuthFailed.value = true

            return Promise.reject()
          }

          if (this.config.refreshUrl) await this.refresh()
        } else if (this.config.tokenGetter) {
          const token = this.config.tokenGetter()

          if (token) headers.append('Authorization', 'Bearer ' + token)
          else return Promise.reject()
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

      fetch(request)
        .then(response => {
          response
            .json()
            .catch(() => undefined)
            .then(data => {
              if (response.ok) {
                resolve({
                  data,
                  status: response.status,
                  config: config,
                  request,
                })
              } else {
                if (response.status === 401) {
                  if (this.config.refreshUrl) return this.refresh().then(() => this.retry(request))

                  this.isAuthFailed.value = true
                }

                this.config.onFailure?.(response)

                reject(new ApiError<D>({
                  data,
                  status: response.status,
                  config: config,
                  request,
                }))
              }
            })
        })
        .catch(error => {
          if (error instanceof DOMException && error.name === 'AbortError') {
            reject(new ApiErrorCancel<D>({
              data: undefined,
              config: config,
              request,
            }))
          }

          reject(error)
        })
        .finally(() => {
          if (config?.updateToken) setExpirationDate()
        })
    })
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

  getRouteAuth(this: ApiClientInstance) {
    return {
      path: '',
      props: {apiClientInstance: this} satisfies ComponentInstance<typeof WRouteAuth> extends {$props: infer P} ? P : never,
      component: WRouteAuth,
      beforeEnter: async to => {
        if (to.meta.noAuth) return

        if (this.refreshPromise) await this.refreshPromise

        if (!this.checkAuth()) {
          if (this.config.refreshUrl) return this.refresh()
            .catch(() => ({
              name: this.routeNameAuthNo, query: to.fullPath !== '/' ? {hash: to.fullPath} : undefined,
            }))

          return {name: this.routeNameAuthNo, query: to.fullPath !== '/' ? {hash: to.fullPath} : undefined}
        }
      },
      meta: {
        noAuth: false,
      },
    } satisfies RouteRecordRaw
  }

  getRouteAuthNo(this: ApiClientInstance) {
    return {
      path: '',
      props: {apiClientInstance: this} satisfies ComponentInstance<typeof WRouteAuthNo> extends {$props: infer P} ? P : never,
      component: WRouteAuthNo,
      beforeEnter: (to, from) => {
        if (!this.checkAuth()) {
          if (!to.query.hash && !from.meta.noAuth && from.fullPath !== '/') {
            return {...to, query: {hash: from.fullPath}}
          }

          return
        }
  
        if (typeof to.query.hash === 'string') return to.query.hash
        else return {name: this.routeNameAuth}
      },
      meta: {
        noAuth: true,
      },
    } satisfies RouteRecordRaw
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
