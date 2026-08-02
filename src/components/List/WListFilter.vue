<template>
  <component
    :is="global ? ListFilterGlobal : ListFilterLocal"
    :scope="scope"
    :filter="filter"
    :filter-search="filterSearch"
    :search="search === true"
    :disabled-filter-fields="disabledFilterFields ?? []"
    :title="title"
    :readonly="readonly ?? false"
    :search-visible="searchVisible ?? false"
  />
</template>

<script lang="ts" setup generic="QueryParams">
import type {FilterComponent} from './types'
import type {UniformScope} from '../Uniform/types'

import ListFilterGlobal from './components/ListFilterGlobal.vue'
import ListFilterLocal from './components/ListFilterLocal.vue'

defineProps<{
  scope: UniformScope<QueryParams>
  filter?: FilterComponent<QueryParams>[]
  filterSearch?: FilterComponent<QueryParams>
  disabledFilterFields?: Array<keyof QueryParams>
  search?: boolean
  global?: boolean
  title?: (count: number) => string
  readonly?: boolean
  searchVisible?: boolean
}>()
</script>
