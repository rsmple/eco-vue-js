import type {Component, Raw} from 'vue'

export type FieldComponent<Data> = Component<{
  item: Data
  skeleton?: boolean
  readonly?: boolean
}>

export type ListField<Data, QueryParams = unknown> = {
  component: Raw<FieldComponent<Data>>,
  title: string | ((item: QueryParams) => string),
  cssClass?: string,
  field?: keyof Data,
}

export type MenuComponent<Data> = Component<{
  item: Data
  readonly?: boolean
}>

export type BulkComponent<QueryParams> = Component<{
  queryParamsGetter: () => QueryParams
  selectionCount: number
  disableMessage?: string
}>
