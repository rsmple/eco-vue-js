import type {InputSuggestProps} from '@/components/Input/types'
import type {Component} from 'vue'

export type SelectOptionProps<Option> = {option: Option, selected?: boolean, model?: boolean}

export interface SelectOptionComponentProps<Option> {
  optionComponent?: Component<SelectOptionProps<Option>>
}

export interface SelectProps<Option extends string | number>
  extends Omit<InputSuggestProps<'text'>, 'modelValue' | 'allowClear' | 'hideInput'>,
  SelectOptionComponentProps<Option> {
  modelValue: Option[]
  search: string
  options: Option[]
  emptyStub?: string
  disableClear?: boolean
  hidePrefix?: boolean
  allowCreate?: boolean
  hideOptionIcon?: boolean
}

export interface SelectPrefixProps<Option extends string | number> {
  option: Option
  optionComponent?: Component<SelectOptionProps<Option>>
  disabled?: boolean
  loading?: boolean
  disableClear?: boolean
}

export interface SelectSingleProps<Option extends string | number, AllowClear extends boolean> extends Omit<SelectProps<Option>, 'modelValue' | 'disableClear'> {
  modelValue: Option | null
  allowClear?: boolean & AllowClear
  searchModel?: boolean
}

export interface SelectAsyncProps<Model extends number | string, Data extends DefaultData, ApiError, QueryParams>
  extends Omit<SelectProps<Model>, 'options' | 'optionComponent'>,
  SelectOptionComponentProps<Data> {
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

export interface SelectAsyncPrefixProps<Model extends number | string, Data extends DefaultData, ApiError, QueryParams>
  extends SelectOptionComponentProps<Data> {
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

export interface SelectAsyncPrefixPageProps<Model extends number | string, Data extends DefaultData, ApiError, QueryParams>
  extends SelectOptionComponentProps<Data> {
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

export interface SelectAsyncSingleProps<Model extends number | string, Data extends DefaultData, ApiError, QueryParams, AllowClear extends boolean>
  extends Omit<SelectAsyncProps<Model, Data, ApiError, QueryParams>, 'modelValue' | 'disableClear' | 'previewData' | 'createdData'> {
  modelValue: Model | null
  allowClear?: boolean & AllowClear
  searchModel?: boolean
  previewData?: Data
  createdData?: Data
}
