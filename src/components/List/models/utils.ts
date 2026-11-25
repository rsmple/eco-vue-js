import type {FieldComponent, FilterComponent, FilterMeta, ListField, ListFieldExport, ListFields} from '../types'

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

export const isField = <Data, QueryParams>(field: ListFields<Data, QueryParams>[number]): field is ListFieldExport<FieldComponent<Data, QueryParams>, ListField<Data, QueryParams>> => {
  return !('fields' in field.meta)
}

const SKELETON_WIDTH_MIN = 40
const SKELETON_WIDTH_RANGE = 41

/**
 * Mirrors the 40-80% spread WSkeleton derives from its instance id, but without
 * mounting a component per cell - the placeholder is a plain element instead.
 */
export const getSkeletonWidth = (label: string, seed: number): number => {
  let hash = seed

  for (let i = 0; i < label.length; i++) {
    hash = ((hash << 5) - hash) + label.charCodeAt(i)
    hash = hash & hash
  }

  return Math.abs(hash % SKELETON_WIDTH_RANGE) + SKELETON_WIDTH_MIN
}
