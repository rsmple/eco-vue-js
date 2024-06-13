
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

declare type ValidateFn = (value: string | number | undefined | string[]) => string | undefined

declare type InputType = 'number' | 'text' | 'tel' | 'search' | 'password' | 'email' | 'search' | 'url'

declare module 'eco-vue-js/dist/assets/icons/*' {
  import type {FunctionalComponent, SVGAttributes} from 'vue'
  const src: FunctionalComponent<SVGAttributes>
  export default src
}

declare type DefaultData = {id: number, [key: string]: unknown}

type Params = Parameters<import('@tanstack/vue-query').QueryClient['setQueriesData']>

declare type UseQueryDefault<TQueryFnData = unknown, TError = DefaultQueryConfig['ApiError'], TData = TQueryFnData, TQueryKey extends import('@tanstack/vue-query').QueryKey = import('@tanstack/vue-query').QueryKey> =
  typeof import('@/utils/useDefaultQuery').useDefaultQuery<TQueryFnData, TError, TData, TQueryKey>

declare type QueryOptions<Data, Error = DefaultQueryConfig['ApiError']> = Partial<Parameters<typeof import('@/utils/useDefaultQuery').useDefaultQuery<Data, Error>>[0]>

declare type UseQueryEmpty<Model, ApiError> = (options?: QueryOptions<Model, ApiError>) => ReturnType<typeof import('@/utils/useDefaultQuery').useDefaultQuery<Model, ApiError>>

declare type UseQueryWithParams<Model, ApiError, QueryParams> =
  (queryParams: import('vue').MaybeRef<QueryParams>, options?: QueryOptions<Model, ApiError>) => ReturnType<typeof import('@/utils/useDefaultQuery').useDefaultQuery<Model, ApiError>>

declare type UseQueryPaginated<Model, ApiError, QueryParams> = UseQueryWithParams<PaginatedResponse<Model>, ApiError, QueryParams>
