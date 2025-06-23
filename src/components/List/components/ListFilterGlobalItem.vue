<template>
  <WExpansionItem
    v-if="!getMetaValue(meta.hidden, queryParams) && !fields.some(field => disabledFilterFields.includes(field))"
    :title="getMetaValue(meta.title, queryParams)"
    :icon="getMetaValue(meta.icon, queryParams)"
    :is-open="isOpen"
    :has-flag="hasChanges"
    @toggle="$emit('toggle')"
  >
    
    <component
      :is="item[0].default"
      v-if="Array.isArray(item)"
      v-bind="item[1]"
      :query-params="queryParams"
      :readonly="readonly"
      global
      @update:query-params="$emit('update:query-params', $event)"
    />

    <component
      :is="item.default"
      v-else
      :query-params="queryParams"
      :readonly="readonly"
      global
      @update:query-params="$emit('update:query-params', $event)"
    />

    <WButton
      v-if="!readonly && hasChanges"
      :semantic-type="SemanticType.SECONDARY"
      :disabled="!hasChanges"
      class="mt-4 w-full"
      @click="$emit('update:query-params', getDefaultQuery())"
    >
      Reset
    </WButton>
  </WExpansionItem>
</template>

<script setup lang="ts" generic="QueryParams">
import type {FilterComponent} from '../types'

import {computed} from 'vue'

import WButton from '@/components/Button/WButton.vue'
import WExpansionItem from '@/components/Expansion/WExpansionItem.vue'

import {SemanticType} from '@/utils/SemanticType'

import {getMetaValue} from '../models/utils'

const props = defineProps<{
  item: FilterComponent<QueryParams>
  queryParams: QueryParams
  isOpen: boolean
  disabledFilterFields: Array<keyof QueryParams>
  readonly: boolean
}>()

defineEmits<{
  (e: 'update:query-params', value: Partial<QueryParams>): void
  (e: 'toggle'): void
}>()

const meta = computed(() => Array.isArray(props.item) ? props.item[0].meta : props.item.meta)

const fields = computed(() => meta.value.fields ?? [])

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