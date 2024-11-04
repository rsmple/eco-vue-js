import type {Component, Raw} from 'vue'

export type FieldComponent<Data> = Component<{
  item: Data
  skeleton: boolean
  readonly: boolean
  mobile: boolean
}>

export type FieldComponentNested<Data> = Component<{
  item: Data
  skeleton: boolean
  mobile: boolean
}>

export type FieldComponentItem<Data> = Component<{
  item: Data
  skeleton: boolean
  mobile: boolean
  index: number
  first: boolean
  last: boolean
}>

export type ListField<Data, QueryParams = unknown> = {
  component: Raw<FieldComponent<Data>>
  title: string | ((params: QueryParams) => string)
  label: string
  cssClass?: string
  field?: Extract<keyof Data, string> | ((params: QueryParams) => Extract<keyof Data, string>)
  visibleGetter?: (params: QueryParams) => boolean
  allowResize?: boolean
}

export type ListFieldNested<Data, QueryParams = unknown> = {
  cssClass?: string
  fields: ListFields<Data, QueryParams>
}

type FieldNestedEntity<Data, QueryParams = unknown, Key extends keyof PickByType<Data, NonNullable<unknown>> = keyof PickByType<Data, NonNullable<unknown>>> = {
  keyEntity: Key,
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
  keyArray: Key,
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

export type MenuComponent<Data> = Component<{
  item: Data
  readonly: boolean
  updateItem: (newItem?: Data | undefined) => void
  deleteItem: () => void
}>

export type BulkComponent<QueryParams> = Component<{
  queryParamsGetter: () => QueryParams
  selectionCount: number
  disableMessage: string | undefined
}>

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
