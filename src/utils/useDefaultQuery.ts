import {type Query, type QueryClient, type QueryFunction, type UseQueryOptions, type UseQueryReturnType, useQuery, useQueryClient} from '@tanstack/vue-query'
import {type MaybeRef, computed, isRef, toValue, unref, watch} from 'vue'

import {ApiError} from './api'
import {type QueryModel, type QueryModelId, type QueryScope, type QueryScopeItem, removeQueryItem, setListItem, setQueryItem} from './queryCache'

export const PAGE_LENGTH = 24

type SetQueriesDataResult = ReturnType<QueryClient['setQueriesData']>

type QueryOptionsObject<Data> = Exclude<UseQueryOptions<Data, ApiError, Data>, {value: unknown}>

export type DefaultQueryOptions<Data> = Omit<Partial<QueryOptionsObject<Data>>, 'queryKey' | 'queryFn'>

export const normalizeQueryParamsValue = <QueryParams>(value: QueryParams): QueryParams => {
  return value !== null && typeof value === 'object' && !Array.isArray(value) && Object.keys(value).length === 0
    ? undefined as QueryParams
    : value
}

export const normalizeQueryParams = <QueryParams>(queryParams: MaybeRef<QueryParams>): MaybeRef<QueryParams> => {
  return isRef(queryParams)
    ? computed(() => normalizeQueryParamsValue(queryParams.value))
    : normalizeQueryParamsValue(queryParams)
}

type QueryParamsArg<QueryParams> = undefined extends QueryParams
  ? [queryParams?: MaybeRef<QueryParams>]
  : [queryParams: MaybeRef<QueryParams>]

type QueryParamsArgValue<QueryParams> = undefined extends QueryParams
  ? [queryParams?: QueryParams]
  : [queryParams: QueryParams]

// The name closes the key so queries sharing a scope do not collide, leaving the scope prefix the cache updaters
// match on intact.
type QueryKeyName<Name> = [Name] extends [undefined] ? [] : [name: Name]

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
  <ModelKey extends string, Scope extends QueryScope, Name extends string | undefined, Data>(
    modelKey: ModelKey,
    scope: Scope,
    name: Name,
    queryFn: QueryFunction<Data, [ModelKey, Scope, ...QueryKeyName<Name>]>,
    isQueryParams?: undefined,
    options?: DefaultQueryOptions<Data>,
  ): {
    (
      queryParams?: MaybeRef<undefined>,
      options?: DefaultQueryOptions<Data>,
      queryClient?: QueryClient,
    ): UseQueryReturnTypeDefault<Data>
    config: (queryParams?: MaybeRef<undefined>, options?: DefaultQueryOptions<Data>) => {
      queryKey: [ModelKey, Scope, ...QueryKeyName<Name>]
      queryFn: QueryFunction<Data, [ModelKey, Scope, ...QueryKeyName<Name>]>
    }
    setData: (data: Data, queryParams?: MaybeRef<undefined>, queryClient?: QueryClient) => SetQueriesDataResult
    setItem: (item: QueryScopeItem<Data>, queryClient?: QueryClient) => void
    removeItem: (id: QueryModelId, queryClient?: QueryClient) => void
  }

  <ModelKey extends string, Scope extends QueryScope, Name extends string | undefined, Data, QueryParams>(
    modelKey: ModelKey,
    scope: Scope,
    name: Name,
    queryFn: QueryFunction<Data, [ModelKey, Scope, QueryParams, ...QueryKeyName<Name>]>,
    isQueryParams: (value: unknown) => value is QueryParams,
    options?: DefaultQueryOptions<Data>,
  ): {
    (
      ...args: [
        ...QueryParamsArg<QueryParams>,
        options?: DefaultQueryOptions<Data>,
        queryClient?: QueryClient,
      ]
    ): UseQueryReturnTypeDefault<Data>
    config: (...args: [...QueryParamsArgValue<QueryParams>, options?: DefaultQueryOptions<Data>]) => {
      queryKey: [ModelKey, Scope, QueryParams, ...QueryKeyName<Name>]
      queryFn: QueryFunction<Data, [ModelKey, Scope, QueryParams, ...QueryKeyName<Name>]>
      enabled: () => (query: Query<Data, ApiError, Data, [ModelKey, Scope, QueryParams, ...QueryKeyName<Name>]>) => boolean
    }
    setData: (...args: [data: Data, ...QueryParamsArg<QueryParams>, queryClient?: QueryClient]) => SetQueriesDataResult
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
    queryName: string | undefined,
    queryFn: QueryFunction<QueryData, QueryKey>,
    isQueryParams?: (value: unknown) => value is QueryParams,
    optionsDefault: DefaultQueryOptions<QueryData> = {},
  ) => {
  const nameKey = queryName === undefined ? [] : [queryName]

  const keyOf = (...params: unknown[]): unknown[] => [modelKey, scope, ...params, ...nameKey]

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

    void (queryClient ?? useQueryClient()).setQueriesData({queryKey: keyOf()}, item)
  }

  const removeItemStatic = (id: QueryModelId, queryClient?: QueryClient) => {
    if (scope !== 'single') return removeQueryItem(modelKey, id, queryClient)

    void (queryClient ?? useQueryClient()).removeQueries({queryKey: keyOf()})
  }

  if (isQueryParams) {
    // An empty params object and undefined address the same data, so they must not split the cache.
    // Only queries that accept undefined can collapse it — for the rest undefined keeps the query disabled.
    const acceptsEmptyParams = isQueryParams(undefined)

    const normalize = acceptsEmptyParams
      ? normalizeQueryParams<QueryParams>
      : (queryParams: MaybeRef<QueryParams>) => queryParams

    const normalizeValue = acceptsEmptyParams
      ? normalizeQueryParamsValue<QueryParams>
      : (queryParams: QueryParams) => queryParams

    const useFn = (
      queryParams: MaybeRef<QueryParams>,
      options: DefaultQueryOptions<QueryData> = {},
      queryClient?: QueryClient,
    ): UseQueryReturnTypeDefault<QueryData> => {
      const resolvedClient = queryClient ?? useQueryClient()
      const normalizedParams = normalize(queryParams)

      const query = useQuery<QueryData, ApiError, QueryData, QueryKey>({
        queryKey: keyOf(normalizedParams),
        queryFn,

        ...optionsDefault,
        ...options,

        enabled: () => (query: Query<QueryData, ApiError, QueryData, QueryKey>) =>
          isQueryParams(unref(query.queryKey[2])) &&
          (!('enabled' in options) || toValue(options.enabled) === true) &&
          (!('enabled' in optionsDefault) || toValue(optionsDefault.enabled) === true),
      } as unknown as UseQueryOptions<QueryData, ApiError, QueryData, QueryData, QueryKey>) as UseQueryReturnTypeDefault<QueryData>

      query.setData = (data: QueryData) => isQueryParams(unref(normalizedParams))
        ? resolvedClient.setQueriesData({queryKey: keyOf(normalizedParams)}, data)
        : []

      return withItemSetters(query, resolvedClient, keyOf(normalizedParams))
    }

    useFn.config = (queryParams: QueryParams, options: DefaultQueryOptions<QueryData> = {}) => ({
      queryKey: keyOf(normalizeValue(queryParams)),
      queryFn,

      ...optionsDefault,
      ...options,

      enabled: () => (query: Query<QueryData, ApiError, QueryData, QueryKey>) =>
        isQueryParams(unref(query.queryKey[2])) &&
        (!('enabled' in options) || toValue(options.enabled) === true) &&
        (!('enabled' in optionsDefault) || toValue(optionsDefault.enabled) === true),
    })

    useFn.setData = (data: QueryData, queryParams: MaybeRef<QueryParams>, queryClient?: QueryClient) => {
      const normalizedParams = normalize(queryParams)

      if (!isQueryParams(unref(normalizedParams))) return []

      const resolvedClient = queryClient ?? useQueryClient()

      return resolvedClient.setQueriesData({queryKey: keyOf(normalizedParams)}, data)
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
      queryKey: keyOf(),
      queryFn,

      ...optionsDefault,
      ...options,

      enabled: () =>
        (!('enabled' in options) || toValue(options.enabled) === true) &&
          (!('enabled' in optionsDefault) || toValue(optionsDefault.enabled) === true),
    } as unknown as UseQueryOptions<QueryData, ApiError, QueryData, QueryData, QueryKey>) as UseQueryReturnTypeDefault<QueryData>

    query.setData = (data: QueryData) => resolvedClient.setQueriesData({queryKey: keyOf()}, data)

    return withItemSetters(query, resolvedClient, keyOf())
  }

  useFn.config = (queryParams?: undefined, options: DefaultQueryOptions<QueryData> = {}) => ({
    queryKey: keyOf(),
    queryFn,

    ...optionsDefault,
    ...options,

    enabled: () =>
      (!('enabled' in options) || toValue(options.enabled) === true) &&
          (!('enabled' in optionsDefault) || toValue(optionsDefault.enabled) === true),
  })

  useFn.setData = (data: QueryData, queryParams?: undefined, queryClient?: QueryClient) => {
    const resolvedClient = queryClient ?? useQueryClient()

    return resolvedClient.setQueriesData({queryKey: keyOf()}, data)
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
    undefined,
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

    const useQueryPaginated = makeQueryPaginated<Data, QueryParams>(
      modelKey,
      () => query.data.value,
      data => void query.setData(data),
      pageLength,
    ) as unknown as UseQueryDefaultFn<PaginatedResponse<Data>, QueryParams>

    const newQuery = useQueryPaginated(queryParams, options, queryClient)

    watch(query.data, () => {
      newQuery.refetch()
    })

    return newQuery
  }
}
