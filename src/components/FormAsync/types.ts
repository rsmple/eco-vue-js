import type {InputAsyncProps} from '@/components/Input/types'
import type {ToggleProps} from '@/components/Toggle/types'
import type {SelectOptionComponent, SelectProps, SelectSingleProps} from '@/components/Select/types'
import type {ButtonGroupProps} from '../Button/types'

/**
 * Input
 */

interface FormAsyncInputBaseProps<Model, FieldType extends string | number> extends Omit<InputAsyncProps<FieldType extends number ? 'number' : Exclude<InputType, 'number'>>, 'modelValue' | 'placeholderSecure'> {
  queryEnabled?: boolean
  field: keyof ObjectPaths<Model, FieldType, true>
  apiMethod: (payload: PartialNested<Model>) => Promise<RequestResponse<Model>>
  confimGetter?: (value: FieldType) => ConfirmProps | undefined
}

interface FormAsyncInputPropsWithParams<Model, FieldType extends string | number, QueryParams> extends FormAsyncInputBaseProps<Model, FieldType> {
  useQueryFn: UseQueryWithParams<Model, QueryParams>
  noParams?: never
  queryParams: QueryParams
}

interface FormAsyncInputPropsWithoutParams<Model, FieldType extends string | number> extends FormAsyncInputBaseProps<Model, FieldType> {
  useQueryFn: UseQueryEmpty<Model>
  noParams: true
  queryParams?: never
}

export type FormAsyncInputProps<Model, FieldType extends string | number, QueryParams> = FormAsyncInputPropsWithParams<Model, FieldType, QueryParams> | FormAsyncInputPropsWithoutParams<Model, FieldType>



/**
 * Toggle
 */

interface FormAsyncToggleBaseProps<Model, FieldType extends boolean | null> extends Omit<ToggleProps<FieldType>, 'modelValue'> {
  queryEnabled?: boolean
  field: keyof ObjectPaths<Model, FieldType, true>
  apiMethod: (payload: PartialNested<Model>) => Promise<RequestResponse<Model>>
  confimGetter?: (payload: FieldType) => ConfirmProps | undefined
  validate?: ValidateFn | ValidateFn[]
  negate?: boolean
}

interface FormAsyncTogglePropsWithParams<Model, FieldType extends boolean | null, QueryParams> extends FormAsyncToggleBaseProps<Model, FieldType> {
  useQueryFn: UseQueryWithParams<Model, QueryParams>
  noParams?: never
  queryParams: QueryParams
}

interface FormAsyncTogglePropsWithoutParams<Model, FieldType extends boolean | null> extends FormAsyncToggleBaseProps<Model, FieldType> {
  useQueryFn: UseQueryEmpty<Model>
  noParams: true
  queryParams?: never
}

export type FormAsyncToggleProps<Model, FieldType extends boolean | null, QueryParams> = FormAsyncTogglePropsWithParams<Model, FieldType, QueryParams> | FormAsyncTogglePropsWithoutParams<Model, FieldType>



/**
 * Select
 */

interface FormAsyncSelectBaseProps<
  Model,
  FieldType extends string | number,
  Data extends DefaultData, OptionComponent extends SelectOptionComponent<Data>,
> extends Omit<SelectProps<FieldType, Data, OptionComponent>, 'modelValue'> {
  queryEnabled?: boolean
  field: keyof ObjectPaths<Model, FieldType[], true>
  apiMethod: (payload: PartialNested<Model>) => Promise<RequestResponse<Model>>
  confimGetter?: (value: FieldType, isSelect: boolean) => ConfirmProps | undefined
}

interface FormAsyncSelectPropsWithParams<
  Model,
  FieldType extends string | number,
  QueryParams,
  Data extends DefaultData,
  OptionComponent extends SelectOptionComponent<Data>,
> extends FormAsyncSelectBaseProps<Model, FieldType, Data, OptionComponent> {
  useQueryFn: UseQueryWithParams<Model, QueryParams>
  noParams?: never
  queryParams: QueryParams
}

interface FormAsyncSelectPropsWithoutParams<
  Model,
  FieldType extends string | number,
  Data extends DefaultData,
  OptionComponent extends SelectOptionComponent<Data>,
> extends FormAsyncSelectBaseProps<Model, FieldType, Data, OptionComponent> {
  useQueryFn: UseQueryEmpty<Model>
  noParams: true
  queryParams?: never
}

export type FormAsyncSelectProps<
  Model,
  FieldType extends string | number,
  QueryParams, Data extends DefaultData,
  OptionComponent extends SelectOptionComponent<Data>,
> = FormAsyncSelectPropsWithParams<Model, FieldType, QueryParams, Data, OptionComponent> | FormAsyncSelectPropsWithoutParams<Model, FieldType, Data, OptionComponent>




/**
 * SelectSingle
 */

interface FormAsyncSelectSingleBaseProps<
  Model,
  FieldType extends string | number,
  Data extends DefaultData, OptionComponent extends SelectOptionComponent<Data>,
  AllowClear extends boolean = false
> extends Omit<SelectSingleProps<FieldType, Data, OptionComponent, AllowClear>, 'modelValue'> {
  queryEnabled?: boolean
  field: keyof ObjectPaths<Model, FieldType, true>
  apiMethod: (payload: PartialNested<Model>) => Promise<RequestResponse<Model>>
  confimGetter?: (value: FieldType) => ConfirmProps | undefined
}

interface FormAsyncSelectSinglePropsWithParams<
  Model,
  FieldType extends string | number,
  QueryParams,
  Data extends DefaultData,
  OptionComponent extends SelectOptionComponent<Data>,
  AllowClear extends boolean = false
> extends FormAsyncSelectSingleBaseProps<Model, FieldType, Data, OptionComponent, AllowClear> {
  useQueryFn: UseQueryWithParams<Model, QueryParams>
  noParams?: never
  queryParams: QueryParams
}

interface FormAsyncSelectSinglePropsWithoutParams<
  Model,
  FieldType extends string | number,
  Data extends DefaultData,
  OptionComponent extends SelectOptionComponent<Data>,
  AllowClear extends boolean = false
> extends FormAsyncSelectSingleBaseProps<Model, FieldType, Data, OptionComponent, AllowClear> {
  useQueryFn: UseQueryEmpty<Model>
  noParams: true
  queryParams?: never
}

export type FormAsyncSelectSingleProps<
  Model,
  FieldType extends string | number,
  QueryParams, Data extends DefaultData,
  OptionComponent extends SelectOptionComponent<Data>,
  AllowClear extends boolean = false
> = FormAsyncSelectSinglePropsWithParams<Model, FieldType, QueryParams, Data, OptionComponent, AllowClear> | FormAsyncSelectSinglePropsWithoutParams<Model, FieldType, Data, OptionComponent, AllowClear>



/**
 * ButtonGroup
 */

interface FormAsyncButtonGroupBaseProps<
  Model,
  FieldType extends string | number | boolean | null,
  Entity extends Record<string, unknown>,
  ValueGetter extends {fn(value: Entity): FieldType}['fn'] | undefined = undefined,
> extends Omit<ButtonGroupProps<FieldType, Entity, ValueGetter>, 'modelValue' | 'loading'> {
  queryEnabled?: boolean
  field: keyof ObjectPaths<Model, FieldType, true>
  apiMethod: (payload: PartialNested<Model>) => Promise<RequestResponse<Model>>
  confimGetter?: (value: FieldType) => ConfirmProps | undefined
}

interface FormAsyncButtonGroupPropsWithParams<
  Model,
  FieldType extends string | number | boolean | null,
  QueryParams,
  Entity extends Record<string, unknown>,
  ValueGetter extends {fn(value: Entity): FieldType}['fn'] | undefined = undefined,
> extends FormAsyncButtonGroupBaseProps<Model, FieldType, Entity, ValueGetter> {
  useQueryFn: UseQueryWithParams<Model, QueryParams>
  noParams?: never
  queryParams: QueryParams
}

interface FormAsyncButtonGroupPropsWithoutParams<
  Model,
  FieldType extends string | number | boolean | null,
  Entity extends Record<string, unknown>,
  ValueGetter extends {fn(value: Entity): FieldType}['fn'] | undefined = undefined,
> extends FormAsyncButtonGroupBaseProps<Model, FieldType, Entity, ValueGetter> {
  useQueryFn: UseQueryEmpty<Model>
  noParams: true
  queryParams?: never
}

export type FormAsyncButtonGroupProps<
  Model,
  FieldType extends string | number | boolean | null,
  QueryParams,
  Entity extends Record<string, unknown>,
  ValueGetter extends {fn(value: Entity): FieldType}['fn'] | undefined = undefined,
> = FormAsyncButtonGroupPropsWithParams<Model, FieldType, QueryParams, Entity, ValueGetter> | FormAsyncButtonGroupPropsWithoutParams<Model, FieldType, Entity, ValueGetter>
