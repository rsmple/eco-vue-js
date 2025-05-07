<template>
  <WExpansionItem
    v-if="!getItemProp(queryParams, item, 'hidden') && !fields.some(field => disabledFilterFields.includes(field))"
    :title="getItemProp(queryParams, item, 'title')"
    :icon="getItemProp(queryParams, item, 'icon')"
    :is-open="isOpen"
    :has-flag="hasChanges"
    @toggle="$emit('toggle')"
  >
    
    <component
      :is="item[0]"
      v-if="Array.isArray(item)"
      v-bind="item[1]"
      :query-params="queryParams"
      :readonly="readonly"
      global
      @update:query-params="$emit('update:query-params', $event)"
    />

    <component
      :is="item"
      v-else
      :query-params="queryParams"
      :readonly="readonly"
      global
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
  disabledFilterFields: Array<keyof QueryParams>
  readonly: boolean
}>()

defineEmits<{
  (e: 'update:query-params', value: QueryParams): void
  (e: 'toggle'): void
}>()

const fields = computed(() => getItemProp(props.queryParams, props.item, 'fields') ?? [])

const hasChanges = computed(() => fields.value.some(field => field in (props.queryParams as Record<string, unknown>)))

const getDefaultQuery = (): Partial<Record<keyof QueryParams, undefined>> => {
  return fields.value.reduce<Partial<Record<keyof QueryParams, undefined>>>((result, field) => {
    result[field] = undefined
    return result
  }, {}) ?? {}
}

defineExpose({
  hasChanges,
  getDefaultQuery,
})
</script>