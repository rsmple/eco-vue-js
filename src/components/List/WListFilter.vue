<template>
  <component
    :is="global ? ListFilterGlobal : ListFilterLocal"
    :filter="filter"
    :filter-search="filterSearch"
    :query-params="queryParams"
    :search="search === true"
    :disabled-filter-fields="disabledFilterFields ?? []"
    v-bind="global ? undefined : {title}"
    @update:query-params="$emit('update:query-params', $event)"
  />
</template>

<script lang="ts" setup generic="QueryParams">
import type {FilterComponent} from './types'

import ListFilterGlobal from './components/ListFilterGlobal.vue'
import ListFilterLocal from './components/ListFilterLocal.vue'

defineProps<{
  queryParams: QueryParams
  filter?: FilterComponent<QueryParams>[]
  filterSearch?: FilterComponent<QueryParams>
  disabledFilterFields?: Array<keyof QueryParams>
  search?: boolean
  global?: boolean
  title?: (count: number) => string
}>()

defineEmits<{
  (e: 'update:query-params', value: QueryParams): void
}>()
</script>
