<template>
  <div>
    <template v-if="searchVisible && searchComponent">
      <component
        :is="searchComponent[0].default"
        v-if="Array.isArray(searchComponent)"
        v-bind="searchComponent[1]"
        :query-params="queryParams"
        :readonly="readonly"
        :global="true"
        @update:query-params="$emit('update:query-params', $event)"
      />

      <component
        :is="searchComponent.default"
        v-else
        :query-params="queryParams"
        :readonly="readonly"
        :global="true"
        @update:query-params="$emit('update:query-params', $event)"
      />
    </template>
    <div class="pb-2" />
    <button
      v-if="allShown.length !== 0"
      class="w-ripple w-ripple-hover text-description relative grid min-w-[16.25rem] grid-cols-[1fr,1.5rem] items-center gap-2 py-2 text-start font-semibold sm:px-3"
      @click="isOpen = !isOpen"
    >
      <div>
        <IconFilter class="square-[1.25em] -mt-1 inline" /> {{ title?.(shown.length) ?? `Filters (${ shown.length })` }}
      </div>
      <IconArrow
        class="square-3 justify-self-center transition-transform"
        :class="{'rotate-180': isOpen}"
      />
    </button>
    <WExpansion :is-open="isOpen || allShown.length === 0">
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
            :title="getMetaValue((Array.isArray(item) ? item[0].meta : item.meta).title, queryParams)"
            :icon="getMetaValue((Array.isArray(item) ? item[0].meta : item.meta).icon, queryParams)"
            :init="index === 0 && !(queryParams as Record<string, string>).search"
            :has-value="shown.includes(filterAll.indexOf(item))"
            v-bind="!readonly ? {
              onClose: () => clearFilterItem(item)
            } : undefined"
          >
            <div class="sm-not:-px--inner-margin">
              <component
                :is="item[0].default"
                v-if="Array.isArray(item)"
                v-bind="item[1]"
                :query-params="queryParams"
                :readonly="readonly"
                :global="false"
                @update:query-params="$emit('update:query-params', $event)"
              />

              <component
                :is="item.default"
                v-else
                :query-params="queryParams"
                :readonly="readonly"
                :global="false"
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
    </WExpansion>
  </div>
</template>

<script setup lang="ts" generic="QueryParams">
import type {FilterComponent} from '../types'

import {computed, markRaw, ref} from 'vue'

import WExpansion from '@/components/Expansion/WExpansion.vue'
import WTabs from '@/components/Tabs/WTabs.vue'
import WTabsItem from '@/components/Tabs/WTabsItem.vue'

import IconArrow from '@/assets/icons/IconArrow.svg?component'
import IconFilter from '@/assets/icons/IconFilter.svg?component'

import * as ListFilterSearch from './ListFilterSearch.vue'
import ListFilterSelect from './ListFilterSelect.vue'

import {getMetaValue} from '../models/utils'

const props = defineProps<{
  filter: FilterComponent<QueryParams>[] | undefined
  filterSearch: FilterComponent<QueryParams> | undefined
  search: boolean
  queryParams: QueryParams
  disabledFilterFields: Array<keyof QueryParams>
  title: ((count: number) => string) | undefined
  readonly: boolean
  searchVisible: boolean
}>()

const emit = defineEmits<{
  (e: 'update:query-params', value: QueryParams): void
}>()

const isOpen = ref(true)

const searchComponent: FilterComponent<QueryParams> | undefined = props.search ? props.filterSearch ?? ListFilterSearch : undefined

const filterAll = [
  ...(props.searchVisible || !searchComponent ? [] : [markRaw(searchComponent)]),
  ...props.filter ?? [],
]

const filterList = computed(() => {
  return filterAll.filter(item => {
    const meta = Array.isArray(item) ? item[0].meta : item.meta

    if (getMetaValue(meta.hidden, props.queryParams)) return false

    const fields = meta.fields ?? []
    return !fields.some(field => props.disabledFilterFields.includes(field))
  }) ?? []
})

const shown = computed(() => filterList.value
  .filter(item => (Array.isArray(item) ? item[0].meta.fields : item.meta.fields)?.some(field => field in (props.queryParams as Record<string, unknown>)))
  .map(item => filterAll.indexOf(item)))

const selected = ref<number[]>(shown.value.slice())

const allShown = computed(() => [...selected.value, ...shown.value].filter((item, index, array) => array.indexOf(item) === index))

const excluded = computed<number[]>(() => {
  const hidden = props.filter?.filter(item => !filterList.value.includes(item)).map(item => filterAll.indexOf(item) ?? -1) ?? []

  return [...allShown.value, ...hidden]
})

const clearFilterItem = (item: FilterComponent<QueryParams>) => {
  const result: QueryParams = {} as QueryParams
  const meta = Array.isArray(item) ? item[0].meta : item.meta

  meta.fields?.forEach(field => {
    result[field as keyof QueryParams] = undefined as never
  })

  const index = filterAll.indexOf(item)
  const selectedIndex = selected.value.indexOf(index)

  if (index !== -1 && selectedIndex !== -1) selected.value.splice(selectedIndex, 1)

  emit('update:query-params', result as QueryParams)
}
</script>