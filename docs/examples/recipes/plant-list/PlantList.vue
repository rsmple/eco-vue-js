<template>
  <WList
    :use-query-fn="plantModelApi.paginated.use"
    :query-params="queryParams"
    :fields="listFieldsPlant"
    :default-config-map="defaultFieldConfigMapPlant"
    config-key="w-list-docs-plant"
    :expansion="markRaw(PlantContent)"
    :bulk="bulk"
    :menu="menu"
    selection-title="plant"
    :select-all-text-getter="selectAllTextGetter"
    :card-columns="cardColumns"
    :card-areas="cardAreas"
    card-class="list:h-11 card:gap-1 sm:card:p-4 sm-not:card:py-3 sm:card:w-list-rounded-xl sm:card:border sm:card:shadow-sm border-line-subtle"
    card-wrapper-class="card:self-start"
    min-height
    class="card:w-list-gap-3"
    @update:query-params="updateQueryParams"
  >
    <!-- The filters edit the same query params the list reads, in the selection bar above the rows. -->
    <template #filter>
      <WUniform
        :model-value="queryParams"
        @update:model-value="updateQueryParams"
      >
        <template #default="scope">
          <WListFilter
            :scope="scope"
            :filter="listFilterPlant"
            :pinned="listFilterPlantPinned"
            search
          />
        </template>
      </WUniform>
    </template>
  </WList>
</template>

<script lang="ts" setup>
import type {Plant} from './models/Plant'

import {markRaw} from 'vue'

import type {BulkComponent, CardAreas, GridCol, MenuComponent} from 'eco-vue-js/dist/components/List/types'

import WList from 'eco-vue-js/dist/components/List/WList.vue'
import WListFilter from 'eco-vue-js/dist/components/List/WListFilter.vue'
import WUniform from 'eco-vue-js/dist/components/Uniform/WUniform.vue'

import PlantContent from './PlantContent.vue'
import {type QueryParamsPlants, plantModelApi, useQueryParamsPlants} from './api/Plant'
import WBulkPlantCaretaker from './bulk/WBulkPlantCaretaker.vue'
import WBulkPlantDry from './bulk/WBulkPlantDry.vue'
import WBulkPlantRemove from './bulk/WBulkPlantRemove.vue'
import WBulkPlantWatered from './bulk/WBulkPlantWatered.vue'
import {defaultFieldConfigMapPlant, listFieldsPlant} from './fields'
import {listFilterPlant, listFilterPlantPinned} from './filter'
import WMenuPlantCaretaker from './menu/WMenuPlantCaretaker.vue'
import WMenuPlantDelete from './menu/WMenuPlantDelete.vue'
import WMenuPlantToggle from './menu/WMenuPlantToggle.vue'

// The docs have no router, so the filters stay in the page. In an app, keep them in the URL: `useQueryParamsPlants(useRoute())`.
const {queryParams, updateQueryParams} = useQueryParamsPlants.useQueryParamsLocal()

const selectAllTextGetter = (isUnselect: boolean, count: number) => `${ isUnselect ? 'Unselect' : 'Select' } all ${ count } plants`
</script>

<script lang="ts">
const bulk: BulkComponent<QueryParamsPlants>[] = [
  markRaw(WBulkPlantWatered),
  markRaw(WBulkPlantDry),
  markRaw(WBulkPlantCaretaker),
  markRaw(WBulkPlantRemove),
]

const menu: MenuComponent<Plant>[] = [
  markRaw(WMenuPlantToggle),
  markRaw(WMenuPlantCaretaker),
  markRaw(WMenuPlantDelete),
]

const cardColumns = ['2fr', '1fr', 'auto'] as const satisfies GridCol[]

const cardAreas: CardAreas<typeof listFieldsPlant, typeof cardColumns['length']> = [
  ['name', 'name', 'area_select'],
  ['species', 'species', 'area_more'],
  ['kind', 'light', 'light'],
  ['health', 'growth', 'growth'],
  ['watered', 'due', 'due'],
  ['height', 'humidity', 'humidity'],
  ['water', 'seeds', 'seeds'],
  ['caretaker', 'caretaker', 'caretaker'],
]
</script>
