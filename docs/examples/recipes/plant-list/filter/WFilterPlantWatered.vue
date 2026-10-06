<template>
  <WUniform
    v-bind="scope"
    field="watered"
  >
    <template #field="scopeField">
      <!-- `undefined` is "Any": it drops the param, so the filter shows every plant. -->
      <WCheckboxGroup
        v-bind="scopeField"
        :list="[undefined, true, false]"
        radio
        :readonly="readonly"
        :embedded="!global"
        class="w-full"
        option-class="w-full"
      >
        <template #option="{option}">
          <div class="flex h-8 items-center">
            {{ option === true ? 'Watered' : option === false ? 'Thirsty' : 'Any' }}
          </div>
        </template>
      </WCheckboxGroup>
    </template>
  </WUniform>
</template>

<script lang="ts" setup>
import type {QueryParamsPlants} from '../api/Plant'

import {markRaw} from 'vue'

import type {FilterEmits, FilterMeta, FilterProps} from 'eco-vue-js/dist/components/List/types'

import WCheckboxGroup from 'eco-vue-js/dist/components/Checkbox/WCheckboxGroup.vue'
import WUniform from 'eco-vue-js/dist/components/Uniform/WUniform.vue'

import IconDrop from 'eco-vue-js/dist/assets/icons/IconDrop'

defineProps<FilterProps<QueryParamsPlants>>()
defineEmits<FilterEmits>()
</script>

<script lang="ts">
export const meta = {
  title: 'Watered',
  icon: markRaw(IconDrop),
  fields: ['watered'],
} as const satisfies FilterMeta<QueryParamsPlants>
</script>
