import type {QueryModel, QueryModelId, QueryScope} from './queryCache'
import type {QueryParamsListBulk, QueryParamsListBulkString, QueryParamsPage} from './queryParams'
import type {QueryClient, QueryKey} from '@tanstack/vue-query'

import {unref} from 'vue'

import {useQueryParamsListBulk} from './queryParams'
import {PAGE_LENGTH} from './useDefaultQuery'

type CollectionScope = Exclude<QueryScope, 'single' | 'item'>

type QueryKeyInfo<Model extends string = string> = {
  model: Model
  scope: CollectionScope
  params?: QueryParamsPage
}

const selectionParamKeys = new Set<string>(Object.keys(useQueryParamsListBulk.config))

const getQueryKeyInfo = <Model extends string>(queryKey: QueryKey): QueryKeyInfo<Model> | undefined => {
  const [model, scope, params] = queryKey as [Model, QueryScope, QueryParamsPage | undefined]

  if (typeof model !== 'string') return
  if (scope !== 'list' && scope !== 'paginated') return

  return {model, scope, params}
}

const normalizeValue = (value: unknown): unknown => {
  const unwrapped = unref(value)

  if (Array.isArray(unwrapped)) {
    const values = unwrapped
      .map(normalizeValue)
      .filter(valueInner => valueInner !== undefined)

    return values.every(item => typeof item === 'string' || typeof item === 'number')
      ? values.slice().sort()
      : values
  }

  if (unwrapped && typeof unwrapped === 'object') {
    const result: Record<string, unknown> = {}

    Object
      .keys(unwrapped)
      .sort()
      .forEach(key => {
        if (selectionParamKeys.has(key)) return

        const valueInner = normalizeValue((unwrapped as Record<string, unknown>)[key])

        if (valueInner === undefined || valueInner === '' || valueInner === null) return
        if (Array.isArray(valueInner) && valueInner.length === 0) return

        result[key] = valueInner
      })

    return result
  }

  return unwrapped
}

const isPaginatedResponse = <Model extends QueryModel>(value: unknown): value is PaginatedResponse<Model> => {
  return Boolean(value && typeof value === 'object' && 'results' in value && Array.isArray((value as PaginatedResponse<Model>).results))
}

export const getMatchingCollectionIds = <Model extends QueryModel, Params extends QueryParamsListBulk | QueryParamsListBulkString>(
  queryClient: QueryClient,
  model: string,
  params: Params,
): Set<QueryModelId> => {
  const ids = new Set<QueryModelId>()
  const collectionQueries = queryClient.getQueriesData<Model[] | PaginatedResponse<Model>>({queryKey: [model]})

  collectionQueries.forEach(([queryKey, data]) => {
    const queryKeyInfo = getQueryKeyInfo(queryKey)

    if (!queryKeyInfo || queryKeyInfo.model !== model) return
    if (JSON.stringify(normalizeValue(queryKeyInfo.params ?? {})) !== JSON.stringify(normalizeValue(params ?? {}))) return

    if (Array.isArray(data)) {
      if (params.id__not_in) {
        data.forEach(item => {
          if (!params.id__not_in?.includes(item.id as never)) ids.add(item.id)
        })
      }

      return
    }

    if (!isPaginatedResponse<Model>(data)) return

    data.results.forEach((item, index) => {
      if (params.id__not_in && !params.id__not_in.includes(item.id as never)) ids.add(item.id)

      if (params.slice_indexes) {
        const globalIndex = ((data.current - 1) * (queryKeyInfo.params?.size ?? PAGE_LENGTH)) + index

        if (globalIndex >= params.slice_indexes[0] && globalIndex <= params.slice_indexes[1]) ids.add(item.id)
      }
    })
  })

  return ids
}
