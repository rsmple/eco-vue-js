import {type QueryClient, useQueryClient} from '@tanstack/vue-query'
import {hasInjectionContext} from 'vue'

import {ApiError, ApiErrorCancel, ApiErrorUnavailable} from './api'

export const MAX_QUERY_RETRIES = 2

const RETRYABLE_CLIENT_STATUS_LIST: readonly number[] = [408, 429]

/** Whether asking again may get a different answer: the server was unreachable, failed, or asked to be retried */
export const isRetryableError = (error: unknown): boolean => {
  if (!(error instanceof ApiError) || error instanceof ApiErrorCancel) return false

  if (error instanceof ApiErrorUnavailable) return true

  const status = error.response?.status

  if (status === undefined) return false

  return status >= 500 || RETRYABLE_CLIENT_STATUS_LIST.includes(status)
}

/** The `retry` option for a `QueryClient`'s query defaults; compose it in a query that needs to skip more */
export const defaultQueryRetry = (failureCount: number, error: unknown): boolean => {
  return failureCount < MAX_QUERY_RETRIES && isRetryableError(error)
}

let queryClientGlobal: QueryClient | undefined

export const setQueryClient = (queryClient: QueryClient): void => {
  queryClientGlobal = queryClient
}

/**
 * Query hooks resolve the client by injection, which is only available inside setup. Model actions run from
 * event handlers instead, so the client an app installed into `VueQueryPlugin` has to be reachable from a
 * module - a library model has no other way to reach the client of the app consuming it.
 */
export const getQueryClient = (): QueryClient => {
  if (queryClientGlobal) return queryClientGlobal

  if (hasInjectionContext()) return useQueryClient()

  throw new Error('No queryClient found - call setQueryClient where VueQueryPlugin is installed, or pass a client explicitly.')
}
