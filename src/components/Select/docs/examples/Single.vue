<template>
  <WSelectSingle
    v-model="soil"
    :options="soils"
    :value-getter="item => item.code"
    :search-fn="(item, search) => item.name.toLowerCase().includes(search.toLowerCase())"
    title="Soil"
    placeholder="Pick a soil"
    allow-clear
    :clear-value="null"
    class="max-w-md"
  >
    <template #option="{option}">
      <div class="w-option flex items-center">
        {{ option?.name }}
      </div>
    </template>
  </WSelectSingle>

  <p class="text-sm text-description">
    Model: {{ soil ?? 'null' }}
  </p>
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

const soil = ref<string | null>('loam')
</script>
