import {type QueryClient, type QueryKey, type UseQueryReturnType, useQuery, useQueryClient} from '@tanstack/vue-query'
import {type MaybeRef, unref, watch} from 'vue'

import {ApiError} from './api'

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

export const makeQueryPaginated = <Data, QueryParams extends {page?: number}>(key: string, getter: (queryParams: QueryParams) => Data[] | undefined, setter?: (data: Data[]) => void, pageLength = PAGE_LENGTH): UseQueryPaginated<Data, QueryParams> => {
  return (queryParams: MaybeRef<QueryParams>, options: QueryOptions<PaginatedResponse<Data>> = {}) => {
    const query = useDefaultQuery<PaginatedResponse<Data>>({
      queryKey: [key, queryParams],
      queryFn: (): Promise<PaginatedResponse<Data>> => {
        return new Promise((resolve, reject) => {
          const currentList = getter(unref(queryParams))

          if (!currentList) return resolve(null as never)
  
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

      ...options as NonNullable<unknown>,
    })

    const setDataOld = query.setData

    query.setData = (data: PaginatedResponse<Data>, options?: Parameters<typeof query.setData>[1]) => {
      if (setter && unref(options)?.index !== undefined) {
        const index = unref(unref(options)?.index)

        if (index !== undefined) {
          const newList = getter({} as QueryParams)?.slice() ?? []
          const oldItem = query.data.value?.results[index]

          if (oldItem !== undefined) {
            const itemIndex = newList.findIndex(item => (item as {id: number}).id === (oldItem as {id: number}).id)
            const newItem = unref(unref(options)?.newItem)

            if (index !== -1) {
              if (newItem === undefined) newList.splice(itemIndex, 1)
              else newList.splice(itemIndex, 1, newItem as Data)

              setter(newList)
            }
          }
        }
      }

      return setDataOld(data, options)
    }

    return query
  }
}

export const wrapUseQueryPaginated = <Data, QueryParams extends {page?: number}>(key: string, queryFn: UseQueryDefault<Data[]>): UseQueryPaginated<Data, QueryParams> => {
  return (queryParams: MaybeRef<QueryParams>, options: QueryOptions<PaginatedResponse<Data>> = {}) => {
    const query = queryFn(options as Parameters<UseQueryDefault<Data[]>>[0])

    const newQuery = makeQueryPaginated(key, () => query.data.value, query.setData)(queryParams, options)

    watch(query.data, () => {
      newQuery.refetch()
    })

    return newQuery
  }
}
