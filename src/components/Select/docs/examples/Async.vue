<template>
  <WSelectAsyncSingle
    v-model="plantId"
    :use-query-fn-options="plantModelApi.paginated.use"
    :query-params-options="{}"
    :value-getter="item => item.id"
    title="Plant"
    placeholder="Search by name or species"
    allow-clear
    :clear-value="null"
    class="max-w-md"
  >
    <template #option="{option}">
      <div class="w-option flex items-center">
        <span v-if="option">
          {{ option.name }} <span class="text-description italic">— {{ option.species }}</span>
        </span>
      </div>
    </template>
  </WSelectAsyncSingle>

  <p class="text-sm text-description">
    Model: {{ plantId ?? 'null' }}
  </p>
</template>

<script lang="ts" setup>
import {ref} from 'vue'

import WSelectAsyncSingle from 'eco-vue-js/dist/components/Select/WSelectAsyncSingle.vue'

// The `use` of any paginated query — here the plant model from the list recipe.
import {plantModelApi} from '../../../../../docs/examples/recipes/plant-list/api/Plant'

const plantId = ref<number | null>(3)
</script>
