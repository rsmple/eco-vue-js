import type {Ref} from 'vue'
import type {QueryClient, useQuery, UseQueryReturnType} from 'vue-query'

export type DefaultData = Record<string, unknown> & {id: number}

type Params = Parameters<QueryClient['setQueriesData']>

type Updater = (updater: Params[1], options?: Params[2]) => ReturnType<QueryClient['setQueriesData']>

export type QueryParams = Record<string, number | string> & {page: number}
export type UseQueryFn = (queryParams: Ref<QueryParams>, options?: Parameters<typeof useQuery<PaginatedResponse<DefaultData>>>[2]) => UseQueryReturnType<PaginatedResponse<DefaultData>, unknown>
export type UseDefaultQueryFn = (queryParams: Ref<QueryParams>, options?: Parameters<typeof useQuery<PaginatedResponse<DefaultData>>>[2]) => UseQueryReturnType<PaginatedResponse<DefaultData>, unknown> & {setData: Updater}
