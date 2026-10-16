<template>
  <WInputOptions
    v-model="variety"
    title="Variety"
    placeholder="Type any name or pick a known one"
    :use-query-fn-options="varietyModelApi.paginated.use"
    :query-params-options="{}"
    :value-getter="option => option.name"
    :option-component="OptionVariety"
    empty-stub="No known variety"
    draft
    allow-clear
    class="max-w-xl"
  />

  <p class="text-sm text-description">
    Model: {{ variety || '—' }}
  </p>
</template>

<script lang="ts" setup>
import {ref} from 'vue'

import WInputOptions from 'eco-vue-js/dist/components/Input/WInputOptions.vue'

import {varietyModelApi} from '../../../Select/docs/examples/api/garden'
import OptionVariety from '../../../Select/docs/examples/parts/OptionVariety.vue'

const variety = ref<string | null>()
</script>
