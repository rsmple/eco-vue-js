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
    :class="[field.meta.cssClass, cellClass]"
    :style="cellStyle"
    @update:item="(value: Data) => emit('update:item', value)"
    @delete:item="emit('delete:item')"
  />
</template>

<script setup lang="ts" generic="Data extends DefaultData, QueryParams">
import type {FieldComponent, FieldConfig, ListField, ListFieldExport} from '../types'
import type {UniformScope} from '@/components/Uniform/types'
import type {StyleValue} from 'vue'

import {computed} from 'vue'

import {getFieldVariable} from '../use/useListConfig'

const props = defineProps<{
  field: ListFieldExport<FieldComponent<Data, QueryParams>, ListField<Data, QueryParams>>
  item: Data
  config: FieldConfig
  skeleton: boolean
  card: boolean
  readonly: boolean
  uniformScope: UniformScope<Data> | undefined
  queryParams: QueryParams
  results: Data[] | undefined
  intersecting: boolean
  alignTop: boolean | undefined
  beforeClass: Record<string, boolean | undefined>
  nested: boolean
}>()

const emit = defineEmits<{
  (e: 'update:item', value: Data): void
  (e: 'delete:item'): void
}>()

const cellClass = computed<Record<string, boolean | undefined>>(() => {
  const sticky = !props.card && props.config?.sticky
  return {
    'items-center': !props.alignTop,
    'items-start': props.alignTop,
    'bg-default dark:bg-default-dark sticky z-[1]': sticky,
    ...(sticky ? props.beforeClass : {}),
  }
})

const cellStyle = computed<StyleValue | undefined>(() => {
  if (props.card) return !props.nested ? {gridArea: props.field.meta.label} : undefined

  const label = props.field.meta.label
  const sticky = props.config?.sticky

  return {
    minWidth: `var(${ getFieldVariable('width', label) })`,
    maxWidth: `var(${ getFieldVariable('width', label) })`,
    left: sticky ? `var(${ getFieldVariable('left', label) })` : undefined,
    right: sticky ? `var(${ getFieldVariable('right', label) })` : undefined,
  }
})
</script>
