<template>
  <WSelectAsyncSingle
    v-model="batchId"
    :use-query-fn-options="batchModelApi.paginated.use"
    :query-params-options="{}"
    :value-getter="item => item.id"
    title="Seed tray"
    placeholder="Search by bed or crop"
    :option-component="OptionBatch"
    allow-clear
    :clear-value="null"
    class="max-w-md"
  />

  <p class="text-sm text-description">
    Model: {{ batchId ?? 'null' }}
  </p>
</template>

<script lang="ts" setup>
import {ref} from 'vue'

import WSelectAsyncSingle from 'eco-vue-js/dist/components/Select/WSelectAsyncSingle.vue'

import {batchModelApi} from './api/garden'
import OptionBatch from './parts/OptionBatch.vue'

const batchId = ref<number | null>(3)
</script>
