import type {InputSuggestProps} from '@/components/Input/types'
import type {Component} from 'vue'

export interface SelectProps<Option extends string | number> extends Omit<InputSuggestProps<'text'>, 'modelValue' | 'allowClear' | 'hideInput'> {
  modelValue: Option[]
  search: string
  options: Option[]
  emptyStub?: string
  optionComponent?: Component<{option: Option, selected?: boolean, model?: boolean}>
  disableClear?: boolean
  hidePrefix?: boolean
  allowCreate?: boolean
  hideOptionIcon?: boolean
}

export interface SelectSingleProps<Option extends string | number, AllowClear extends boolean> extends Omit<SelectProps<Option>, 'modelValue' | 'disableClear'> {
  modelValue: Option | null
  allowClear?: boolean & AllowClear
  searchModel?: boolean
}

export interface SelectAsyncProps<Model extends number | string, Data extends DefaultData, ApiError, QueryParams>
  extends Omit<SelectProps<Model>, 'options' | 'optionComponent'> {
  useQueryFn: UseQueryPaginated<Data, ApiError, QueryParams>
  useQueryFnPrefix?: UseQueryPaginated<Data, ApiError, QueryParams>
  isInvalidPage: (error: unknown) => boolean
  queryParams: QueryParams
  optionComponent?: Component<{option: Data, selected?: boolean, model?: boolean}>
  previewData?: Data[]
  createdData?: Data[]
  valueGetter?: (data: Data) => Model
  valueQueryKey?: string
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
