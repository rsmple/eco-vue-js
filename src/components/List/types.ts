import type {ListMode} from '@/utils/utils'
import type {Component, Raw} from 'vue'

export type FieldProps<Data> = {
  item: Data
  skeleton: boolean
  readonly: boolean
  card: boolean
}

export type FieldComponent<Data> = Component<FieldProps<Data>>

export type FieldComponentNested<Data> = Component<{
  item: Data
  skeleton: boolean
  card: boolean
}>

export type FieldComponentItem<Data> = Component<{
  item: Data
  skeleton: boolean
  card: boolean
  index: number
  first: boolean
  last: boolean
}>

export type ListField<Data, QueryParams = unknown> = {
  component: Raw<FieldComponent<Data>>
  title: string | ((params: QueryParams) => string)
  label: string
  cssClass?: string
  cssClassHeader?: string
  field?: Extract<keyof Data, string> | ((params: QueryParams) => Extract<keyof Data, string>)
  visibleGetter?: (params: QueryParams) => boolean
  allowResize?: boolean
}

export type ListFieldNested<Data, QueryParams = unknown> = {
  cssClass?: string
  fields: ListFields<Data, QueryParams>
}

type FieldNestedEntity<Data, QueryParams = unknown, Key extends keyof PickByType<Data, NonNullable<unknown>> = keyof PickByType<Data, NonNullable<unknown>>> = {
  keyEntity: Key
  fields: ListFields<Data[Key], QueryParams>
}

export interface ListFieldNestedEntity<Data, QueryParams = unknown> extends FieldNestedEntity<Data, QueryParams> {
  cssClass?: string
}

type FieldNestedEntityGetter<Data, QueryParams = unknown, Inner = unknown> = {
  getterEntity: (data: Data) => Inner
  fields: ListFields<Inner, QueryParams>
  componentItem?: Raw<FieldComponentItem<Inner>>
}

export interface ListFieldNestedEntityGetter<Data, QueryParams = unknown, Inner = unknown> extends FieldNestedEntityGetter<Data, QueryParams, Inner> {
  cssClass?: string
}

type FieldNestedArray<Data, QueryParams = unknown, Key extends keyof PickByType<Data, Array<unknown>> = keyof PickByType<Data, Array<unknown>>> = {
  keyArray: Key
  fields: Data[Key] extends Array<infer Inner> ? ListFields<Inner, QueryParams> : []
  componentItem?: Data[Key] extends Array<infer Inner> ? Raw<FieldComponentItem<Inner>> : never
}

export interface ListFieldNestedArray<Data, QueryParams = unknown> extends FieldNestedArray<Data, QueryParams> {
  cssClass?: string
  cssClassArray?: string
  componentArray?: Raw<FieldComponentNested<Data>>
}

type FieldNestedArrayGetter<Data, QueryParams = unknown, Inner = unknown> = {
  getterArray: (data: Data) => Inner[]
  fields: ListFields<Inner, QueryParams>
  componentItem?: Raw<FieldComponentItem<Inner>>
}

export interface ListFieldNestedArrayGetter<Data, QueryParams = unknown, Inner = unknown> extends FieldNestedArrayGetter<Data, QueryParams, Inner> {
  cssClass?: string
  cssClassArray?: string
  componentArray?: Raw<FieldComponentNested<Data>>
}

export type ListFields<Data, QueryParams = unknown> = (
  | ListField<Data, QueryParams>

  | ListFieldNested<Data, QueryParams>

  | ListFieldNestedEntity<Data, QueryParams>
  | ListFieldNestedEntityGetter<Data, QueryParams>

  | ListFieldNestedArray<Data, QueryParams>
  | ListFieldNestedArrayGetter<Data, QueryParams>
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

export type MenuComponent<Data> = Component<MenuProps<Data>>

export type BulkProps<QueryParams> = {
  queryParamsGetter: () => QueryParams
  selectionCount: number
  disableMessage: string | undefined
  readonly: boolean
}

export type BulkComponent<QueryParams> = Component<BulkProps<QueryParams>>

export type FieldConfig = {
  width: number | null
  visible: boolean
  order: number
}

type GetFieldLabelsTuple<Fields> = Fields extends [infer Head, ...infer Tail]
  ? Head extends {label: infer Label}
  ? [Label, ...GetFieldLabelsTuple<Tail>]
  : Head extends {fields: infer InnerFields}
  ? [...GetFieldLabelsTuple<InnerFields>, ...GetFieldLabelsTuple<Tail>]
  : GetFieldLabelsTuple<Tail>
  : []

export type GetFieldLabels<Fields extends ListFields<unknown>> = GetFieldLabelsTuple<Fields>[number]

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
  fields?: Array<keyof QueryParams>
  title?: string
  icon?: SVGComponent
  hidden?: boolean
}

export type FilterEmits<QueryParams, Field extends keyof QueryParams> = {
  (e: 'update:query-params', value: Pick<QueryParams, Field>): void
}

export type FilterComponent<QueryParams> = Component<FilterProps<QueryParams>>
