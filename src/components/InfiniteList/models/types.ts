import type {Ref} from 'vue'
import type {QueryClient, useQuery, UseQueryReturnType} from 'vue-query'

type Params = Parameters<QueryClient['setQueriesData']>

type Updater = (updater: Params[1], options?: Params[2]) => ReturnType<QueryClient['setQueriesData']>

export type QueryParams = Record<string, number | string> & {page: number}
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type UseQueryFn = (queryParams: Ref<QueryParams>, options?: Parameters<typeof useQuery<PaginatedResponse<any>>>[2]) => UseQueryReturnType<PaginatedResponse, unknown>
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type UseDefaultQueryFn = (queryParams: Ref<QueryParams>, options?: Parameters<typeof useQuery<PaginatedResponse<any>>>[2]) => UseQueryReturnType<PaginatedResponse, unknown> & {setData: Updater}
