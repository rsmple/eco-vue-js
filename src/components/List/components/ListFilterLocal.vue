<template>
  <div class="w-button-h-9 w-button-rounded-xl w-input-h-9 flex flex-wrap items-center gap-2 py-2 text-sm">
    <div
      v-if="searchComponent"
      class="w-52 max-w-full"
    >
      <component
        :is="searchComponent[0].default"
        v-if="Array.isArray(searchComponent)"
        v-bind="searchComponent[1]"
        :scope="scope"
        :readonly="readonly"
        :global="true"
      />

      <component
        :is="searchComponent.default"
        v-else
        :scope="scope"
        :readonly="readonly"
        :global="true"
      />
    </div>

    <ListFilterLocalItem
      v-for="item in shownList"
      :key="item.id"
      :scope="scope"
      :item="item.item"
      :is-open="openId === item.id"
      :readonly="readonly"
      @toggle="openId = openId === item.id ? null : item.id"
      @close="closeFilterItem(item)"
      @remove="removeFilterItem(item)"
    />

    <ListFilterSelect
      v-if="!readonly && allShown.length < filterList.length"
      :filter="filterAll"
      :exclude="excluded"
      :query-params="scope.modelValue"
      @select="selected.push($event); openId = filterList[$event].id"
    />
  </div>
</template>

<script setup lang="ts" generic="QueryParams">
import type {FilterComponent} from '../types'
import type {UniformScope} from '@/components/Uniform/types'

import {computed, ref, useId} from 'vue'

import ListFilterLocalItem from './ListFilterLocalItem.vue'
import * as ListFilterSearch from './ListFilterSearch.vue'
import ListFilterSelect from './ListFilterSelect.vue'

import {getMetaValue} from '../models/utils'

const props = defineProps<{
  scope: UniformScope<QueryParams>
  filter: FilterComponent<QueryParams>[] | undefined
  filterSearch: FilterComponent<QueryParams> | undefined
  search: boolean
  disabledFilterFields: Array<keyof QueryParams>
  title: ((count: number) => string) | undefined
  readonly: boolean
  searchVisible: boolean
}>()

const searchComponent: FilterComponent<QueryParams> | undefined = props.search ? props.filterSearch ?? ListFilterSearch : undefined

const filterAll = (props.filter ?? []).map(item => ({id: useId(), item}))

const openId = ref<string | null>(null)

const filterList = computed(() => {
  return filterAll.filter(item => {
    const meta = Array.isArray(item.item) ? item.item[0].meta : item.item.meta

    if (getMetaValue(meta.hidden, props.scope.modelValue)) return false

    const fields = meta.fields ?? []
    return !fields.some(field => props.disabledFilterFields.includes(field))
  }) ?? []
})

const shown = computed(() => filterList.value
  .filter(item => (Array.isArray(item.item) ? item.item[0].meta.fields : item.item.meta.fields)?.some(field => field in (props.scope.modelValue as Record<string, unknown>) && props.scope.modelValue[field] !== undefined))
  .map(item => filterAll.indexOf(item)))

const selected = ref<number[]>(shown.value.slice())

const allShown = computed(() => [...selected.value, ...shown.value].filter((item, index, array) => array.indexOf(item) === index))

const shownList = computed(() => filterList.value.filter(item => allShown.value.includes(filterAll.indexOf(item))))

const excluded = computed<number[]>(() => {
  const hidden = filterAll.filter(item => !filterList.value.includes(item)).map(item => filterAll.indexOf(item) ?? -1) ?? []

  return [...allShown.value, ...hidden]
})

const closeFilterItem = (item: {id: string}) => {
  if (openId.value === item.id) openId.value = null
}

const removeFilterItem = (item: {id: string, item: FilterComponent<QueryParams>}) => {
  const result: QueryParams = {...props.scope.modelValue} as QueryParams
  const meta = Array.isArray(item.item) ? item.item[0].meta : item.item.meta

  meta.fields?.forEach(field => {
    result[field as keyof QueryParams] = undefined as never
  })

  const index = filterAll.indexOf(item)
  const selectedIndex = selected.value.indexOf(index)

  if (index !== -1 && selectedIndex !== -1) selected.value.splice(selectedIndex, 1)

  closeFilterItem(item)

  props.scope.updateModelValue(result)
}
</script>
