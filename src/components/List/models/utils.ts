import type {FilterComponent, FilterProps} from '../types'

export const getItemProp = <QueryParams, Key extends keyof FilterProps<QueryParams>>(queryParams: QueryParams, item: FilterComponent<QueryParams>, key: Key): FilterProps<QueryParams>[Key] | undefined => {
  if (!('props' in item)) return

  if (item.props[key]?.default instanceof Function) return item.props[key].default({queryParams})
  else return item.props[key]?.default
}
