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

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type FieldConfigMap<Fields extends ListField<any, any>[]> = Record<Fields[number]['label'], FieldConfig>
