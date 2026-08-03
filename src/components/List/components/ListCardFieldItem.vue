<template>
  <div
    v-if="skeleton && !field.meta.customSkeleton"
    class="list:pr-3 list:first-not:pl-3 grid shrink-0 grid-cols-1"
    :class="[field.meta.cssClass, column.baseClass, beforeClass]"
    :style="card && nested ? undefined : column.style"
  >
    <div
      class="bg-primary-light dark:bg-primary-darkest w-skeleton w-skeleton-opacity-50 dark:w-skeleton-opacity-5 before:animate-ticker w-option-has-bg"
      :style="{'--skeleton-width-internal': skeletonWidth + '%'}"
    />
  </div>

  <component
    :is="field.default"
    v-else
    :item="item"
    :readonly="readonly"
    :skeleton="skeleton"
    :card="card"
    :config="config"
    :uniform-scope="uniformScope"
    :query-params="queryParams"
    :results="results"
    :intersecting="intersecting"
    :class="[field.meta.cssClass, column.baseClass, beforeClass]"
    :style="card && nested ? undefined : column.style"
    @update:item="(value: Data) => $emit('update:item', value)"
    @delete:item="$emit('delete:item')"
  />
</template>

<script setup lang="ts" generic="Data extends DefaultData, QueryParams">
import type {ColumnData, FieldComponent, FieldConfig, ListField, ListFieldExport} from '../types'
import type {UniformScope} from '@/components/Uniform/types'

import {computed} from 'vue'

import {getSkeletonWidth} from '../models/utils'

const props = defineProps<{
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
  position: number
  beforeClass: Record<string, boolean | undefined> | undefined
  nested: boolean
}>()

defineEmits<{
  (e: 'update:item', value: Data): void
  (e: 'delete:item'): void
}>()

const skeletonWidth = computed(() => getSkeletonWidth(props.field.meta.label, props.position))
</script>
