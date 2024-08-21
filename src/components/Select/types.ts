import type {InputSuggestProps} from '@/components/Input/types'
import type {Component} from 'vue'

export type SelectOptionProps<Option> = {option: Option, selected?: boolean, model?: boolean}

export type SelectOptionComponent<Option> = Component<SelectOptionProps<Option>>

export interface SelectOptionComponentProps<Option, OptionComponent extends SelectOptionComponent<Option>> {
  optionComponent?: OptionComponent
  optionComponentProps?: OptionComponent extends Component<infer Props> ? Partial<Omit<Props, keyof SelectOptionProps<Option>>> : never
}

export interface SelectProps<Option extends string | number, OptionComponent extends SelectOptionComponent<Option>>
  extends Omit<InputSuggestProps<'text'>, 'modelValue' | 'allowClear' | 'hideInput'>,
  SelectOptionComponentProps<Option, OptionComponent> {
  modelValue: Option[]
  search: string
  options: Option[]
  emptyStub?: string
  disableClear?: boolean
  hidePrefix?: boolean
  allowCreate?: boolean
  hideOptionIcon?: boolean
}

export interface SelectPrefixProps<Option extends string | number, OptionComponent extends SelectOptionComponent<Option>>
  extends SelectOptionComponentProps<Option, OptionComponent> {
  option: Option
  disabled?: boolean
  loading?: boolean
  disableClear?: boolean
}

export interface SelectSingleProps<Option extends string | number, OptionComponent extends SelectOptionComponent<Option>, AllowClear extends boolean>
  extends Omit<SelectProps<Option, OptionComponent>, 'modelValue' | 'disableClear'> {
  modelValue: Option | null
  allowClear?: boolean & AllowClear
  searchModel?: boolean
}

export interface SelectAsyncProps<Model extends number | string, Data extends DefaultData, ApiError, QueryParams, OptionComponent extends SelectOptionComponent<Data>>
  extends Omit<SelectProps<Model, Component>, 'options' | 'optionComponent' | 'optionComponentProps'>,
  SelectOptionComponentProps<Data, OptionComponent> {
  useQueryFn: UseQueryPaginated<Data, ApiError, QueryParams>
  useQueryFnPrefix?: UseQueryPaginated<Data, ApiError, QueryParams>
  isInvalidPage: (error: unknown) => boolean
  queryParams: QueryParams
  previewData?: Data[]
  createdData?: Data[]
  valueGetter?: (data: Data) => Model
  valueQueryKey?: string
  queryOptions?: Partial<Parameters<UseQueryPaginated<Data, ApiError, QueryParams>>[1]>
}

export interface SelectAsyncPrefixProps<Model extends number | string, Data extends DefaultData, ApiError, QueryParams, OptionComponent extends SelectOptionComponent<Data>>
  extends SelectOptionComponentProps<Data, OptionComponent> {
  useQueryFn: UseQueryPaginated<Data, ApiError, QueryParams>
  modelValue: Model[]
  disabled?: boolean
  loading?: boolean
  disableClear?: boolean
  previewData?: Data[]
  createdData?: Data[]
  valueGetter: (value: Data) => Model
  valueQueryKey: string
  queryOptions?: Partial<Parameters<UseQueryPaginated<Data, ApiError, QueryParams>>[1]>
}

export interface SelectAsyncPrefixPageProps<Model extends number | string, Data extends DefaultData, ApiError, QueryParams, OptionComponent extends SelectOptionComponent<Data>>
  extends SelectOptionComponentProps<Data, OptionComponent> {
  useQueryFn: UseQueryPaginated<Data, ApiError, QueryParams>
  queryParams: QueryParams
  disabled?: boolean
  loading?: boolean
  disableClear?: boolean
  previewData?: Data[]
  createdData?: Data[]
  valueGetter: (value: Data) => Model
  queryOptions?: Partial<Parameters<UseQueryPaginated<Data, ApiError, QueryParams>>[1]>
}

export interface SelectAsyncSingleProps<Model extends number | string, Data extends DefaultData, ApiError, QueryParams, OptionComponent extends SelectOptionComponent<Data>, AllowClear extends boolean>
  extends Omit<SelectAsyncProps<Model, Data, ApiError, QueryParams, OptionComponent>, 'modelValue' | 'disableClear' | 'previewData' | 'createdData'> {
  modelValue: Model | null
  allowClear?: boolean & AllowClear
  searchModel?: boolean
  previewData?: Data
  createdData?: Data
}
