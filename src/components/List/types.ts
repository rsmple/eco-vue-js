import type {ListMode} from '@/utils/utils'
import type {Component, Raw} from 'vue'

export type FieldProps<Data> = {
  item: Data
  skeleton: boolean
  readonly: boolean
  card: boolean
}

export type FieldComponent<Data> = Component<FieldProps<Data>>

export type FieldComponentItem<Data> = Component<{
  item: Data
  skeleton: boolean
  card: boolean
  index: number
  first: boolean
  last: boolean
}>

export type ListField<Data, QueryParams = unknown> = {
  title: string | ((params: QueryParams) => string)
  label: string
  cssClass?: string
  cssClassHeader?: string
  field?: Extract<keyof Data, string> | ((params: QueryParams) => Extract<keyof Data, string>)
  visibleGetter?: (params: QueryParams) => boolean
  allowResize?: boolean
  fixed?: boolean
}

export type ListFieldNested<Data, QueryParams = unknown> = {
  cssClass?: string
  fields: ListFields<Data, QueryParams>
}

export type ListFieldNestedEntity<Data, QueryParams = unknown, Key extends keyof PickByType<Data, NonNullable<unknown>> = keyof PickByType<Data, NonNullable<unknown>>> = {
  keyEntity: Key
  fields: Data[Key] extends NonNullable<infer Inner> ? ListFields<Inner, QueryParams> : []
  cssClass?: string
}

export type ListFieldNestedEntityGetter<Data, QueryParams = unknown, Inner = unknown> = {
  getterEntity: (data: Data) => Inner
  fields: ListFields<Inner, QueryParams>
  cssClass?: string
}

export type ListFieldNestedArray<Data, QueryParams = unknown, Key extends keyof PickByType<Data, Array<unknown>> = keyof PickByType<Data, Array<unknown>>> = {
  keyArray: Key
  fields: Data[Key] extends Array<infer Inner> ? ListFields<Inner, QueryParams> : []
  componentItem?: Data[Key] extends Array<infer Inner> ? Raw<FieldComponentItem<Inner>> : never
  cssClass?: string
  cssClassArray?: string
}

export type ListFieldNestedArrayGetter<Data, QueryParams = unknown, Inner = unknown> = {
  getterArray: (data: Data) => Inner[]
  fields: ListFields<Inner, QueryParams>
  componentItem?: Raw<FieldComponentItem<Inner>>
  cssClass?: string
  cssClassArray?: string
}

export type ListFieldExport<Component, Meta> = {
  default?: Component
  meta: Meta
}

export type ListFields<Data, QueryParams = unknown> = (
  | ListFieldExport<FieldComponent<Data>, ListField<Data, QueryParams>>

  | ListFieldExport<FieldComponent<Data>, ListFieldNested<Data, QueryParams>>

  | ListFieldExport<FieldComponent<Data>, ListFieldNestedEntity<Data, QueryParams>>
  | ListFieldExport<FieldComponent<Data>, ListFieldNestedEntityGetter<Data, QueryParams>>

  | ListFieldExport<FieldComponent<Data>, ListFieldNestedArray<Data, QueryParams>>
  | ListFieldExport<FieldComponent<Data>, ListFieldNestedArrayGetter<Data, QueryParams>>
)[]

export type MenuProps<Data> = {
  item: Data
  readonly: boolean
  updateItem: (newItem?: Data | undefined) => void
  deleteItem: () => void
}

export type MenuEmits<Data> = {
  (e: 'update:item', value: Data): void
  (e: 'delete:item'): void
}

export type MenuComponent<Data> = Component<MenuProps<Data>> | [
  Component<MenuProps<Data>>,
  {[Key in string]?: Key extends MenuProps<Data>
      ? never
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      : any
  },
]

export type BulkProps<QueryParams> = {
  queryParamsGetter: () => QueryParams
  selectionCount: number
  disableMessage: string | undefined
  readonly: boolean
}

export type BulkComponent<QueryParams> = Component<BulkProps<QueryParams>>

export type ActionProps<QueryParams> = {
  queryParams: QueryParams
  readonly: boolean
}

export type ActionComponent<QueryParams> = Component<ActionProps<QueryParams>>

export type FieldConfig = {
  width: number | null
  visible: boolean
  order: number
  fixed: boolean
}

type GetFieldLabelsTuple<Fields> = Fields extends [infer Head, ...infer Tail]
  ? Head extends ListFieldExport<unknown, {label: infer Label}>
  ? [Label, ...GetFieldLabelsTuple<Tail>]
  : Head extends ListFieldExport<unknown, {fields: infer InnerFields}>
  ? [...GetFieldLabelsTuple<InnerFields>, ...GetFieldLabelsTuple<Tail>]
  : GetFieldLabelsTuple<Tail>
  : []

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type GetFieldLabels<Fields extends ListFields<any, any>> = GetFieldLabelsTuple<Fields>[number]

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type FieldConfigMap<Fields extends ListFields<any, any>> = Record<GetFieldLabels<Fields>, FieldConfig>

export const AREA_SELECT = 'area_select'
export const AREA_MORE = 'area_more'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type CardAreas<Fields extends ListFields<any, any>, Length extends number> = (readonly (GetFieldLabels<Fields> | typeof AREA_SELECT | typeof AREA_MORE | '.')[] & { length: Length })[]

type GridColValue = 'auto' | '1fr' | `${ number }rem`
export type GridCol = GridColValue | `minmax(${ GridColValue }, ${ GridColValue })`

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type ListConfig<Fields extends ListFields<any, any>> = {
  fields: FieldConfigMap<Fields>
  mode: ListMode
}

export type CardActionParams<Data> = {
  item: Data
  setter: (value: Data) => void
}

export type FilterProps<QueryParams> = {
  queryParams: QueryParams
  global: boolean
  readonly: boolean
}

export type FilterMeta<QueryParams> = {
  fields?: Array<keyof QueryParams>
  title?: string | ((queryParams: QueryParams) => string)
  icon?: SVGComponent | ((queryParams: QueryParams) => SVGComponent)
  hidden?: boolean | ((queryParams: QueryParams) => boolean)
}

export type FilterEmits<QueryParams, Field extends keyof QueryParams> = {
  (e: 'update:query-params', value: Pick<QueryParams, Field>): void
  (e: 'close'): void
}

export type FilterComponent<QueryParams> = ListFieldExport<Component<FilterProps<QueryParams>>, FilterMeta<QueryParams>> | [
  ListFieldExport<Component<FilterProps<QueryParams>>, FilterMeta<QueryParams>>,
  {[Key in string]?: Key extends keyof Pick<FilterProps<QueryParams>, 'queryParams'>
      ? never
      : Key extends keyof FilterProps<QueryParams>
      ? FilterProps<QueryParams>[Key]
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      : any
  },
]
