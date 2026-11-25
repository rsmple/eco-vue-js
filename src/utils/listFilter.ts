import type {FilterComponent, FilterMeta} from '@/components/List/types'

export const getMetaValue = <T, QueryParams>(getter: T | ((queryParams: QueryParams) => T), queryParams: QueryParams): T => {
  return getter instanceof Function ? getter(queryParams) : getter
}

export const getFilterMeta = <QueryParams>(filter: FilterComponent<QueryParams>): FilterMeta<QueryParams> => {
  return Array.isArray(filter) ? filter[0].meta : filter.meta
}

export const getFilterCount = <QueryParams>(meta: FilterMeta<QueryParams>, queryParams: QueryParams): number => {
  return (meta.fields ?? []).reduce((sum, field) => {
    const value = queryParams[field]

    if (Array.isArray(value)) return sum + value.length

    return value === undefined || value === null ? sum : sum + 1
  }, 0)
}

export const getFilterValues = <QueryParams>(meta: FilterMeta<QueryParams>, queryParams: QueryParams): string[] | undefined => {
  const summary = meta.summary?.(queryParams)

  if (summary === undefined) return undefined

  const list = Array.isArray(summary) ? summary : [summary]

  return list.length ? list : undefined
}

export const hasFilterSummary = <QueryParams>(meta: FilterMeta<QueryParams>, queryParams: QueryParams): boolean => {
  if (meta.summaryComponent) return getFilterCount(meta, queryParams) > 0

  return getFilterValues(meta, queryParams) !== undefined
}
