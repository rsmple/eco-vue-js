<template>
  <WInput
    :model-value="queryParams.search"
    type="search"
    placeholder="Search by name or species"
    :icon="markRaw(IconSearch)"
    allow-clear
    no-margin
    class="sticky left---left-inner mb-4 w---width-inner"
    @update:model-value="updateQueryParams({search: $event || undefined})"
  />

  <WList
    :use-query-fn="plantModelApi.paginated.use"
    :query-params="queryParams"
    :fields="listFieldsPlant"
    :default-config-map="defaultFieldConfigMapPlant"
    config-key="w-list-docs-plant"
    :expansion="markRaw(PlantContent)"
    :menu="[
      markRaw(WMenuPlantToggle),
      markRaw(WMenuPlantDelete),
    ]"
    selection-title="plant"
    :select-all-text-getter="selectAllTextGetter"
    :card-columns="(['minmax(0rem, 1fr)', 'auto', 'auto'] as const)"
    :card-areas="[
      ['name', 'name', 'area_select'],
      ['species','species', 'area_more'],
      ['height', 'humidity', 'humidity'],
      ['watered', 'due', 'due'],
      ['water', 'seeds', 'seeds'],
      ['kind', 'kind', 'kind'],
    ]"
    card-class="list:h-11 card:gap-2 sm:card:p-4 sm-not:card:py-3 sm:card:w-list-rounded-xl sm:card:border sm:card:shadow-sm border-line-subtle"
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

import PlantContent from './PlantContent.vue'
import {plantModelApi, useQueryParamsPlants} from './api/Plant'
import {defaultFieldConfigMapPlant, listFieldsPlant} from './fields'
import WMenuPlantDelete from './menu/WMenuPlantDelete.vue'
import WMenuPlantToggle from './menu/WMenuPlantToggle.vue'

// The docs have no router, so the filters stay in the page. In an app, keep them in the URL: `useQueryParamsPlants(useRoute())`.
const {queryParams, updateQueryParams} = useQueryParamsPlants.useQueryParamsLocal()

const selectAllTextGetter = (isUnselect: boolean, count: number) => `${ isUnselect ? 'Unselect' : 'Select' } all ${ count } plants`
</script>
