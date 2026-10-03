<template>
  <WUniform
    v-bind="scope"
    field="light__in"
  >
    <template #field="scopeField">
      <WCheckboxGroupMultiple
        v-bind="scopeField"
        :list="Object.values(Light)"
        :readonly="readonly"
        :embedded="!global"
        class="w-full"
        option-class="w-full"
      >
        <template #option="{option}">
          <span
            class="flex h-8 items-center gap-1.5"
            :class="lightDisplay[option].tone"
          >
            <component
              :is="lightDisplay[option].icon"
              class="text-tone square-4.5 shrink-0"
            />
            {{ lightDisplay[option].name }}
          </span>
        </template>
      </WCheckboxGroupMultiple>
    </template>
  </WUniform>
</template>

<script lang="ts" setup>
import type {QueryParamsPlants} from '../api/Plant'

import {markRaw} from 'vue'

import type {FilterEmits, FilterMeta, FilterProps} from 'eco-vue-js/dist/components/List/types'

import WCheckboxGroupMultiple from 'eco-vue-js/dist/components/Checkbox/WCheckboxGroupMultiple.vue'
import WUniform from 'eco-vue-js/dist/components/Uniform/WUniform.vue'

import IconSun from 'eco-vue-js/dist/assets/icons/IconSun'

import {Light} from '../models/Plant'
import {lightDisplay} from '../models/PlantDisplay'

defineProps<FilterProps<QueryParamsPlants>>()
defineEmits<FilterEmits>()
</script>

<script lang="ts">
export const meta = {
  title: 'Light',
  icon: markRaw(IconSun),
  fields: ['light__in'],
  embedded: true,
} as const satisfies FilterMeta<QueryParamsPlants>
</script>
