<template>
  <WExpansionItem
    v-if="!getItemProp(queryParams, item, 'hidden')"
    :title="getItemProp(queryParams, item, 'title')"
    :icon="getItemProp(queryParams, item, 'icon')"
    :is-open="isOpen"
    :has-flag="hasChanges"
    @toggle="$emit('toggle')"
  >
    <component
      :is="item"
      :query-params="queryParams"
      @update:query-params="$emit('update:query-params', $event)"
    />
  </WExpansionItem>
</template>

<script setup lang="ts" generic="QueryParams">
import type {FilterComponent} from '../types'

import {computed} from 'vue'

import WExpansionItem from '@/components/Expansion/WExpansionItem.vue'

import {getItemProp} from '../models/utils'

const props = defineProps<{
  item: FilterComponent<QueryParams>
  queryParams: QueryParams
  isOpen: boolean
}>()

defineEmits<{
  (e: 'update:query-params', value: QueryParams): void
  (e: 'toggle'): void
}>()

const hasChanges = computed(() => getItemProp(props.queryParams, props.item, 'fields')?.some(field => field in (props.queryParams as Record<string, unknown>)))

const getDefaultQuery = (): Partial<Record<keyof QueryParams, undefined>> => {
  return getItemProp(props.queryParams, props.item, 'fields')?.reduce<Partial<Record<keyof QueryParams, undefined>>>((result, field) => {
    result[field] = undefined
    return result
  }, {}) ?? {}
}

defineExpose({
  hasChanges,
  getDefaultQuery,
})
</script>