<template>
  <!-- The filters edit the same query params the list reads. -->
  <WUniform
    :model-value="queryParams"
    @update:model-value="updateQueryParams"
  >
    <template #default="scope">
      <WListFilter
        :scope="scope"
        :filter="listFilterPlant"
        search
        class="sticky left---left-inner mb-2 w---width-inner"
      />
    </template>
  </WUniform>

  <WList
    :use-query-fn="plantModelApi.paginated.use"
    :query-params="queryParams"
    :fields="listFieldsPlant"
    :default-config-map="defaultFieldConfigMapPlant"
    config-key="w-list-docs-plant"
    :expansion="markRaw(PlantContent)"
    :bulk="[
      markRaw(WBulkPlantWatered),
      markRaw(WBulkPlantDry),
      markRaw(WBulkPlantCaretaker),
      markRaw(WBulkPlantRemove),
    ]"
    :menu="[
      markRaw(WMenuPlantToggle),
      markRaw(WMenuPlantCaretaker),
      markRaw(WMenuPlantDelete),
    ]"
    selection-title="plant"
    :select-all-text-getter="selectAllTextGetter"
    :card-columns="(['2fr', '1fr', 'auto'] as const)"
    :card-areas="[
      ['name', 'name', 'area_select'],
      ['species','species', 'area_more'],
      ['kind', 'light', 'light'],
      ['health', 'growth', 'growth'],
      ['watered', 'due', 'due'],
      ['height', 'humidity', 'humidity'],
      ['water', 'seeds', 'seeds'],
      ['caretaker', 'caretaker', 'caretaker'],
    ]"
    card-class="list:h-11 card:gap-1 sm:card:p-4 sm-not:card:py-3 sm:card:w-list-rounded-xl sm:card:border sm:card:shadow-sm border-line-subtle"
    card-wrapper-class="card:self-start"
    min-height
    class="card:w-list-gap-3"
    @update:query-params="updateQueryParams"
  />
</template>

<script lang="ts" setup>
import {markRaw} from 'vue'

import WList from 'eco-vue-js/dist/components/List/WList.vue'
import WListFilter from 'eco-vue-js/dist/components/List/WListFilter.vue'
import WUniform from 'eco-vue-js/dist/components/Uniform/WUniform.vue'

import PlantContent from './PlantContent.vue'
import {plantModelApi, useQueryParamsPlants} from './api/Plant'
import WBulkPlantCaretaker from './bulk/WBulkPlantCaretaker.vue'
import WBulkPlantDry from './bulk/WBulkPlantDry.vue'
import WBulkPlantRemove from './bulk/WBulkPlantRemove.vue'
import WBulkPlantWatered from './bulk/WBulkPlantWatered.vue'
import {defaultFieldConfigMapPlant, listFieldsPlant} from './fields'
import {listFilterPlant} from './filter'
import WMenuPlantCaretaker from './menu/WMenuPlantCaretaker.vue'
import WMenuPlantDelete from './menu/WMenuPlantDelete.vue'
import WMenuPlantToggle from './menu/WMenuPlantToggle.vue'

// The docs have no router, so the filters stay in the page. In an app, keep them in the URL: `useQueryParamsPlants(useRoute())`.
const {queryParams, updateQueryParams} = useQueryParamsPlants.useQueryParamsLocal()

const selectAllTextGetter = (isUnselect: boolean, count: number) => `${ isUnselect ? 'Unselect' : 'Select' } all ${ count } plants`
</script>
