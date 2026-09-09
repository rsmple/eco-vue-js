import {type QueryClient, useQueryClient} from '@tanstack/vue-query'
import {hasInjectionContext} from 'vue'

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
