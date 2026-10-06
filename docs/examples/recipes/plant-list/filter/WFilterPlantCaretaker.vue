<template>
  <WUniform
    v-bind="scope"
    field="caretaker"
    title="Caretaker"
  >
    <template #field="scopeField">
      <WSelectSingle
        v-bind="scopeField"
        :options="gardeners"
        :value-getter="item => item.id"
        :search-fn="(item, search) => item.name.toLowerCase().includes(search) || item.role.toLowerCase().includes(search)"
        :option-component="markRaw(OptionGardener)"
        :readonly="readonly"
        placeholder="Search caretakers"
        :embedded="!global"
        :clear-value="undefined"
        allow-clear
        class="min-w-60"
      />
    </template>
  </WUniform>
</template>

<script lang="ts" setup>
import type {QueryParamsPlants} from '../api/Plant'

import {markRaw} from 'vue'

import type {FilterEmits, FilterMeta, FilterProps} from 'eco-vue-js/dist/components/List/types'

import WSelectSingle from 'eco-vue-js/dist/components/Select/WSelectSingle.vue'
import WUniform from 'eco-vue-js/dist/components/Uniform/WUniform.vue'

import IconUser from 'eco-vue-js/dist/assets/icons/IconUser'

import {gardeners} from '../../../shared/Gardener'
import OptionGardener from '../../../shared/OptionGardener.vue'

defineProps<FilterProps<QueryParamsPlants>>()
defineEmits<FilterEmits>()
</script>

<script lang="ts">
export const meta = {
  title: 'Caretaker',
  icon: markRaw(IconUser),
  fields: ['caretaker'],
} as const satisfies FilterMeta<QueryParamsPlants>
</script>
