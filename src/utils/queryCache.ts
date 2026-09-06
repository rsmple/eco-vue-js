import {type QueryClient, useQueryClient} from '@tanstack/vue-query'

export type QueryModelId = number | string

export type QueryModel = {id: QueryModelId}

export type QueryScope = 'item' | 'list' | 'paginated'

export type QueryScopeModel<Model> = {
  item: Model
  list: Model[]
  paginated: PaginatedResponse<Model>
}

export type QueryScopeItem<Data> = Data extends PaginatedResponse<infer Item>
  ? Item
  : Data extends (infer Item)[]
    ? Item
    : Data

/**
 * Returns the item to keep in the cache, `null` to drop it, or the item itself to leave the query untouched.
 */
export type QueryItemUpdater<Model> = (item: Model) => Model | null

type QueryFilters = Parameters<QueryClient['setQueriesData']>[0]

const updateList = <Model extends QueryModel>(
  list: Model[] | undefined,
  ids: Set<QueryModelId> | undefined,
  updater: QueryItemUpdater<Model>,
): Model[] | undefined => {
  if (!list) return undefined

  const result: Model[] = []
  let changed = false

  list.forEach(item => {
    if (ids && !ids.has(item.id)) {
      result.push(item)

      return
    }

    const updated = updater(item)

    if (updated !== item) changed = true
    if (updated) result.push(updated)
  })

  return changed ? result : list
}

export const setListItem = <Model extends QueryModel>(list: Model[] | undefined, id: QueryModelId, item: Model | undefined): Model[] | undefined => {
  return updateList(list, new Set([id]), () => item ?? null)
}

/**
 * Applies `updater` to the cached items of the model across all scopes - to every one of them when `ids` is
 * `undefined` - keeping the paginated `count` in sync and dropping item queries whose item the updater removed.
 * Only updates what is already cached: nothing is seeded.
 */
export const updateQueryItems = <Model extends QueryModel>(
  modelKey: string,
  ids: Iterable<QueryModelId> | undefined,
  updater: QueryItemUpdater<Model>,
  queryClient?: QueryClient,
): void => {
  const resolvedClient = queryClient ?? useQueryClient()
  const idSet = ids && new Set(ids)

  resolvedClient
    .getQueriesData<Model>({queryKey: [modelKey, 'item' satisfies QueryScope]} as QueryFilters)
    .forEach(([queryKey, data]) => {
      if (!data || (idSet && !idSet.has(data.id))) return

      const updated = updater(data)

      if (updated === data) return

      if (updated) resolvedClient.setQueryData(queryKey, updated)
      else resolvedClient.removeQueries({queryKey, exact: true})
    })

  resolvedClient.setQueriesData<Model[]>(
    {queryKey: [modelKey, 'list' satisfies QueryScope]} as QueryFilters,
    data => updateList(data, idSet, updater),
  )

  resolvedClient.setQueriesData<PaginatedResponse<Model>>(
    {queryKey: [modelKey, 'paginated' satisfies QueryScope]} as QueryFilters,
    data => {
      if (!data) return undefined

      const results = updateList(data.results, idSet, updater)

      if (!results || results === data.results) return data

      return {
        ...data,
        count: Math.max(data.count - (data.results.length - results.length), 0),
        results,
      }
    },
  )
}

export const setQueryItems = <Model extends QueryModel>(modelKey: string, items: Model[], queryClient?: QueryClient): void => {
  const map = new Map(items.map(item => [item.id, item]))

  updateQueryItems<Model>(modelKey, map.keys(), item => map.get(item.id) ?? item, queryClient)
}

export const setQueryItem = <Model extends QueryModel>(modelKey: string, item: Model, queryClient?: QueryClient): void => {
  updateQueryItems<Model>(modelKey, [item.id], () => item, queryClient)
}

export const removeQueryItems = (modelKey: string, ids: Iterable<QueryModelId>, queryClient?: QueryClient): void => {
  updateQueryItems<QueryModel>(modelKey, ids, () => null, queryClient)
}

export const removeQueryItem = (modelKey: string, id: QueryModelId, queryClient?: QueryClient): void => {
  updateQueryItems<QueryModel>(modelKey, [id], () => null, queryClient)
}

/**
 * Captures the model`s cached data and returns a restore function, so an optimistic update can be rolled back
 * when the request it was applied for rejects.
 */
export const snapshotQueries = (modelKey: string, queryClient?: QueryClient): () => void => {
  const resolvedClient = queryClient ?? useQueryClient()
  const snapshot = resolvedClient.getQueriesData({queryKey: [modelKey]})

  return () => {
    snapshot.forEach(([queryKey, data]) => {
      resolvedClient.setQueryData(queryKey, data)
    })
  }
}
