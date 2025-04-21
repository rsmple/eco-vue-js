<template>
  <div class="sm:-w--width-inner sm:-left--left-inner pb-4 sm:sticky">
    <WExpansionItem
      :title="`Filters (${ shown.length })`"
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
        <WTabsItem
          v-if="search"
          name="search"
          title="Search"
          :icon="markRaw(IconSearch)"
          :has-value="!!(queryParams as Record<string, string>).search"
        >
          <div class="sm-not:-px--inner-margin">
            <WFormValidator name="search">
              <WInput
                ref="input"
                :model-value="(queryParams as Record<string, string>).search"
                placeholder="Search.."
                allow-clear
                class="w-full"
                :icon="markRaw(IconSearch)"
                @update:model-value="$emit('update:query-params', {search: $event || undefined} as QueryParams)"
              />
            </WFormValidator>

            <component
              :is="filterSearch"
              v-if="filterSearch" 
              :query-params="queryParams"
              @update:query-params="$emit('update:query-params', $event)"
            />
          </div>

          <template #right>
            <div class="w-10" />
          </template>
        </WTabsItem>

        <template v-if="filter">
          <WTabsItem
            v-for="(item, index) in filterList.filter(item => allShown.includes(filter?.indexOf(item) ?? -1))"
            :key="filter.indexOf(item)"
            :name="filter.indexOf(item).toString()"
            :title="getItemProp(queryParams, item, 'title') ?? ''"
            :icon="getItemProp(queryParams, item, 'icon')"
            :init="index === 0 && !(queryParams as Record<string, string>).search"
            :has-value="shown.includes(filter.indexOf(item))"
          >
            <div class="sm-not:-px--inner-margin">
              <component
                :is="item"
                :query-params="queryParams"
                @update:query-params="$emit('update:query-params', $event)"
              />
            </div>

            <template #right>
              <button
                class="w-ripple-trigger text-description sm-not:-mr--inner-margin flex h-full items-center justify-center px-1"
                @click="clearFilterItem(item)"
              >
                <div class="w-ripple w-ripple-hover relative rounded-full">
                  <IconClose />
                </div>
              </button>
            </template>
          </WTabsItem>

          <ListFilterSelect
            v-if="allShown.length < filterList.length"
            :filter="filter"
            :exclude="excluded"
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

import {computed, markRaw, ref} from 'vue'

import WExpansionItem from '@/components/Expansion/WExpansionItem.vue'
import WFormValidator from '@/components/Form/WFormValidator.vue'
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
  disabledFilterFields: Array<keyof QueryParams>
}>()

const emit = defineEmits<{
  (e: 'update:query-params', value: QueryParams): void
}>()

const isOpen = ref(true)

const filterList = computed(() => {
  return props.filter?.filter(item => {
    if (getItemProp(props.queryParams, item, 'hidden')) return false

    const fields = getItemProp(props.queryParams, item, 'fields') ?? []
    return !fields.some(field => props.disabledFilterFields.includes(field))
  }) ?? []
})

const shown = computed(() => filterList.value
  .filter(item => getItemProp(props.queryParams, item, 'fields')?.some(field => field in (props.queryParams as Record<string, unknown>)))
  .map(item => props.filter?.indexOf(item) ?? -1))

const selected = ref<number[]>(shown.value.slice())

const allShown = computed(() => [...selected.value, ...shown.value].filter((item, index, array) => array.indexOf(item) === index))

const excluded = computed<number[]>(() => {
  const hidden = props.filter?.filter(item => !filterList.value.includes(item)).map(item => props.filter?.indexOf(item) ?? -1) ?? []

  return [...allShown.value, ...hidden]
})

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