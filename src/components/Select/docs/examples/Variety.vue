<template>
  <WSelectAsync
    :model-value="varietyIds"
    :use-query-fn-options="varietyModelApi.paginated.use"
    :query-params-options="{}"
    :value-getter="item => item.id"
    title="Seeds to order"
    placeholder="Search by variety or crop"
    :option-component="OptionVariety"
    class="max-w-xl"
    @select="varietyIds = [...varietyIds, $event]"
    @unselect="varietyIds = varietyIds.filter(item => item !== $event)"
    @update:model-value="varietyIds = $event"
  >
    <!-- A legend for the calendar strip, above the options. -->
    <template #content>
      <div class="text-description flex gap-3 px---w-select-option-padding pt-2 text-xs">
        <span class="flex items-center gap-1"><span class="bg-data-teal size-2 rounded-full" /> Sow</span>
        <span class="flex items-center gap-1"><span class="bg-data-amber size-2 rounded-full" /> Harvest</span>
      </div>
    </template>
  </WSelectAsync>

  <p class="text-sm text-description">
    Model: {{ varietyIds }}
  </p>
</template>

<script lang="ts" setup>
import {ref} from 'vue'

import WSelectAsync from 'eco-vue-js/dist/components/Select/WSelectAsync.vue'

import {varietyModelApi} from './api/garden'
import OptionVariety from './parts/OptionVariety.vue'

const varietyIds = ref<number[]>([1, 9])
</script>
