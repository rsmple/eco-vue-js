<template>
  <WSelectAsyncSingle
    v-model="plantId"
    :use-query-fn-options="plantModelApi.paginated.use"
    :query-params-options="{}"
    :value-getter="item => item.id"
    title="Plant"
    placeholder="Search by name or species"
    :option-component="OptionPlant"
    allow-clear
    :clear-value="null"
    class="max-w-md"
  />

  <p class="text-sm text-description">
    Model: {{ plantId ?? 'null' }}
  </p>
</template>

<script lang="ts" setup>
import {ref} from 'vue'

import WSelectAsyncSingle from 'eco-vue-js/dist/components/Select/WSelectAsyncSingle.vue'

import OptionPlant from './parts/OptionPlant.vue'

// The `use` of any paginated query — here the plant model from the list recipe.
import {plantModelApi} from '../../../../../docs/examples/recipes/plant-list/api/Plant'

const plantId = ref<number | null>(3)
</script>
