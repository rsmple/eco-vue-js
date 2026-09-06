import {type Query, type QueryClient, type QueryFunction, type UseQueryOptions, type UseQueryReturnType, useQuery, useQueryClient} from '@tanstack/vue-query'
import {type MaybeRef, toValue, unref, watch} from 'vue'

import {ApiError} from './api'
import {type QueryModel, type QueryModelId, type QueryScope, type QueryScopeItem, type QueryScopeModel, removeQueryItem, setListItem, setQueryItem} from './queryCache'

export type {QueryItemUpdater, QueryModel, QueryModelId, QueryScope, QueryScopeItem, QueryScopeModel} from './queryCache'
export {removeQueryItem, removeQueryItems, setQueryItem, setQueryItems, snapshotQueries, updateQueryItems} from './queryCache'

type SetQueriesDataResult = ReturnType<QueryClient['setQueriesData']>

export type DefaultQueryOptions<Data> = Omit<Partial<UseQueryOptions<Data, ApiError, Data>>, 'queryKey' | 'queryFn'>

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
  <ModelKey extends string, Scope extends QueryScope, Data extends QueryScopeModel<QueryModel>[Scope]>(
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

  <ModelKey extends string, Scope extends QueryScope, Data extends QueryScopeModel<QueryModel>[Scope], QueryParams>(
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
  const withItemSetters = (query: UseQueryReturnTypeDefault<QueryData>, resolvedClient: QueryClient) => {
    query.setItem = (item: QueryScopeItem<QueryData>) => setQueryItem(modelKey, item as QueryModel, resolvedClient)
    query.removeItem = (id: QueryModelId) => removeQueryItem(modelKey, id, resolvedClient)

    return query
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

      return withItemSetters(query, resolvedClient)
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

    useFn.setItem = (item: QueryScopeItem<QueryData>, queryClient?: QueryClient) => setQueryItem(modelKey, item as QueryModel, queryClient)

    useFn.removeItem = (id: QueryModelId, queryClient?: QueryClient) => removeQueryItem(modelKey, id, queryClient)

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

    return withItemSetters(query, resolvedClient)
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

  useFn.setItem = (item: QueryScopeItem<QueryData>, queryClient?: QueryClient) => setQueryItem(modelKey, item as QueryModel, queryClient)

  useFn.removeItem = (id: QueryModelId, queryClient?: QueryClient) => removeQueryItem(modelKey, id, queryClient)

  return useFn
}) as unknown as CreateDefaultQuery

export const PAGE_LENGTH = 24

/**
 * Paginates an in-memory list under `[modelKey, 'paginated']`, so a plain array can back the same components
 * as a server-paginated query. `setter`, when given, receives the source list on every item update, keeping
 * the array the `getter` reads from in sync with the cache.
 */
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

        const current = Math.max(queryParams.page ?? 1, 1)
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

/**
 * Paginates the result of a list query under `[modelKey, 'paginated']` and keeps it in sync with the source list.
 */
export const wrapUseQueryPaginated = <Data extends QueryModel, QueryParams extends {page?: number}>(
  modelKey: string,
  useQueryFn: UseQueryDefaultFn<Data[], undefined>,
  pageLength = PAGE_LENGTH,
): UseQueryDefaultFn<PaginatedResponse<Data>, QueryParams> => {
  return (queryParams, options = {}, queryClient) => {
    const query = useQueryFn(undefined, options as DefaultQueryOptions<Data[]>, queryClient)

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

// Test types

type ResposeData = {
  id: number
  name: string
}

// Item

const useQueryDockerCredentials = createDefaultQuery(
  'DOCKER_CREDENTIALS',
  'item',
  (query) => Promise.resolve<ResposeData>({id: query.queryKey[2], name: '123'}), // /docker-credentials/${id}
  (value: unknown): value is number => Number.isFinite(value),
)

const queryDockerCredentials = useQueryDockerCredentials(1)

queryDockerCredentials.setData({id: 2, name: '123'})
queryDockerCredentials.setItem({id: 2, name: '123'})
queryDockerCredentials.removeItem(2)
useQueryDockerCredentials.setData({id: 2, name: '123'}, 1)
useQueryDockerCredentials.setItem({id: 2, name: '123'})

export const configDockerCredentials = useQueryDockerCredentials.config(1)

// List

const useQueryDockerCredentialsList = createDefaultQuery(
  'DOCKER_CREDENTIALS',
  'list',
  () => Promise.resolve<ResposeData[]>([{id: 1, name: '123'}]), // /docker-credentials/
)

useQueryDockerCredentialsList.setData([{id: 2, name: '123'}])
useQueryDockerCredentialsList.setItem({id: 2, name: '123'})

const queryDockerCredentialsList = useQueryDockerCredentialsList(undefined)

queryDockerCredentialsList.setData([{id: 2, name: '123'}])
queryDockerCredentialsList.setItem({id: 2, name: '123'})
export const configDockerCredentialsList = useQueryDockerCredentialsList.config()

// Item nested

const useQueryDockerCredentialsProduct = createDefaultQuery(
  'DOCKER_CREDENTIALS_PRODUCT',
  'item',
  (query) => Promise.resolve<ResposeData & {product: number}>({id: query.queryKey[2].id, name: '123', product: query.queryKey[2].product}), // /products/${product}/docker-credentials/${id}
  (value: unknown): value is {id: number, product: number} => value instanceof Object && 'id' in value && 'product' in value,
)

const queryDockerCredentialsProduct = useQueryDockerCredentialsProduct({id: 1, product: 2})

queryDockerCredentialsProduct.setData({id: 1, name: 'product', product: 2})
useQueryDockerCredentialsProduct.setData({id: 1, name: 'product', product: 2}, {id: 1, product: 2})

export const configDockerCredentialsProduct = useQueryDockerCredentialsProduct.config({id: 1, product: 2})

// List nested

const useQueryDockerCredentialsProductList = createDefaultQuery(
  'DOCKER_CREDENTIALS_PRODUCT',
  'list',
  (query) => Promise.resolve<(ResposeData & {product: number})[]>([{id: 1, name: '123', product: query.queryKey[2].product}]), // /products/${product}/docker-credentials/
  (value: unknown): value is {product: number} => value instanceof Object && 'product' in value,
)

useQueryDockerCredentialsProductList.setData([{id: 2, name: '123', product: 2}], {product: 2})

const queryDockerCredentialsProductList = useQueryDockerCredentialsProductList({product: 2})

// `product` is required now that `Data` is inferred from `queryFn` - it was silently accepted while `Model` collapsed
queryDockerCredentialsProductList.setData([{id: 2, name: '123', product: 2}])
queryDockerCredentialsProductList.setItem({id: 2, name: '123', product: 2})
export const configDockerCredentialsProductList = useQueryDockerCredentialsProductList.config({product: 2})

// Paginated

const useQueryDockerCredentialsPaginated = createDefaultQuery(
  'DOCKER_CREDENTIALS',
  'paginated',
  (query) => Promise.resolve<PaginatedResponse<ResposeData>>({
    count: 1,
    pages_count: 1,
    current: query.queryKey[2].page ?? 1,
    next: null,
    previous: null,
    results: [{id: 1, name: '123'}],
  }), // /docker-credentials/?page=${page}
  (value: unknown): value is {page?: number} => value instanceof Object,
)

const queryDockerCredentialsPaginated = useQueryDockerCredentialsPaginated({page: 1})

queryDockerCredentialsPaginated.setItem({id: 2, name: '123'})
queryDockerCredentialsPaginated.removeItem(2)
useQueryDockerCredentialsPaginated.setItem({id: 2, name: '123'})

export const configDockerCredentialsPaginated = useQueryDockerCredentialsPaginated.config({page: 1})

// In-memory paginated

const useQueryDockerCredentialsMemory = makeQueryPaginated<ResposeData, {page?: number}>(
  'DOCKER_CREDENTIALS_MEMORY',
  () => [{id: 1, name: '123'}],
)

useQueryDockerCredentialsMemory.setItem({id: 2, name: '123'})
useQueryDockerCredentialsMemory.removeItem(2)

export const useQueryDockerCredentialsWrapped = wrapUseQueryPaginated<ResposeData, {page?: number}>(
  'DOCKER_CREDENTIALS_WRAPPED',
  useQueryDockerCredentialsList,
)

// End test
