<template>
  <WInput
    :model-value="queryParams.search"
    type="search"
    placeholder="Search by title or author"
    :icon="markRaw(IconSearch)"
    allow-clear
    no-margin
    class="sticky left---left-inner mb-4 w---width-inner"
    @update:model-value="updateQueryParams({search: $event || undefined})"
  />

  <WList
    :use-query-fn="bookModelApi.paginated.use"
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
    :card-columns="(['minmax(0rem, 1fr)', 'auto', 'auto'] as const)"
    :card-areas="[
      ['title', 'title', 'area_select'],
      ['author','author', 'area_more'],
      ['year', 'rating', 'rating'],
      ['available', 'due', 'due'],
      ['pages', 'loans', 'loans'],
      ['genre', 'genre', 'genre'],
    ]"
    card-class="list:h-11 card:gap-2 sm:card:p-4 sm-not:card:py-3 sm:card:w-list-rounded-xl sm:card:border sm:card:shadow-sm border-gray-100 dark:border-gray-800"
    card-wrapper-class="card:self-start"
    min-height
    class="card:w-list-gap-3"
    @update:query-params="updateQueryParams"
  />
</template>

<script lang="ts" setup>
import {markRaw} from 'vue'

import WInput from 'eco-vue-js/dist/components/Input/WInput.vue'
import WList from 'eco-vue-js/dist/components/List/WList.vue'

import IconSearch from 'eco-vue-js/dist/assets/icons/IconSearch'

import BookContent from './BookContent.vue'
import {bookModelApi, useQueryParamsBooks} from './api/Book'
import {defaultFieldConfigMapBook, listFieldsBook} from './fields'
import WMenuBookDelete from './menu/WMenuBookDelete.vue'
import WMenuBookToggle from './menu/WMenuBookToggle.vue'

// The docs have no router, so the filters stay in the page. In an app, keep them in the URL: `useQueryParamsBooks(useRoute())`.
const {queryParams, updateQueryParams} = useQueryParamsBooks.useQueryParamsLocal()

const selectAllTextGetter = (isUnselect: boolean, count: number) => `${ isUnselect ? 'Unselect' : 'Select' } all ${ count } books`
</script>
