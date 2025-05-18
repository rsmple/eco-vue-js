import type {FieldComponent, FilterComponent, FilterProps, ListField, ListFieldExport, ListFields} from '../types'

export const getItemProp = <QueryParams, Key extends keyof FilterProps<QueryParams>>(queryParams: QueryParams, item: FilterComponent<QueryParams>, key: Key): FilterProps<QueryParams>[Key] | undefined => {
  if (Array.isArray(item)) {
    if (key in item[1]) {
      if (item[1][key] instanceof Function) return item[1][key]({queryParams})
      else return item[1][key]
    }

    return getItemProp<QueryParams, Key>(queryParams, item[0], key)
  }

  if (!('props' in item)) return

  if (item.props[key]?.default instanceof Function) return item.props[key].default({queryParams})
  else return item.props[key]?.default
}

export const isField = <Data, QueryParams>(field: ListFields<Data, QueryParams>[number]): field is ListFieldExport<FieldComponent<Data>, ListField<Data, QueryParams>> => {
  return !('fields' in field.meta)
}
