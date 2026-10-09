<template>
  <component
    :is="global ? ListFilterGlobal : ListFilterLocal"
    :scope="scope"
    :filter="filter"
    :filter-search="filterSearch"
    :pinned="pinned ?? []"
    :search="search === true"
    :disabled-filter-fields="disabledFilterFields ?? []"
    :readonly="readonly ?? false"
  />
</template>

<script lang="ts" setup generic="QueryParams">
import type {FilterComponent} from './types'
import type {UniformScope} from '../Uniform/types'

import ListFilterGlobal from './components/ListFilterGlobal.vue'
import ListFilterLocal from './components/ListFilterLocal.vue'

defineProps<{
  /** Scope of the Uniform form that holds the query params, usually synced with the route query. */
  scope: UniformScope<QueryParams>
  /** Filter components, one per filter, each with a `meta` export. A tuple adds props for it. */
  filter?: FilterComponent<QueryParams>[]
  /** Filters of `filter` always shown as chips, first, instead of behind "Add filter". Their remove button only clears them. */
  pinned?: FilterComponent<QueryParams>[]
  /** Component for the search field, instead of the default text search on `search`. */
  filterSearch?: FilterComponent<QueryParams>
  /** Query params that can't be changed, e.g. fixed by the page. Their filters are left out. */
  disabledFilterFields?: Array<keyof QueryParams>
  /** Adds a search field for the `search` query param. */
  search?: boolean
  /** Puts the filters in the actions bar's filter panel and the search in the header bar, instead of in a row in place. */
  global?: boolean
  /** Shows the filters without changing them. */
  readonly?: boolean
  /** @deprecated No effect: the search field is always shown in place, and behind the header's search button with `global` */
  searchVisible?: boolean
}>()
</script>
