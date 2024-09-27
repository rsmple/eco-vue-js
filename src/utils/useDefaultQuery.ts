import {useQuery, useQueryClient, type QueryClient, type UseQueryReturnType, type QueryKey} from '@tanstack/vue-query'
import type {ApiError} from './api'

type Params = Parameters<QueryClient['setQueriesData']>

export const useDefaultQuery = <
  TQueryFnData = unknown,
  TData = TQueryFnData,
  TQueryKey extends QueryKey = QueryKey,
>
  (...args: Parameters<typeof useQuery<TQueryFnData, ApiError, TData, TQueryKey>>): UseQueryReturnType<TData, ApiError> & {
    setData: (updater: TQueryFnData, options?: Params[2]) => ReturnType<QueryClient['setQueriesData']>
  } => {
  const queryClient = args[1] ?? useQueryClient()

  const setData = (updater: TQueryFnData, options?: Params[2]) => queryClient.setQueriesData({queryKey: 'queryKey' in args[0] ? args[0].queryKey : undefined}, updater, options)

  return {
    ...useQuery<TQueryFnData, ApiError, TData, TQueryKey>(...args),
    setData,
  }
}
