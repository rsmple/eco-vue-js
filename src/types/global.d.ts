declare type SVGComponent = import('vue').Raw<import('vue').FunctionalComponent<import('vue').SVGAttributes, Record<string, never>>>

// eslint-disable-next-line @typescript-eslint/no-explicit-any
declare type ComponentInstance<T> = T extends new (...args: any[]) => infer R
  ? R
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  : T extends (...args: any[]) => infer R
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  ? R extends {__ctx?: infer K}
  ? Exclude<K, void> extends {expose: (...args: infer K) => void}
  ? K[0] & InstanceType<import('vue').DefineComponent>
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  : any
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  : any
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  : any

declare type PaginatedResponse<ValueType extends Record<string, unknown> | unknown = unknown> = {
  count: number
  pages_count: number
  next: number | null
  previous: number | null
  current: number
  results: ValueType[]
}

declare type EncodeQueryParam<T> = string extends T
? string
: number extends T
? T
: string

declare type EncodeQueryParams<T> = {
  [Key in keyof T]: EncodeQueryParam<T[Key]>
}

declare type ValidateFn = (value: string | number | undefined | string[] | boolean | null) => string | undefined

declare type InputType = 'number' | 'text' | 'tel' | 'search' | 'password' | 'email' | 'search' | 'url'

declare module 'eco-vue-js/dist/assets/icons/*' {
  import type {FunctionalComponent, SVGAttributes} from 'vue'

  const src: FunctionalComponent<SVGAttributes>
  export default src
}

declare type DefaultData = {id: number | string, [key: string]: unknown}

type Params = Parameters<import('@tanstack/vue-query').QueryClient['setQueriesData']>

declare type UseQueryDefault<TQueryFnData = unknown, TData = TQueryFnData, TQueryKey extends import('@tanstack/vue-query').QueryKey = import('@tanstack/vue-query').QueryKey> =
  typeof import('@/utils/useDefaultQuery').useDefaultQuery<TQueryFnData, TData, TQueryKey>

declare type QueryOptions<Data> = Partial<Parameters<typeof import('@/utils/useDefaultQuery').useDefaultQuery<Data>>[0]>

declare type UseQueryEmpty<Model> = (options?: QueryOptions<Model>) => ReturnType<typeof import('@/utils/useDefaultQuery').useDefaultQuery<Model>>

declare type UseQueryWithParams<Model, QueryParams> =
  (queryParams: import('vue').MaybeRef<QueryParams>, options?: QueryOptions<Model>) => ReturnType<typeof import('@/utils/useDefaultQuery').useDefaultQuery<Model>>

declare type UseQueryPaginated<Model, QueryParams> = UseQueryWithParams<PaginatedResponse<Model>, QueryParams>

declare interface SelectedPage<Value> {
  page: number
  index: number
  id: Value
}

declare type SelectedRange<Value> = [
  SelectedPage<Value>,
  SelectedPage<Value>,
]

declare type ConfirmProps = Omit<import('@/components/Modal/types').ConfirmModalProps, 'onAccept' | 'onCancel' | 'onIntermediate'>

declare type RequestData = Record<string, unknown> | Record<string, unknown>[] | FormData

declare type RequestConfig<Data extends RequestData = RequestData> = {
  data?: Data
  params?: Record<string, string | number | Record<string, unknown> | number[] | Record<string, unknown>[] | undefined>
  signal?: AbortSignal
  noAuth?: boolean
  updateToken?: boolean
}

declare type RequestResponse<Response, Data extends RequestData = RequestData> = {
  data: Response
  status?: number
  config?: RequestConfig<Data>
  request: Request
}

/**
 * UTILITY TYPES
 */

declare type OmitReqursive<Model extends object, Field extends keyof Model | string | number | symbol> = {
  [Key in Exclude<keyof Model, Field>]: Model[Key] extends object[]
  ? OmitReqursive<Model[Key][number], Field>[]
  : Model[Key] extends object
  ? OmitReqursive<Model[Key], Field>
  : Model[Key]
} & {[K in Field]: never}

declare type PickByType<Model, FieldType, IncludeNull = false> = {
  [
  Key in keyof Model as IncludeNull extends true
  ? Exclude<Model[Key], null | undefined> extends FieldType ? Key : never
  : Model[Key] extends FieldType ? Key : never
  ]: Model[Key]
}

declare type UnionToIntersection<T> =
  (T extends T ? (arg: T) => 0 : never) extends
  (arg: infer I) => 0
  ? I
  : never

declare type LastInUnion<U> =
  UnionToIntersection<
    U extends U ? (arg: U) => 0 : never
  > extends (arg: infer Last) => 0
  ? Last
  : never

declare type UnionToTuple<
  U,
  Last = LastInUnion<U>
> =
  [U] extends [never]
  ? []
  : [
    ...UnionToTuple<Exclude<U, Last>>,
    Last,
  ]

declare type ObjectKeys<O> = UnionToTuple<keyof O>

declare type PartialNested<T> = T extends unknown[]
  ? T
  : T extends object
  ? {
    [P in keyof T]?: PartialNested<T[P]> | undefined
  }
  : T

declare type Flatten<T> =
  T extends []
  ? []
  : T extends [infer Head, ...infer Tail]
  ? [...Flatten<Head>, ...Flatten<Tail>]
  : [T]

declare type FilterOut<T, Pred> =
  T extends [infer Head, ...infer Tail]
  ? [Head] extends [Pred]
  ? FilterOut<Tail, Pred>
  : [Head, ...FilterOut<Tail, Pred>]
  : []

declare type Split<Value extends string, Divider extends string> = Value extends `${ infer Start }${ Divider }${ infer End }`
  ? [...Split<Start, Divider>, ...Split<End, Divider>]
  : Value extends '' ? [] : [Value]

declare type Indexes<T> = Readonly<T> extends readonly [unknown, ...infer Tail]
  ? [...Indexes<Tail>, Tail['length']]
  : []

type PathsEntries<Model, FieldType, IncludeNull = false, ParentKey extends string = never, FilteredModel = PickByType<Model, FieldType, IncludeNull>> = ObjectKeys<Model> extends [infer Head, ...unknown[]]
  ? Head extends string
  ? Head extends keyof FilteredModel
  ? [
    [[ParentKey] extends [never] ? Head : `${ ParentKey }.${ Head }`, FilteredModel[Head]],
    ...PathsEntries<Omit<Model, Head>, FieldType, IncludeNull, ParentKey, FilteredModel>
  ]
  : Head extends keyof Model
  ? Model[Head] extends object
  ? [
    ...PathsEntries<Model[Head], FieldType, IncludeNull, Head>,
    ...PathsEntries<Omit<Model, Head>, FieldType, IncludeNull, ParentKey, FilteredModel>
  ]
  : PathsEntries<Omit<Model, Head>, FieldType, IncludeNull, ParentKey, FilteredModel>
  : []
  : []
  : []

declare type ObjectFromEntries<List> = {
  [KeyValue in List as KeyValue[0]]: KeyValue[1]
}

declare type ObjectPaths<Model, FieldType, IncludeNull = false> = ObjectFromEntries<PathsEntries<Model, FieldType, IncludeNull>[number]>

declare type IsTuple<T> = [T] extends [never]
  ? false
  : T extends unknown[]
  ? number extends T['length']
  ? false
  : true
  : false

declare type Join<Data, Separator extends string> = Data extends [infer Head, ...infer Tail]
  ? Head extends string
  ? Tail extends readonly string[]
  ? `${ Head }${ Separator }${ Join<Tail, Separator> }`
  : Head
  : Join<Tail, Separator>
  : ''