import {type Query, type QueryClient, type QueryFunction, type UseQueryOptions, type UseQueryReturnType, useQuery, useQueryClient} from '@tanstack/vue-query'
import {type MaybeRef, toValue, unref, watch} from 'vue'

import {ApiError} from './api'
import {type QueryModel, type QueryModelId, type QueryScope, type QueryScopeItem, removeQueryItem, setListItem, setQueryItem} from './queryCache'

export const PAGE_LENGTH = 24

type SetQueriesDataResult = ReturnType<QueryClient['setQueriesData']>

type QueryOptionsObject<Data> = Exclude<UseQueryOptions<Data, ApiError, Data>, {value: unknown}>

export type DefaultQueryOptions<Data> = Omit<Partial<QueryOptionsObject<Data>>, 'queryKey' | 'queryFn'>

export type UseQueryReturnTypeDefault<Data> = UseQueryReturnType<Data, ApiError> & {
  setData: (data: Data) => SetQueriesDataResult
  setItem: (item: QueryScopeItem<Data>) => void
  removeItem: (id: QueryModelId) => void
}

export type UseQueryDefaultFn<Data, QueryParams> = (
  queryParams: MaybeRef<QueryParams>,
  options?: DefaultQueryOptions<Data>,
  queryClient?: QueryClient,
) => UseQueryReturnTypeDefault<Data>

export type CreateDefaultQuery = {
  <ModelKey extends string, Scope extends QueryScope, Data>(
    modelKey: ModelKey,
    scope: Scope,
    queryFn: QueryFunction<Data, [ModelKey, Scope]>,
    isQueryParams?: undefined,
    options?: DefaultQueryOptions<Data>,
  ): {
    (
      queryParams?: MaybeRef<undefined>,
      options?: DefaultQueryOptions<Data>,
      queryClient?: QueryClient,
    ): UseQueryReturnTypeDefault<Data>
    config: (queryParams?: MaybeRef<undefined>, options?: DefaultQueryOptions<Data>) => {
      queryKey: [ModelKey, Scope]
      queryFn: QueryFunction<Data, [ModelKey, Scope]>
    }
    setData: (data: Data, queryParams?: MaybeRef<undefined>, queryClient?: QueryClient) => SetQueriesDataResult
    setItem: (item: QueryScopeItem<Data>, queryClient?: QueryClient) => void
    removeItem: (id: QueryModelId, queryClient?: QueryClient) => void
  }

  <ModelKey extends string, Scope extends QueryScope, Data, QueryParams>(
    modelKey: ModelKey,
    scope: Scope,
    queryFn: QueryFunction<Data, [ModelKey, Scope, QueryParams]>,
    isQueryParams: (value: unknown) => value is QueryParams,
    options?: DefaultQueryOptions<Data>,
  ): {
    (
      queryParams: MaybeRef<QueryParams>,
      options?: DefaultQueryOptions<Data>,
      queryClient?: QueryClient,
    ): UseQueryReturnTypeDefault<Data>
    config: (queryParams: QueryParams, options?: DefaultQueryOptions<Data>) => {
      queryKey: [ModelKey, Scope, QueryParams]
      queryFn: QueryFunction<Data, [ModelKey, Scope, QueryParams]>
      enabled: () => (query: Query<Data, ApiError, Data, [ModelKey, Scope, QueryParams]>) => boolean
    }
    setData: (data: Data, queryParams: MaybeRef<QueryParams>, queryClient?: QueryClient) => SetQueriesDataResult
    setItem: (item: QueryScopeItem<Data>, queryClient?: QueryClient) => void
    removeItem: (id: QueryModelId, queryClient?: QueryClient) => void
  }
}

export const createDefaultQuery = (<
  ModelKey extends string,
  Scope extends QueryScope,
  QueryData,
  QueryParams = never,
  QueryKey extends unknown[] = [QueryParams] extends [never] ? [ModelKey, Scope] : [ModelKey, Scope, QueryParams],
  >(
    modelKey: ModelKey,
    scope: Scope,
    queryFn: QueryFunction<QueryData, QueryKey>,
    isQueryParams?: (value: unknown) => value is QueryParams,
    optionsDefault: DefaultQueryOptions<QueryData> = {},
  ) => {
  const withItemSetters = (query: UseQueryReturnTypeDefault<QueryData>, resolvedClient: QueryClient, queryKey: unknown[]) => {
    query.setItem = scope === 'single'
      ? (item: QueryScopeItem<QueryData>) => void query.setData(item as QueryData)
      : (item: QueryScopeItem<QueryData>) => setQueryItem(modelKey, item as QueryModel, resolvedClient)

    query.removeItem = scope === 'single'
      ? () => void resolvedClient.removeQueries({queryKey, exact: true})
      : (id: QueryModelId) => removeQueryItem(modelKey, id, resolvedClient)

    return query
  }

  const setItemStatic = (item: QueryScopeItem<QueryData>, queryClient?: QueryClient) => {
    if (scope !== 'single') return setQueryItem(modelKey, item as QueryModel, queryClient)

    void (queryClient ?? useQueryClient()).setQueriesData({queryKey: [modelKey, scope]}, item)
  }

  const removeItemStatic = (id: QueryModelId, queryClient?: QueryClient) => {
    if (scope !== 'single') return removeQueryItem(modelKey, id, queryClient)

    void (queryClient ?? useQueryClient()).removeQueries({queryKey: [modelKey, scope]})
  }

  if (isQueryParams) {
    const useFn = (
      queryParams: MaybeRef<QueryParams>,
      options: DefaultQueryOptions<QueryData> = {},
      queryClient?: QueryClient,
    ): UseQueryReturnTypeDefault<QueryData> => {
      const resolvedClient = queryClient ?? useQueryClient()

      const query = useQuery<QueryData, ApiError, QueryData, QueryKey>({
        queryKey: [modelKey, scope, queryParams],
        queryFn,

        ...optionsDefault,
        ...options,

        enabled: () => (query: Query<QueryData, ApiError, QueryData, QueryKey>) =>
          isQueryParams(unref(query.queryKey[2])) &&
          (!('enabled' in options) || toValue(options.enabled) === true) &&
          (!('enabled' in optionsDefault) || toValue(optionsDefault.enabled) === true),
      } as unknown as UseQueryOptions<QueryData, ApiError, QueryData, QueryData, QueryKey>) as UseQueryReturnTypeDefault<QueryData>

      query.setData = (data: QueryData) => resolvedClient.setQueriesData({queryKey: [modelKey, scope, queryParams]}, data)

      return withItemSetters(query, resolvedClient, [modelKey, scope, queryParams])
    }

    useFn.config = (queryParams: QueryParams, options: DefaultQueryOptions<QueryData> = {}) => ({
      queryKey: [modelKey, scope, queryParams],
      queryFn,

      ...optionsDefault,
      ...options,

      enabled: () => (query: Query<QueryData, ApiError, QueryData, QueryKey>) =>
        isQueryParams(unref(query.queryKey[2])) &&
          (!('enabled' in options) || toValue(options.enabled) === true) &&
          (!('enabled' in optionsDefault) || toValue(optionsDefault.enabled) === true),
    })

    useFn.setData = (data: QueryData, queryParams: MaybeRef<QueryParams>, queryClient?: QueryClient) => {
      const resolvedClient = queryClient ?? useQueryClient()

      return resolvedClient.setQueriesData({queryKey: [modelKey, scope, queryParams]}, data)
    }

    useFn.setItem = setItemStatic

    useFn.removeItem = removeItemStatic

    return useFn
  }

  const useFn = (
    queryParams?: undefined,
    options: DefaultQueryOptions<QueryData> = {},
    queryClient?: QueryClient,
  ): UseQueryReturnTypeDefault<QueryData> => {
    const resolvedClient = queryClient ?? useQueryClient()

    const query = useQuery<QueryData, ApiError, QueryData, QueryKey>({
      queryKey: [modelKey, scope],
      queryFn,

      ...optionsDefault,
      ...options,

      enabled: () =>
        (!('enabled' in options) || toValue(options.enabled) === true) &&
          (!('enabled' in optionsDefault) || toValue(optionsDefault.enabled) === true),
    } as unknown as UseQueryOptions<QueryData, ApiError, QueryData, QueryData, QueryKey>) as UseQueryReturnTypeDefault<QueryData>

    query.setData = (data: QueryData) => resolvedClient.setQueriesData({queryKey: [modelKey, scope]}, data)

    return withItemSetters(query, resolvedClient, [modelKey, scope])
  }

  useFn.config = (queryParams?: undefined, options: DefaultQueryOptions<QueryData> = {}) => ({
    queryKey: [modelKey, scope],
    queryFn,

    ...optionsDefault,
    ...options,

    enabled: () =>
      (!('enabled' in options) || toValue(options.enabled) === true) &&
          (!('enabled' in optionsDefault) || toValue(optionsDefault.enabled) === true),
  })

  useFn.setData = (data: QueryData, queryParams?: undefined, queryClient?: QueryClient) => {
    const resolvedClient = queryClient ?? useQueryClient()

    return resolvedClient.setQueriesData({queryKey: [modelKey, scope]}, data)
  }

  useFn.setItem = setItemStatic

  useFn.removeItem = removeItemStatic

  return useFn
}) as unknown as CreateDefaultQuery

export const paginateList = <Data>(list: Data[], page = 1, pageLength = PAGE_LENGTH): PaginatedResponse<Data> => {
  const current = Math.max(page, 1)
  const pages_count = Math.max(Math.ceil(list.length / pageLength), 1)

  if (current > pages_count) throw new ApiError({status: 404} as RequestResponse<unknown>)

  return {
    count: list.length,
    pages_count,
    current,
    next: pages_count > current ? current + 1 : null,
    previous: current !== 1 ? current - 1 : null,
    results: list.slice(pageLength * (current - 1), pageLength * current),
  }
}

export const makeQueryPaginated = <Data extends QueryModel, QueryParams extends {page?: number}>(
  modelKey: string,
  getter: (queryParams: QueryParams) => Data[] | undefined,
  setter?: (data: Data[]) => void,
  pageLength = PAGE_LENGTH,
) => {
  const useQueryPaginated = createDefaultQuery(
    modelKey,
    'paginated',
    (query): Promise<PaginatedResponse<Data>> => {
      return new Promise((resolve, reject) => {
        const queryParams = unref(query.queryKey[2])
        const currentList = getter(queryParams)

        if (!currentList) return resolve(null as never)

        try {
          resolve(paginateList(currentList, queryParams.page, pageLength))
        } catch (error) {
          reject(error)
        }
      })
    },
    (value: unknown): value is QueryParams => value instanceof Object,
  )

  const setSourceItem = (id: QueryModelId, item: Data | undefined) => {
    if (!setter) return

    const currentList = getter({} as QueryParams)
    const newList = setListItem(currentList, id, item)

    if (newList && newList !== currentList) setter(newList)
  }

  return Object.assign(
    (...args: Parameters<typeof useQueryPaginated>): UseQueryReturnTypeDefault<PaginatedResponse<Data>> => {
      const query = useQueryPaginated(...args)
      const {setItem, removeItem} = query

      query.setItem = item => {
        setSourceItem(item.id, item)
        setItem(item)
      }

      query.removeItem = id => {
        setSourceItem(id, undefined)
        removeItem(id)
      }

      return query
    },
    {
      config: useQueryPaginated.config,
      setData: useQueryPaginated.setData,

      setItem: (item: Data, queryClient?: QueryClient) => {
        setSourceItem(item.id, item)
        useQueryPaginated.setItem(item, queryClient)
      },

      removeItem: (id: QueryModelId, queryClient?: QueryClient) => {
        setSourceItem(id, undefined)
        useQueryPaginated.removeItem(id, queryClient)
      },
    },
  ) as typeof useQueryPaginated
}

export const wrapUseQueryPaginated = <Data extends QueryModel, QueryParams extends {page?: number}>(
  modelKey: string,
  useQueryFn: UseQueryDefaultFn<Data[], undefined>,
  pageLength = PAGE_LENGTH,
): UseQueryDefaultFn<PaginatedResponse<Data>, QueryParams> => {
  return (queryParams, options = {}, queryClient) => {
    const query = useQueryFn(undefined, options as unknown as DefaultQueryOptions<Data[]>, queryClient)

    const newQuery = makeQueryPaginated<Data, QueryParams>(
      modelKey,
      () => query.data.value,
      data => void query.setData(data),
      pageLength,
    )(queryParams, options, queryClient)

    watch(query.data, () => {
      newQuery.refetch()
    })

    return newQuery
  }
}
