import type {InputSuggestProps} from '@/components/Input/types'
import type {Component} from 'vue'

export type SelectOptionProps<Option> = {option: Option, selected?: boolean, model?: boolean, index?: number}

export type SelectOptionComponent<Option> = Component<SelectOptionProps<Option>>

export interface SelectOptionComponentProps<Option, OptionComponent extends SelectOptionComponent<Option>> {
  optionComponent?: OptionComponent
  optionComponentProps?: OptionComponent extends Component<infer Props> ? Partial<Omit<Props, keyof SelectOptionProps<Option>>> : never
}

export interface SelectProps<Model extends number | string, Data extends DefaultData, OptionComponent extends SelectOptionComponent<Data>>
  extends Omit<InputSuggestProps<'text'>, 'modelValue' | 'allowClear' | 'hideInput'>,
  SelectOptionComponentProps<Data, OptionComponent> {
  modelValue: Model[]
  useQueryFnOptions: UseQueryEmpty<Data[]>
  valueGetter: (value: Data) => Model
  searchFn: (option: Data, search: string) => boolean
  emptyStub?: string
  disableClear?: boolean
  hidePrefix?: boolean
  allowCreate?: boolean
  hideOptionIcon?: boolean
}

export interface SelectPrefixProps<Data extends DefaultData, OptionComponent extends SelectOptionComponent<Data>>
  extends SelectOptionComponentProps<Data, OptionComponent> {
  option: Data
  index?: number
  disabled?: boolean
  loading?: boolean
  disableClear?: boolean
}

export interface SelectSingleProps<Model extends number | string, Data extends DefaultData, OptionComponent extends SelectOptionComponent<Data>, AllowClear extends boolean>
  extends Omit<SelectProps<Model, Data, OptionComponent>, 'modelValue' | 'disableClear'> {
  modelValue: Model | null
  allowClear?: boolean & AllowClear
  searchModel?: boolean
}

export interface SelectAsyncProps<Model extends number | string, Data extends DefaultData, QueryParams, OptionComponent extends SelectOptionComponent<Data>>
  extends Omit<SelectProps<Model, Data, Component>, 'options' | 'optionComponent' | 'optionComponentProps' | 'searchFn' | 'useQueryFnOptions'>,
  SelectOptionComponentProps<Data, OptionComponent> {
  useQueryFnOptions: UseQueryPaginated<Data, QueryParams>
  useQueryFnPrefix?: UseQueryPaginated<Data, QueryParams>
  isInvalidPage: (error: unknown) => boolean
  queryParamsOptions: QueryParams
  searchField?: keyof QueryParams
  previewData?: Data[]
  createdData?: Data[]
  valueQueryKey?: string
}

export interface SelectAsyncPrefixProps<Model extends number | string, Data extends DefaultData, QueryParams, OptionComponent extends SelectOptionComponent<Data>>
  extends SelectOptionComponentProps<Data, OptionComponent> {
  useQueryFn: UseQueryPaginated<Data, QueryParams>
  modelValue: Model[]
  disabled?: boolean
  loading?: boolean
  disableClear?: boolean
  previewData?: Data[]
  createdData?: Data[]
  valueGetter: (value: Data) => Model
  valueQueryKey: string
}

export interface SelectAsyncPrefixPageProps<Model extends number | string, Data extends DefaultData, QueryParams, OptionComponent extends SelectOptionComponent<Data>>
  extends SelectOptionComponentProps<Data, OptionComponent> {
  useQueryFn: UseQueryPaginated<Data, QueryParams>
  queryParams: QueryParams
  disabled?: boolean
  loading?: boolean
  disableClear?: boolean
  previewData?: Data[]
  createdData?: Data[]
  valueGetter: (value: Data) => Model
}

export interface SelectAsyncSingleProps<Model extends number | string, Data extends DefaultData, QueryParams, OptionComponent extends SelectOptionComponent<Data>, AllowClear extends boolean>
  extends Omit<SelectAsyncProps<Model, Data, QueryParams, OptionComponent>, 'modelValue' | 'disableClear' | 'previewData' | 'createdData'> {
  modelValue: Model | null
  allowClear?: boolean & AllowClear
  searchModel?: boolean
  previewData?: Data
  createdData?: Data
}
