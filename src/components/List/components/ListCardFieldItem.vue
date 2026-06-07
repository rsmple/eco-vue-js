<template>
  <component
    :is="field.default"
    :item="item"
    :readonly="readonly"
    :skeleton="skeleton"
    :card="card"
    :config="config"
    :uniform-scope="uniformScope"
    :query-params="queryParams"
    :results="results"
    :intersecting="intersecting"
    :class="[field.meta.cssClass, column.baseClass, column.sticky ? beforeClass : undefined]"
    :style="card && nested ? undefined : column.style"
    @update:item="(value: Data) => $emit('update:item', value)"
    @delete:item="$emit('delete:item')"
  />
</template>

<script setup lang="ts" generic="Data extends DefaultData, QueryParams">
import type {ColumnData, FieldComponent, FieldConfig, ListField, ListFieldExport} from '../types'
import type {UniformScope} from '@/components/Uniform/types'

defineProps<{
  field: ListFieldExport<FieldComponent<Data, QueryParams>, ListField<Data, QueryParams>>
  item: Data
  config: FieldConfig
  column: ColumnData
  skeleton: boolean
  card: boolean
  readonly: boolean
  uniformScope: UniformScope<Data> | undefined
  queryParams: QueryParams
  results: Data[] | undefined
  intersecting: boolean
  beforeClass: Record<string, boolean | undefined>
  nested: boolean
}>()

defineEmits<{
  (e: 'update:item', value: Data): void
  (e: 'delete:item'): void
}>()
</script>
