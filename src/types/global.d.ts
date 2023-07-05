
type DefineComponentFunction = typeof import('vue').defineComponent

declare type VueComponent = import('vue').Raw<typeof import('vue').DefineComponent<any, any, any>>
declare type SVGComponent = import('vue').Raw<import('vue').FunctionalComponent<import('vue').SVGAttributes, Record<string, never>>>

declare type PaginatedResponse<ValueType extends Record<string, unknown> = unknown> = {
  count: number
  pages_count: number
  next: number | null
  previous: number | null
  current: number
  results: ValueType[]
}

declare type ValidateFn = (value: string | number | undefined | string[]) => string | undefined

declare module '@whitespots/ui-kit/dist/assets/icons/*' {
  import type {FunctionalComponent, SVGAttributes} from 'vue'
  const src: FunctionalComponent<SVGAttributes>
  export default src
}

declare type DefaultData = Record<string, unknown> & {id: number}

type Params = Parameters<import('vue-query').QueryClient['setQueriesData']>

type Updater = (updater: Params[1], options?: Params[2]) => ReturnType<import('vue-query').QueryClient['setQueriesData']>

declare type QueryParams = Record<string, number | string> & {page: number}
declare type UseQueryFn = (queryParams: import('vue').Ref<QueryParams>, options?: Parameters<typeof import('vue-query').useQuery<PaginatedResponse<DefaultData>>>[2]) => import('vue-query').UseQueryReturnType<PaginatedResponse<DefaultData>, unknown>
declare type UseDefaultQueryFn = (queryParams: import('vue').Ref<QueryParams>, options?: Parameters<typeof import('vue-query').useQuery<PaginatedResponse<DefaultData>>>[2]) => import('vue-query').UseQueryReturnType<PaginatedResponse<DefaultData>, unknown> & {setData: Updater}
