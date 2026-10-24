<template>
  <WList
    :use-query-fn="plantModelApi.paginated.use"
    :query-params="{}"
    :fields="listFieldsPlantNested"
    :default-config-map="defaultConfigMap"
    config-key="w-list-docs-plant-nested"
    selection-title="plant"
    :select-all-text-getter="selectAllTextGetter"
    align-top
    :card-columns="(['1fr', 'auto'] as const)"
    :card-areas="[
      ['name', 'area_select'],
      ['kind', 'area_more'],
      ['gardener', 'gardener'],
      ['task', 'task'],
    ]"
    card-class="list:min-h-11 list:py-2 card:gap-1 sm:card:p-4 sm-not:card:py-3 sm:card:w-list-rounded-xl sm:card:border sm:card:shadow-sm border-line-subtle card:overflow-clip"
    card-wrapper-class="card:self-start"
    min-height
    no-ordering
    class="card:w-list-gap-3 w-list-align-top-2.5"
  />
</template>

<script lang="ts" setup>
import type {QueryParamsPlants} from './api/Plant'
import type {Plant, TaskItem} from './models/Plant'
import type {Gardener} from '../../shared/Gardener'

import {markRaw} from 'vue'

import type {ListFieldNestedArrayGetter, ListFieldNestedEntityGetter, ListFields} from 'eco-vue-js/dist/components/List/types'
import {getDefaultFieldConfigMap} from 'eco-vue-js/dist/utils/utils'

import WList from 'eco-vue-js/dist/components/List/WList.vue'

import {plantModelApi} from './api/Plant'
import * as FieldGardenerName from './fields/WFieldGardenerName.vue'
import * as FieldGardenerRole from './fields/WFieldGardenerRole.vue'
import * as FieldPlantKind from './fields/WFieldPlantKind.vue'
import * as FieldPlantName from './fields/WFieldPlantName.vue'
import * as FieldTaskDue from './fields/WFieldTaskDue.vue'
import * as FieldTaskTitle from './fields/WFieldTaskTitle.vue'
import WTaskItem from './fields/WTaskItem.vue'

const listFieldsPlantNested = [
  FieldPlantName,
  FieldPlantKind,
  {
    // The columns of the plant's caretaker, a related object.
    meta: {
      getterEntity: plant => plant.caretaker,
      cssClass: 'card:flex-col card:items-start card:[grid-area:gardener]',
      fields: [
        FieldGardenerName,
        FieldGardenerRole,
      ],
    } as const satisfies ListFieldNestedEntityGetter<Plant, QueryParamsPlants, Gardener>,
  },
  {
    // One line per task: the cell grows with the number of tasks, and its columns line up across the rows.
    meta: {
      getterArray: plant => plant.tasks.map((task, index) => ({...task, id: index})),
      componentItem: markRaw(WTaskItem),
      cssClass: 'card:justify-between card:gap-4',
      cssClassArray: 'card:[grid-area:task] card:flex card:flex-col card:gap-1 list:pl-3',
      fields: [
        FieldTaskTitle,
        FieldTaskDue,
      ],
    } as const satisfies ListFieldNestedArrayGetter<Plant, QueryParamsPlants, TaskItem>,
  },
] as const satisfies ListFields<Plant, QueryParamsPlants>

const defaultConfigMap = getDefaultFieldConfigMap(listFieldsPlantNested, ['name', 'kind', 'gardener', 'role', 'task', 'due'])

const selectAllTextGetter = (isUnselect: boolean, count: number) => `${ isUnselect ? 'Unselect' : 'Select' } all ${ count } plants`
</script>
