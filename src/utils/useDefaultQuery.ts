import {useQuery, useQueryClient, type QueryClient, type UseQueryReturnType, type QueryKey} from '@tanstack/vue-query'

type Params = Parameters<QueryClient['setQueriesData']>

export const useDefaultQuery = <
  TQueryFnData = unknown,
  TError = DefaultQueryConfig['ApiError'],
  TData = TQueryFnData,
  TQueryKey extends QueryKey = QueryKey,
>
  (...args: Parameters<typeof useQuery<TQueryFnData, TError, TData, TQueryKey>>): UseQueryReturnType<TData, TError> & {
    setData: (updater: TQueryFnData, options?: Params[2]) => ReturnType<QueryClient['setQueriesData']>
  } => {
  const queryClient = args[1] ?? useQueryClient()

  const setData = (updater: TQueryFnData, options?: Params[2]) => queryClient.setQueriesData({queryKey: 'queryKey' in args[0] ? args[0].queryKey : undefined}, updater, options)

  return {
    ...useQuery<TQueryFnData, TError, TData, TQueryKey>(...args),
    setData,
  }
}
