<template>
  <WUniform
    v-bind="scope"
    field="kind__in"
    title="Kind"
  >
    <template #field="scopeField">
      <WSelect
        v-bind="scopeField"
        :options="Object.values(Kind)"
        :value-getter="item => item"
        :search-fn="(item, search) => kindDisplay[item].label.toLowerCase().includes(search)"
        :option-component="markRaw(WOptionPlantKind)"
        :readonly="readonly"
        placeholder="Search kinds"
        :embedded="!global"
        class="min-w-60"
      />
    </template>
  </WUniform>
</template>

<script lang="ts" setup>
import type {QueryParamsPlants} from '../api/Plant'

import {markRaw} from 'vue'

import type {FilterEmits, FilterMeta, FilterProps} from 'eco-vue-js/dist/components/List/types'

import WSelect from 'eco-vue-js/dist/components/Select/WSelect.vue'
import WUniform from 'eco-vue-js/dist/components/Uniform/WUniform.vue'

import IconPlant from 'eco-vue-js/dist/assets/icons/IconPlant'

import {Kind} from '../models/Plant'
import {kindDisplay} from '../models/PlantDisplay'
import WOptionPlantKind from '../options/WOptionPlantKind.vue'

defineProps<FilterProps<QueryParamsPlants>>()
defineEmits<FilterEmits>()
</script>

<script lang="ts">
export const meta = {
  title: 'Kind',
  icon: markRaw(IconPlant),
  fields: ['kind__in'],
  // The control fills the filter's dropdown edge to edge, so the dropdown drops its padding.
  embedded: true,
} as const satisfies FilterMeta<QueryParamsPlants>
</script>
