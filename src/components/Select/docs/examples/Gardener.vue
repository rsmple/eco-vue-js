<template>
  <WSelectSingle
    v-model="gardenerId"
    :options="gardeners"
    :value-getter="item => item.id"
    :search-fn="(item, search) => item.name.toLowerCase().includes(search) || item.role.toLowerCase().includes(search)"
    title="On watering duty"
    placeholder="Pick a gardener"
    :option-component="OptionGardener"
    allow-clear
    :clear-value="null"
    class="max-w-md"
  />

  <p class="text-sm text-description">
    Model: {{ gardenerId ?? 'null' }}
  </p>
</template>

<script lang="ts" setup>
import {ref} from 'vue'

import WSelectSingle from 'eco-vue-js/dist/components/Select/WSelectSingle.vue'

import OptionGardener, {type Gardener} from './parts/OptionGardener.vue'

const gardeners: Gardener[] = [
  {id: 1, name: 'Mira Kovač', role: 'Head gardener', beds: 12},
  {id: 2, name: 'Tomás Reyes', role: 'Greenhouse', beds: 4},
  {id: 3, name: 'Aiko Tanaka', role: 'Seedlings', beds: 7},
  {id: 4, name: 'Jonas Berg', role: 'Herb garden', beds: 3},
  {id: 5, name: 'Priya Nair', role: 'Orchard', beds: 9},
]

const gardenerId = ref<number | null>(1)
</script>
