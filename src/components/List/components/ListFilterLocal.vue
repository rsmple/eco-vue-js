<template>
  <WExpansionItem
    :title="title?.(shown.length) ?? `Filters (${ shown.length })`"
    :icon="markRaw(IconFilter)"
    :is-open="isOpen"
    toggle-class="sm:px-3"
    @toggle="isOpen = !isOpen"
  >
    <WTabs
      switch-to-new
      disable-min-height
      side
      status-icon
      name="filter"
      class="w-tabs-side-width-72"
    >
      <template v-if="filter || search">
        <WTabsItem
          v-for="(item, index) in filterList.filter(item => allShown.includes(filterAll.indexOf(item)))"
          :key="filterAll.indexOf(item)"
          :name="filterAll.indexOf(item).toString()"
          :title="getItemProp(queryParams, item, 'title') ?? ''"
          :icon="getItemProp(queryParams, item, 'icon')"
          :init="index === 0 && !(queryParams as Record<string, string>).search"
          :has-value="shown.includes(filterAll.indexOf(item))"
          v-bind="!readonly ? {
            onClose: () => clearFilterItem(item)
          } : undefined"
        >
          <div class="sm-not:-px--inner-margin">
            <component
              :is="item[0]"
              v-if="Array.isArray(item)"
              v-bind="item[1]"
              :query-params="queryParams"
              :readonly="readonly"
              @update:query-params="$emit('update:query-params', $event)"
            />

            <component
              :is="item"
              v-else
              :query-params="queryParams"
              :readonly="readonly"
              @update:query-params="$emit('update:query-params', $event)"
            />
          </div>
        </WTabsItem>

        <ListFilterSelect
          v-if="!readonly && allShown.length < filterList.length"
          :filter="filterAll"
          :exclude="excluded"
          :query-params="queryParams"
          @select="selected.push($event)"
        />
      </template>
    </WTabs>
  </WExpansionItem>
</template>

<script setup lang="ts" generic="QueryParams">
import type {FilterComponent} from '../types'

import {computed, markRaw, ref} from 'vue'

import WExpansionItem from '@/components/Expansion/WExpansionItem.vue'
import WTabs from '@/components/Tabs/WTabs.vue'
import WTabsItem from '@/components/Tabs/WTabsItem.vue'

import IconFilter from '@/assets/icons/sax/IconFilter.svg?component'

import ListFilterSearch from './ListFilterSearch.vue'
import ListFilterSelect from './ListFilterSelect.vue'

import {getItemProp} from '../models/utils'

const props = defineProps<{
  filter: FilterComponent<QueryParams>[] | undefined
  filterSearch: FilterComponent<QueryParams> | undefined
  search: boolean
  queryParams: QueryParams
  disabledFilterFields: Array<keyof QueryParams>
  title: ((count: number) => string) | undefined
  readonly: boolean
}>()

const emit = defineEmits<{
  (e: 'update:query-params', value: QueryParams): void
}>()

const isOpen = ref(true)

const filterAll = computed(() => [
  props.search ? props.filterSearch ?? markRaw(ListFilterSearch) : undefined,
  ...props.filter ?? [],
].filter((item): item is FilterComponent<QueryParams> => item !== undefined))

const filterList = computed(() => {
  return filterAll.value.filter(item => {
    if (getItemProp(props.queryParams, item, 'hidden')) return false

    const fields = getItemProp(props.queryParams, item, 'fields') ?? []
    return !fields.some(field => props.disabledFilterFields.includes(field))
  }) ?? []
})

const shown = computed(() => filterList.value
  .filter(item => getItemProp(props.queryParams, item, 'fields')?.some(field => field in (props.queryParams as Record<string, unknown>)))
  .map(item => filterAll.value.indexOf(item)))

const selected = ref<number[]>(shown.value.slice())

const allShown = computed(() => [...selected.value, ...shown.value].filter((item, index, array) => array.indexOf(item) === index))

const excluded = computed<number[]>(() => {
  const hidden = props.filter?.filter(item => !filterList.value.includes(item)).map(item => filterAll.value.indexOf(item) ?? -1) ?? []

  return [...allShown.value, ...hidden]
})

const clearFilterItem = (item: FilterComponent<QueryParams>) => {
  const result: QueryParams = {} as QueryParams

  getItemProp(props.queryParams, item, 'fields')?.forEach(field => {
    result[field as keyof QueryParams] = undefined as never
  })

  const index = filterAll.value.indexOf(item)
  const selectedIndex = selected.value.indexOf(index)

  if (index !== -1 && selectedIndex !== -1) selected.value.splice(selectedIndex, 1)

  emit('update:query-params', result as QueryParams)
}
</script>