import type {ButtonGroupProps} from '../Button/types'
import type {CheckboxGroupProps} from '../Checkbox/types'
import type {InputAsyncProps} from '@/components/Input/types'
import type {SelectAsyncSingleProps, SelectOptionComponent, SelectProps, SelectSingleProps, SelectStringifiedProps} from '@/components/Select/types'
import type {ToggleProps} from '@/components/Toggle/types'

type FormAsyncPropsBase<Model, FieldType> = {
  queryEnabled?: boolean
  field: keyof ObjectPaths<Model, FieldType, true>
  apiMethod: (payload: PartialNested<Model>) => Promise<RequestResponse<Model>>
  confimGetter?: (payload: FieldType) => ConfirmProps | undefined
}

interface FormAsyncPropsWithParams<Model, FieldType, QueryParams> extends FormAsyncPropsBase<Model, FieldType> {
  useQueryFn: UseQueryWithParams<Model, QueryParams>
  noParams?: never
  queryParams: QueryParams
}

interface FormAsyncPropsNoParams<Model, FieldType> extends FormAsyncPropsBase<Model, FieldType> {
  useQueryFn: UseQueryEmpty<Model>
  noParams: true
  queryParams?: never
}

export type FormAsyncProps<Model, FieldType, QueryParams> = FormAsyncPropsWithParams<Model, FieldType, QueryParams> | FormAsyncPropsNoParams<Model, FieldType>

/**
 * Input
 */

export type FormAsyncInputProps<Model, FieldType extends string | number, QueryParams> =
  & Omit<InputAsyncProps<FieldType extends number ? 'number' : Exclude<InputType, 'number'>>, 'modelValue' | 'placeholderSecure'>
  & FormAsyncProps<Model, FieldType, QueryParams>

/**
 * Toggle
 */

export type FormAsyncToggleProps<Model, FieldType extends boolean | null, QueryParams> = 
  & Omit<ToggleProps<FieldType>, 'modelValue'>
  & FormAsyncProps<Model, FieldType, QueryParams>

/**
 * Select
 */

export type FormAsyncSelectProps<
  Model,
  FieldType extends string[] | number[],
  QueryParamsOptions,
  QueryParams,
  Data extends DefaultData,
  OptionComponent extends SelectOptionComponent<Data>,
> = 
  & Omit<SelectProps<FieldType[number], Data, QueryParamsOptions, OptionComponent>, 'modelValue'>
  & FormAsyncProps<Model, FieldType, QueryParams>

/**
 * SelectSingle
 */

export type FormAsyncSelectSingleProps<
  Model,
  FieldType extends string | number,
  QueryParamsOptions,
  QueryParams, Data extends DefaultData,
  OptionComponent extends SelectOptionComponent<Data>,
  AllowClear extends boolean = false
> = 
  & Omit<SelectSingleProps<FieldType, Data, QueryParamsOptions, OptionComponent, AllowClear>, 'modelValue'>
  & FormAsyncProps<Model, FieldType, QueryParams>

/**
 * SelectStringified
 */

export type FormAsyncSelectStringifiedProps<
  Model,
  FieldType extends string,
  QueryParamsOptions,
  QueryParams, Data extends DefaultData,
  OptionComponent extends SelectOptionComponent<Data>,
> = 
  & Omit<SelectStringifiedProps<FieldType, Data, QueryParamsOptions, OptionComponent>, 'modelValue'>
  & FormAsyncProps<Model, FieldType, QueryParams>

/**
 * SelectInfiniteSingle
 */

export type FormAsyncSelectInfiniteSingleProps<
  Model,
  FieldType extends string | number,
  QueryParamsOptions,
  QueryParams,
  Data extends DefaultData,
  OptionComponent extends SelectOptionComponent<Data>,
  AllowClear extends boolean = false
> = 
  & Omit<SelectAsyncSingleProps<FieldType, Data, QueryParamsOptions, OptionComponent, AllowClear>, 'modelValue'>
  & FormAsyncProps<Model, FieldType, QueryParams>

/**
 * ButtonGroup
 */

export type FormAsyncButtonGroupProps<
  Model,
  FieldType extends string | number | boolean | null,
  QueryParams,
  Entity extends Record<string, unknown>,
  ValueGetter extends {fn(value: Entity): FieldType}['fn'] | undefined = undefined,
> = 
  & Omit<ButtonGroupProps<FieldType, Entity, ValueGetter>, 'modelValue'>
  & FormAsyncProps<Model, FieldType, QueryParams>

/**
  * CheckboxGroup
*/
  
export type FormAsyncCheckboxGroupProps<
  Model,
  FieldType extends string | number | boolean | null,
  QueryParams,
  Entity extends Record<string, unknown>,
  ValueGetter extends {fn(value: Entity): FieldType}['fn'] | undefined = undefined,
> = 
  & Omit<CheckboxGroupProps<FieldType, Entity, ValueGetter>, 'modelValue'>
  & FormAsyncProps<Model, FieldType, QueryParams>
