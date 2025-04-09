<template>
  <div class="-w--width-inner -left--left-inner sticky">
    <WExpansionItem
      title="Filters"
      :icon="markRaw(IconFilter)"
      :is-open="isOpen"
      @toggle="isOpen = !isOpen"
    >
      <WTabs
        switch-to-new
        disable-min-height
        side
      >
        <WTabsItem
          name="search"
          title="Search"
          :icon="markRaw(IconSearch)"
        >
          <WInput
            ref="input"
            :model-value="(queryParams as Record<string, string>).search"
            placeholder="Search.."
            allow-clear
            class="w-full"
            :icon="markRaw(IconSearch)"
            @update:model-value="$emit('update:query-params', {search: $event || undefined} as QueryParams)"
          />

          <component
            :is="filterSearch"
            v-if="filterSearch" 
            :query-params="queryParams"
            @update:query-params="$emit('update:query-params', $event)"
          />
        </WTabsItem>

        <template v-if="filter">
          <WTabsItem
            v-for="item in filter.filter((_, index) => selected.includes(index))"
            :key="filter.indexOf(item)"
            :name="filter.indexOf(item).toString()"
            :title="getItemProp(queryParams, item, 'title') ?? ''"
            :icon="getItemProp(queryParams, item, 'icon')"
          >
            <component
              :is="item"
              :query-params="queryParams"
              @update:query-params="$emit('update:query-params', $event)"
            />

            <template #right>
              <button
                class="w-ripple-trigger text-description flex h-full items-center justify-center px-1"
                @click="clearFilterItem(item)"
              >
                <div class="w-ripple w-ripple-hover relative rounded-full">
                  <IconClose />
                </div>
              </button>
            </template>
          </WTabsItem>

          <ListFilterSelect
            v-if="selected.length < filter.length"
            :filter="filter"
            :exclude="selected"
            :query-params="queryParams"
            @select="selected.push($event)"
          />
        </template>
      </WTabs>
    </WExpansionItem>
  </div>
</template>

<script setup lang="ts" generic="QueryParams">
import type {FilterComponent} from '../types'

import {markRaw, ref} from 'vue'

import WExpansionItem from '@/components/Expansion/WExpansionItem.vue'
import WInput from '@/components/Input/WInput.vue'
import WTabs from '@/components/Tabs/WTabs.vue'
import WTabsItem from '@/components/Tabs/WTabsItem.vue'

import IconClose from '@/assets/icons/sax/IconClose.svg?component'
import IconFilter from '@/assets/icons/sax/IconFilter.svg?component'
import IconSearch from '@/assets/icons/sax/IconSearch.svg?component'

import ListFilterSelect from './ListFilterSelect.vue'

import {getItemProp} from '../models/utils'

const props = defineProps<{
  filter: FilterComponent<QueryParams>[] | undefined
  filterSearch: FilterComponent<QueryParams> | undefined
  search: boolean
  queryParams: QueryParams
}>()

const emit = defineEmits<{
  (e: 'update:query-params', value: QueryParams): void
}>()

const isOpen = ref(false)

const selected = ref<number[]>(
  props.filter
    ?.filter(item => getItemProp(props.queryParams, item, 'fields')?.some(field => field in (props.queryParams as Record<string, unknown>)))
    .map(item => props.filter?.indexOf(item) ?? -1)
    ?? [],
)

const clearFilterItem = (item: FilterComponent<QueryParams>) => {
  const result: QueryParams = {} as QueryParams

  getItemProp(props.queryParams, item, 'fields')?.forEach(field => {
    result[field as keyof QueryParams] = undefined as never
  })

  const index = props.filter?.indexOf(item) ?? -1
  const selectedIndex = selected.value.indexOf(index)

  if (index !== -1 && selectedIndex !== -1) selected.value.splice(selectedIndex, 1)

  emit('update:query-params', result as QueryParams)
}
</script>