import {createUseQueryParams} from './api'
import {parseId, parseIdList, parseSliceIndexes, parseString, parseStringList} from './utils'

export const useQueryParamsId = createUseQueryParams({
  id__in: parseIdList,
  id__not_in: parseIdList,
})

export type QueryParamsId = typeof useQueryParamsId['QueryParams']

export const useQueryParamsIdString = createUseQueryParams({
  id__in: parseStringList,
  id__not_in: parseStringList,
})

export type QueryParamsIdString = typeof useQueryParamsIdString['QueryParams']

export const useQueryParamsPage = createUseQueryParams({
  page: parseId,
  size: parseId,
  slice_indexes: parseSliceIndexes,
})

export type QueryParamsPage = typeof useQueryParamsPage['QueryParams']

export const useQueryParamsList = createUseQueryParams({
  ordering: parseString,

  ...useQueryParamsPage.config,
})

export type QueryParamsList = typeof useQueryParamsList['QueryParams']

export const useQueryParamsListBulk = createUseQueryParams({
  ...useQueryParamsId.config,
  ...useQueryParamsPage.config,
  ...useQueryParamsList.config,
})

export type QueryParamsListBulk = typeof useQueryParamsListBulk['QueryParams']

export const useQueryParamsListBulkString = createUseQueryParams({
  ...useQueryParamsIdString.config,
  ...useQueryParamsPage.config,
  ...useQueryParamsList.config,
})

export type QueryParamsListBulkString = typeof useQueryParamsListBulkString['QueryParams']
