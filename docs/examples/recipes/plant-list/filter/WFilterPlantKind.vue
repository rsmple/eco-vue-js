<template>
  <WUniform
    v-bind="scope"
    field="kind__in"
    title="Kind"
  >
    <template #field="scopeField">
      <WSelect
        v-bind="scopeField"
        :options="options"
        :value-getter="item => item.id"
        :search-fn="(item, search) => item.name.toLowerCase().includes(search)"
        :option-component="markRaw(OptionToneTag)"
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

import OptionToneTag, {type ToneTag} from '../../../shared/OptionToneTag.vue'
import {Kind} from '../models/Plant'
import {kindDisplay} from '../models/PlantDisplay'

defineProps<FilterProps<QueryParamsPlants>>()
defineEmits<FilterEmits>()

// The same tags as the kind column, in the shape the shared tag option takes.
const options: ToneTag<Kind>[] = Object.values(Kind).map(id => ({id, ...kindDisplay[id]}))
</script>

<script lang="ts">
export const meta = {
  title: 'Kind',
  icon: markRaw(IconPlant),
  fields: ['kind__in'],
  // The chip names the picked kinds instead of counting them.
  summary: queryParams => queryParams.kind__in?.map(item => kindDisplay[item].name),
} as const satisfies FilterMeta<QueryParamsPlants>
</script>
