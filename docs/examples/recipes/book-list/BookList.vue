<template>
  <WInput
    v-model="search"
    type="search"
    placeholder="Search by title or author"
    :icon="markRaw(IconSearch)"
    allow-clear
    no-margin
    class="mb-4"
  />

  <WList
    :use-query-fn="useQueryBooks"
    :query-params="queryParams"
    :fields="listFieldsBook"
    :default-config-map="defaultFieldConfigMapBook"
    config-key="w-list-docs-book"
    :expansion="markRaw(BookContent)"
    :menu="[
      markRaw(WMenuBookToggle),
      markRaw(WMenuBookDelete),
    ]"
    selection-title="book"
    :select-all-text-getter="selectAllTextGetter"
    :card-columns="(['1fr', 'auto'] as const)"
    :card-areas="[
      ['title', 'area_select'],
      ['author', 'area_more'],
      ['year', 'available'],
    ]"
    min-height
    @update:query-params="ordering = $event.ordering"
  />
</template>

<script lang="ts" setup>
import type {QueryParamsBooks} from './models/Book'

import {computed, markRaw, ref} from 'vue'

import WInput from 'eco-vue-js/dist/components/Input/WInput.vue'
import WList from 'eco-vue-js/dist/components/List/WList.vue'

import IconSearch from 'eco-vue-js/dist/assets/icons/IconSearch'

import BookContent from './BookContent.vue'
import {useQueryBooks} from './api/Book'
import {defaultFieldConfigMapBook, listFieldsBook} from './fields'
import WMenuBookDelete from './menu/WMenuBookDelete.vue'
import WMenuBookToggle from './menu/WMenuBookToggle.vue'

// In an app these usually live in the route query, so the list state survives reloads and can be shared.
const search = ref<string | undefined | null>()
const ordering = ref<string>()

const queryParams = computed<QueryParamsBooks>(() => ({
  search: search.value || undefined,
  ordering: ordering.value,
}))

const selectAllTextGetter = (isUnselect: boolean, count: number) => `${ isUnselect ? 'Unselect' : 'Select' } all ${ count } books`
</script>
