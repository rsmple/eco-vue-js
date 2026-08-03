import type {FieldComponent, ListField, ListFieldExport, ListFields} from '../types'

export const getMetaValue = <T, QueryParams>(getter: T | ((queryParams: QueryParams) => T), queryParams: QueryParams): T => {
  return getter instanceof Function ? getter(queryParams) : getter
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
