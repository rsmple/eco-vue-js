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
  cssClass?: string
  field?: Extract<keyof Data, string> | ((params: QueryParams) => Extract<keyof Data, string>)
  visibleGetter?: (params: QueryParams) => boolean
  allowOpen?: boolean
  allowResize?: boolean
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
