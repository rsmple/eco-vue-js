<template>
  <div class="grid max-w-md grid-cols-[1fr_10rem] items-center gap-x-4">
    <template
      v-for="plant in plants"
      :key="plant.id"
    >
      <div>{{ plant.name }}</div>

      <WSelectSingle
        v-model="plant.soil"
        :options="soils"
        :value-getter="item => item.code"
        :search-fn="(item, search) => item.name.toLowerCase().includes(search.toLowerCase())"
        placeholder="Soil"
        seamless
        deferred
        no-margin
      >
        <template #option="{option, search}">
          <div class="w-option flex items-center">
            {{ option?.name ?? search }}
          </div>
        </template>
      </WSelectSingle>
    </template>
  </div>
</template>

<script lang="ts" setup>
import {ref} from 'vue'

import WSelectSingle from 'eco-vue-js/dist/components/Select/WSelectSingle.vue'

const soils = [
  {id: 1, code: 'loam', name: 'Loam'},
  {id: 2, code: 'sand', name: 'Sandy'},
  {id: 3, code: 'clay', name: 'Clay'},
  {id: 4, code: 'peat', name: 'Peat'},
]

const plants = ref([
  {id: 1, name: 'Monstera', soil: 'peat' as string | null},
  {id: 2, name: 'Aloe', soil: 'sand' as string | null},
  {id: 3, name: 'Fern', soil: null as string | null},
  {id: 4, name: 'Basil', soil: 'loam' as string | null},
])
</script>
