import type {InputSuggestProps} from '@/components/Input/types'
import type {Component} from 'vue'

export type SelectOptionProps<Option> = {
  option: Option | undefined
  selected?: boolean
  model?: boolean
  index?: number
  search?: string | undefined
  skeleton?: boolean
}

export type SelectOptionComponent<Option> = Component<SelectOptionProps<Option>>

export interface SelectOptionComponentProps<Option, OptionComponent extends SelectOptionComponent<Option>> {
  /** Component that renders an option, in the menu and in the selected chips. Receives `option`, `selected`, `model` and `search`. The `option` slot replaces it. */
  optionComponent?: OptionComponent
  /** Extra props passed to every `optionComponent`. */
  optionComponentProps?: OptionComponent extends Component<infer Props> ? Partial<Omit<Props, keyof SelectOptionProps<Option>>> : never
}

interface SelectPropsNoParams<Data extends DefaultData> {
  /** Query that loads the options. Takes `queryParamsOptions` when the query has parameters. Use either this or `options`. */
  useQueryFnOptions: UseQueryDefault<Data[], unknown>
  queryParamsOptions?: never
  options?: never
}

interface SelectPropsWithParams<Data extends DefaultData, QueryParams> {
  /** Query that loads the options. Takes `queryParamsOptions` when the query has parameters. Use either this or `options`. */
  useQueryFnOptions: UseQueryDefault<Data[], QueryParams>
  /** Parameters for `useQueryFnOptions`. */
  queryParamsOptions: QueryParams
  options?: never
}

interface SelectPropsWithOptions<Data extends DefaultData> {
  /** Static list of options, instead of loading them with `useQueryFnOptions`. */
  options: Data[]
  useQueryFnOptions?: never
  queryParamsOptions?: never
}

type SelectPropsOptions<Data extends DefaultData, QueryParams> = SelectPropsNoParams<Data> | SelectPropsWithParams<Data, QueryParams> | SelectPropsWithOptions<Data>

export interface SelectProps<Model extends number | string, Data extends DefaultData, QueryParams, OptionComponent extends SelectOptionComponent<Data>>
  extends Omit<InputSuggestProps<'text'>, 'modelValue' | 'allowClear' | 'clearValue' | 'async' | 'debounce' | 'hideDebounce'>,
  SelectOptionComponentProps<Data, OptionComponent>,
  Omit<SelectPropsOptions<Data, QueryParams>, 'modelValue'> {
  /** Selected values. The component does not change it — update it from `select` and `unselect`. */
  modelValue: Model[] | undefined
  /** Gets the value stored in the model from an option. */
  valueGetter: (value: Data) => Model
  /** Tells whether an option matches the typed search, which is trimmed and lowercased. */
  searchFn: (option: Data, search: string) => boolean
  /** Query that loads a default option. When it resolves while nothing is selected, the option is selected and `init-model` is emitted. */
  useQueryFnDefault?: UseQueryDefault<Data, undefined>
  /** Selects the first loaded option while nothing is selected, and emits `init-model`. */
  useFirstDefault?: boolean
  /** Shown in the menu instead of "Nothing to show" when there are no options and no search. */
  emptyStub?: string
  /** Hides the remove button on the selected chips. */
  disableClear?: boolean
  /** Hides the selected chips while the menu is open, leaving room to type. */
  hidePrefix?: boolean
  /** Adds a "New:" option for the typed search. Return the created option to select it, or `undefined` to cancel. */
  createOption?: (search: string) => (Data | undefined) | Promise<Data | undefined>
  /** Hides options for which it returns `false`. */
  filterOptions?: (option: Data) => boolean
  /** Hides the check mark next to selected options in the menu. */
  hideOptionIcon?: boolean
  /** Options to add to the loaded ones — for selected values the query does not return, such as ones created elsewhere. */
  createdData?: Data[]
  /** Commits the typed text when the menu closes — selects the option matching it exactly, or creates one with `createOption`. In a single select, the selected value is also put into the search text on focus, so it can be edited. For string values. */
  searchModel?: boolean
  /** Waits until the menu is first opened before loading the options. */
  lazy?: boolean
  /** Placeholder while nothing is selected and the field is not focused. Defaults to `placeholder`. */
  placeholderEmpty?: string
  /** Puts the cursor on the first selected option when the menu opens, so Enter toggles it — by default the menu only scrolls to it. Always set in the single selects. */
  cursorSelected?: boolean
}

export interface SelectPrefixProps<Data extends DefaultData, OptionComponent extends SelectOptionComponent<Data>>
  extends SelectOptionComponentProps<Data, OptionComponent> {
  option: Data | undefined
  search: string | number | undefined
  index: number
  disabled: boolean | undefined
  readonly: boolean | undefined
  loading: boolean | undefined
  disableClear: boolean | undefined
}

export type SelectClearValue = null | undefined | ''

export interface SelectSingleProps<Model extends number | string, Data extends DefaultData, QueryParams, OptionComponent extends SelectOptionComponent<Data>, AllowClear extends boolean, ClearValue extends SelectClearValue = null>
  extends Omit<SelectProps<Model, Data, QueryParams, OptionComponent>, 'modelValue' | 'disableClear' | 'createdData' | 'cursorSelected'> {
  /** Selected value. */
  modelValue: Model | ClearValue | null | undefined
  /** Adds a button that clears the value, emitting `clearValue`. */
  allowClear?: boolean & AllowClear
  /** Value emitted when cleared. Defaults to `null`; set it explicitly to emit `undefined` or `''`. */
  clearValue?: ClearValue
  /** Option to add to the loaded ones — for a selected value the query does not return, such as one created elsewhere. */
  createdData?: Data
}

export interface SelectStringifiedProps<Model extends string, Data extends DefaultData, QueryParams, OptionComponent extends SelectOptionComponent<Data>>
  extends Omit<SelectProps<Model, Data, QueryParams, OptionComponent>, 'modelValue'> {
  /** Picked values in one string, joined by `divider`. */
  modelValue: Model | null | undefined
  /** Separator between the values, e.g. `,`, or `json` for a JSON array of strings. */
  divider: string | 'json'
}

export interface SelectAsyncProps<Model extends number | string, Data extends DefaultData, QueryParams, OptionComponent extends SelectOptionComponent<Data>>
  extends Omit<SelectProps<Model, Data, QueryParams, Component>, 'options' | 'optionComponent' | 'optionComponentProps' | 'searchFn' | 'useQueryFnOptions' | 'queryParamsOptions' | 'filterOptions' | 'useFirstDefault'>,
  SelectOptionComponentProps<Data, OptionComponent> {
  /** Paginated query that loads the options, page by page as the menu scrolls. The search text is sent in `searchField`. */
  useQueryFnOptions: UseQueryDefault<PaginatedResponse<Data>, QueryParams>
  /** Paginated query that loads the selected options for the chips. Defaults to `useQueryFnOptions`. */
  useQueryFnPrefix?: UseQueryDefault<PaginatedResponse<Data>, QueryParams>
  /** Parameters for `useQueryFnOptions`. */
  queryParamsOptions: QueryParams
  /** Query parameter that receives the search text. Defaults to `search`. */
  searchField?: keyof QueryParams
  /** Selected options, used for the chips instead of loading them. */
  previewData?: Data[]
  /** Query parameter that receives the selected values, comma-separated, when loading the chips. */
  valueQueryKey?: string
  /** Word after the count shown instead of chips when more than `prefixMax` values are selected. Defaults to "items". */
  prefixText?: string
  /** Most selected values shown as chips; above it, a count with a clear-all button is shown instead. */
  prefixMax?: number
  /** Shows the check mark on options that are not selected instead of those that are — for a select that picks what to exclude. */
  reverse?: boolean
}

export interface SelectAsyncPrefixProps<Model extends number | string, Data extends DefaultData, QueryParams, OptionComponent extends SelectOptionComponent<Data>>
  extends SelectOptionComponentProps<Data, OptionComponent> {
  useQueryFn: UseQueryDefault<PaginatedResponse<Data>, QueryParams>
  modelValue: Model[]
  disabled: boolean | undefined
  loading: boolean | undefined
  disableClear: boolean | undefined
  previewData: Data[] | undefined
  createdData: Data[] | undefined
  valueGetter: (value: Data) => Model
  valueQueryKey: string
  readonly: boolean | undefined
  prefixText: string | undefined
  prefixMax: number
  knownData: Map<string, Data>
}

export interface SelectAsyncPrefixPageProps<Model extends number | string, Data extends DefaultData, QueryParams, OptionComponent extends SelectOptionComponent<Data>>
  extends SelectOptionComponentProps<Data, OptionComponent> {
  useQueryFn: UseQueryDefault<PaginatedResponse<Data>, QueryParams>
  queryParams: QueryParams
  values: Model[]
  knownData: Map<string, Data>
  disabled?: boolean
  loading?: boolean
  disableClear?: boolean
  previewData?: Data[]
  createdData?: Data[]
  valueGetter: (value: Data) => Model
  readonly: boolean | undefined
}

export interface SelectAsyncSingleProps<Model extends number | string, Data extends DefaultData, QueryParams, OptionComponent extends SelectOptionComponent<Data>, AllowClear extends boolean, ClearValue extends SelectClearValue = null>
  extends Omit<SelectAsyncProps<Model, Data, QueryParams, OptionComponent>, 'modelValue' | 'disableClear' | 'previewData' | 'createdData' | 'cursorSelected'> {
  /** Selected value. */
  modelValue: Model | ClearValue | null
  /** Adds a button that clears the value, emitting `clearValue`. */
  allowClear?: boolean & AllowClear
  /** Value emitted when cleared. Defaults to `null`; set it explicitly to emit `undefined` or `''`. */
  clearValue?: ClearValue
  /** Selected option, shown in the field instead of loading it. */
  previewData?: Data
  /** Option to add to the loaded ones — for a selected value the query does not return, such as one created elsewhere. */
  createdData?: Data
}
