import {useQuery, useQueryClient, type QueryClient, type UseQueryReturnType, type QueryKey} from '@tanstack/vue-query'
import {ApiError} from './api'
import {unref, type MaybeRef} from 'vue'

type Params = Parameters<QueryClient['setQueriesData']>

type SetData<TQueryFnData = unknown> = (updater: TQueryFnData, options?: Params[2]) => ReturnType<QueryClient['setQueriesData']>

type UseQueryReturnTypeSetData<TQueryFnData = unknown, TData = TQueryFnData> = UseQueryReturnType<TData, ApiError> & {
  setData: SetData<TQueryFnData>
}

export const useDefaultQuery = <
  TQueryFnData = unknown,
  TData = TQueryFnData,
  TQueryKey extends QueryKey = QueryKey,
>(...args: Parameters<typeof useQuery<TQueryFnData, ApiError, TData, TQueryKey>>): UseQueryReturnTypeSetData<TQueryFnData, TData> => {
  const query = useQuery<TQueryFnData, ApiError, TData, TQueryKey>(...args) as UseQueryReturnTypeSetData<TQueryFnData, TData>
  const queryClient = args[1] ?? useQueryClient()

  query.setData = (updater: TQueryFnData, options?: Params[2]) => queryClient.setQueriesData({queryKey: 'queryKey' in args[0] ? args[0].queryKey : undefined}, updater, options)

  return query
}

export const PAGE_LENGTH = 24

export const makeQueryPaginated = <Data, QueryParams extends {page?: number}>(key: string, getter: (queryParams: QueryParams) => Data[], setter?: (data: Data[]) => void, pageLength = PAGE_LENGTH): UseQueryPaginated<Data, QueryParams> => {
  return (queryParams: MaybeRef<QueryParams>, options: QueryOptions<PaginatedResponse<Data>> = {}) => {
    const query = useDefaultQuery<PaginatedResponse<Data>>({
      queryKey: [key, queryParams],
      queryFn: () => {
        return new Promise((resolve, reject) => {
          const currentList = getter(unref(queryParams))
          const current = Math.max(unref(queryParams).page ?? 1, 1)
          const pages_count = Math.max(Math.ceil(currentList.length / pageLength), 1)

          if (current > pages_count) reject(new ApiError({status: 404} as RequestResponse<unknown>))
          else resolve({
            count: currentList.length,
            pages_count,
            current,
            next: pages_count > current ? current + 1 : null,
            previous: current !== 1 ? current - 1 : null,
            results: currentList.slice(pageLength * (current - 1), pageLength * current),
          })
        })
      },

      ...options,
    })

    query.setData = (data: PaginatedResponse<Data>, options?: Parameters<typeof query.setData>[1]) => {
      if (setter && unref(options)?.index !== undefined) {
        const index = unref(unref(options)?.index)

        if (index !== undefined) {
          const newList = getter({} as QueryParams).slice()
          const oldItem = query.data.value?.results[index]

          if (oldItem !== undefined) {
            const itemIndex = newList.findIndex(item => (item as DefaultData).id === (oldItem as DefaultData).id)
            const newItem = unref(unref(options)?.newItem)

            if (index !== -1) {
              if (newItem === undefined) newList.splice(itemIndex, 1)
              else newList.splice(itemIndex, 1, newItem as Data)

              setter(newList)
            }
          }
        }
      }

      return query.setData(data, options)
    }

    return query
  }
}
