<template>
  <WList
    :use-query-fn="plantModelApi.paginated.use"
    :query-params="queryParams"
    :fields="listFieldsPlant"
    :default-config-map="defaultFieldConfigMapPlant"
    :default-mode="ListMode.GRID"
    config-key="w-list-docs-plant-grouped"
    :group-by="(a, b) => a.kind === b.kind"
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
    no-ordering
    class="card:w-list-gap-3"
  >
    <!-- One heading per kind. The list places it over the whole width and sticks it under the toolbar while the plants of its kind scroll past. -->
    <template #group="{item, skeleton}">
      <div class="flex items-center gap-2 font-semibold">
        <WSkeleton v-if="skeleton" />

        <template v-else>
          <component
            :is="kindDisplay[item.kind].icon"
            class="square-5 text-tone mr-0.5"
            :class="kindDisplay[item.kind].tone"
          />
          {{ kindDisplay[item.kind].name }}
        </template>
      </div>
    </template>
  </WList>
</template>

<script lang="ts" setup>
import {ListMode} from 'eco-vue-js/dist/utils/utils'

import WList from 'eco-vue-js/dist/components/List/WList.vue'
import WSkeleton from 'eco-vue-js/dist/components/Skeleton/WSkeleton.vue'

import {plantModelApi} from './api/Plant'
import {defaultFieldConfigMapPlant, listFieldsPlant} from './fields'
import {kindDisplay} from './models/PlantDisplay'

// `groupBy` compares neighbouring items, so the list is sorted by the field it groups by.
const queryParams = {ordering: 'kind'}

const selectAllTextGetter = (isUnselect: boolean, count: number) => `${ isUnselect ? 'Unselect' : 'Select' } all ${ count } plants`
</script>
