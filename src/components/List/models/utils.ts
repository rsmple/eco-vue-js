import type {FieldComponent, ListField, ListFieldExport, ListFields} from '../types'

export const getMetaValue = <T, QueryParams>(getter: T | ((queryParams: QueryParams) => T), queryParams: QueryParams): T => {
  return getter instanceof Function ? getter(queryParams) : getter
}

export const isField = <Data, QueryParams>(field: ListFields<Data, QueryParams>[number]): field is ListFieldExport<FieldComponent<Data>, ListField<Data, QueryParams>> => {
  return !('fields' in field.meta)
}
