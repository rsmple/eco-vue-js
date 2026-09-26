<template>
  <WSelectSingle
    v-model="country"
    :options="countries"
    :value-getter="item => item.code"
    :search-fn="(item, search) => item.name.toLowerCase().includes(search.toLowerCase())"
    title="Country"
    placeholder="Pick a country"
    allow-clear
    :clear-value="null"
    class="max-w-md"
  >
    <template #option="{option}">
      {{ option?.name }}
    </template>
  </WSelectSingle>

  <p class="text-sm text-gray-500">
    Model: {{ country ?? 'null' }}
  </p>
</template>

<script lang="ts" setup>
import {ref} from 'vue'

import WSelectSingle from 'eco-vue-js/dist/components/Select/WSelectSingle.vue'

const countries = [
  {id: 1, code: 'de', name: 'Germany'},
  {id: 2, code: 'fr', name: 'France'},
  {id: 3, code: 'it', name: 'Italy'},
  {id: 4, code: 'es', name: 'Spain'},
]

const country = ref<string | null>('fr')
</script>
