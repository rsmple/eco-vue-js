import type {UniformScope} from '../Uniform/types'
import type {ListMode} from '@/utils/utils'
import type {Component, Raw, StyleValue} from 'vue'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type FieldProps<Data, QueryParams = any> = {
  item: Data
  skeleton: boolean
  readonly: boolean
  card: boolean
  config: FieldConfig
  uniformScope: UniformScope<Data> | undefined
  queryParams: QueryParams
  results: Data[] | undefined
  intersecting: boolean
}

export type FieldComponent<Data, QueryParams> = Component<FieldProps<Data, QueryParams>>
export type ExpansionComponent<Data, QueryParams> = Component<Omit<FieldProps<Data | undefined, QueryParams>, 'config'>>

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
  field?: Extract<keyof Data, string> | ((params: QueryParams) => Extract<keyof Data, string> | undefined)
  visibleGetter?: (params: QueryParams) => boolean
  allowResize?: boolean
  sticky?: boolean
  textFormat?: (item: Data, queryParams: QueryParams) => string | undefined | Promise<string | undefined>
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

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type ListFieldNestedEntityGetter<Data, QueryParams = unknown, Inner = any> = {
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

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type ListFieldNestedArrayGetter<Data, QueryParams = unknown, Inner = any> = {
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
  | ListFieldExport<FieldComponent<Data, QueryParams>, ListField<Data, QueryParams>>

  | ListFieldExport<FieldComponent<Data, QueryParams>, ListFieldNested<Data, QueryParams>>

  | ListFieldExport<FieldComponent<Data, QueryParams>, ListFieldNestedEntity<Data, QueryParams>>
  | ListFieldExport<FieldComponent<Data, QueryParams>, ListFieldNestedEntityGetter<Data, QueryParams>>

  | ListFieldExport<FieldComponent<Data, QueryParams>, ListFieldNestedArray<Data, QueryParams>>
  | ListFieldExport<FieldComponent<Data, QueryParams>, ListFieldNestedArrayGetter<Data, QueryParams>>
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
  sticky: boolean
}

export type ColumnData = {
  style: StyleValue | undefined
  baseClass: Record<string, boolean | undefined>
  sticky: boolean
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
  scope: UniformScope<Data> | undefined
}

export type FilterProps<QueryParams> = {
  scope: UniformScope<QueryParams>
  global: boolean
  readonly: boolean
}

export type FilterMeta<QueryParams> = {
  fields?: Array<keyof QueryParams>
  title?: string | ((queryParams: QueryParams) => string)
  icon?: SVGComponent | ((queryParams: QueryParams) => SVGComponent)
  hidden?: boolean | ((queryParams: QueryParams) => boolean)
}

export type FilterEmits = {
  (e: 'close'): void
}

export type FilterComponent<QueryParams> = ListFieldExport<Component<FilterProps<QueryParams>>, FilterMeta<QueryParams>> | [
  ListFieldExport<Component<FilterProps<QueryParams>>, FilterMeta<QueryParams>>,
  {[Key in string]?: Key extends keyof Pick<FilterProps<QueryParams>, 'scope'>
      ? never
      : Key extends keyof FilterProps<QueryParams>
      ? FilterProps<QueryParams>[Key]
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      : any
  },
]
