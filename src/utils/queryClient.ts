import {type Query, type QueryClient, useQueryClient} from '@tanstack/vue-query'
import {type MaybeRefOrGetter, hasInjectionContext, toValue, watch} from 'vue'

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

const RECOVERY_DELAY_MIN = 2_000
const RECOVERY_DELAY_MAX = 10_000

const isRecoverableQuery = (query: Query): boolean => query.state.status === 'error' && isRetryableError(query.state.error)

/** Fetches again every query on screen that failed with an error asking again may fix */
export const refetchFailedQueries = (queryClient: QueryClient): Promise<void> => {
  return queryClient.refetchQueries({type: 'active', predicate: isRecoverableQuery}, {cancelRefetch: false})
}

/**
 * Brings back the queries that failed while the server was unreachable, which vue-query's own `refetchOnReconnect`
 * cannot see: it only follows the browser's connection. While `available` is false, `probe` - a cheap request through
 * the same client - is sent with a growing delay, and at once when the browser comes back online or the tab is shown.
 * Once the probe has failed and the server answers again, the failed queries are fetched again. A probe answered at
 * once means only some endpoints fail, and those queries wait for their own Retry instead of being fetched in a loop.
 * Returns a function that stops watching.
 */
export const watchServerRecovery = (
  queryClient: QueryClient,
  available: MaybeRefOrGetter<boolean>,
  probe: () => Promise<unknown>,
): (() => void) => {
  let delay = RECOVERY_DELAY_MIN
  let timeout: ReturnType<typeof setTimeout> | undefined
  let isOutage = false

  const schedule = () => {
    clearTimeout(timeout)
    timeout = setTimeout(check, delay)
    delay = Math.min(delay * 2, RECOVERY_DELAY_MAX)
  }

  const check = () => {
    clearTimeout(timeout)

    void probe().catch(() => undefined).finally(() => {
      if (toValue(available)) return

      isOutage = true
      schedule()
    })
  }

  const checkNow = () => {
    if (toValue(available)) return

    delay = RECOVERY_DELAY_MIN
    check()
  }

  const checkWhenShown = () => {
    if (document.visibilityState === 'visible') checkNow()
  }

  const stopWatch = watch(() => toValue(available), value => {
    if (!value) return schedule()

    clearTimeout(timeout)
    delay = RECOVERY_DELAY_MIN

    if (!isOutage) return

    isOutage = false
    void refetchFailedQueries(queryClient)
  })

  if (typeof window !== 'undefined') {
    window.addEventListener('online', checkNow)
    document.addEventListener('visibilitychange', checkWhenShown)
  }

  return () => {
    stopWatch()
    clearTimeout(timeout)

    if (typeof window !== 'undefined') {
      window.removeEventListener('online', checkNow)
      document.removeEventListener('visibilitychange', checkWhenShown)
    }
  }
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
