<template>
  <template v-if="hasFilterSummary(meta, queryParams)">
    <component
      :is="meta.summaryComponent"
      v-if="meta.summaryComponent"
      :query-params="queryParams"
      :limit="limit"
    />

    <WListFilterValues
      v-else-if="values"
      :values="values"
      :limit="limit"
    />
  </template>
</template>

<script setup lang="ts" generic="QueryParams">
import type {FilterComponent} from './types'

import {computed} from 'vue'

import WListFilterValues from './WListFilterValues.vue'
import {getFilterMeta, getFilterValues, hasFilterSummary} from './models/utils'

const props = defineProps<{
  /** The filter module, as listed in WListFilter's `filters`. */
  filter: FilterComponent<QueryParams>
  queryParams: QueryParams
  /** How many values to name before a "+N" badge. All of them when unset. */
  limit?: number
}>()

const meta = computed(() => getFilterMeta(props.filter))

const values = computed(() => getFilterValues(meta.value, props.queryParams))
</script>
