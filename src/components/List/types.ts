import type {Component, Raw} from 'vue'

export type FieldComponent<Data> = Component<{
  item: Data
  skeleton?: boolean
  readonly?: boolean
  mobile?: boolean
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

type FieldNestedArray<Data, QueryParams = unknown, Key extends keyof PickByType<Data, Array<unknown>> = keyof PickByType<Data, Array<unknown>>> = {
  keyArray: Key,
  fields: Data[Key] extends Array<infer Inner> ? ListFields<Inner, QueryParams> : []
}

export interface ListFieldNestedArray<Data, QueryParams = unknown> extends FieldNestedArray<Data, QueryParams> {
  cssClass?: string
  cssClassArray?: string
  componentArray?: Raw<FieldComponent<Data>>
}

export type ListFields<Data, QueryParams = unknown> = (ListField<Data, QueryParams> | ListFieldNested<Data, QueryParams> | ListFieldNestedEntity<Data, QueryParams> | ListFieldNestedArray<Data, QueryParams>)[]

export type MenuComponent<Data> = Component<{
  item: Data
  readonly?: boolean
}>

export type BulkComponent<QueryParams> = Component<{
  queryParamsGetter: () => QueryParams
  selectionCount: number
  disableMessage?: string
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
