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

import {gardeners} from '../../../../../docs/examples/shared/Gardener'
import OptionGardener from '../../../../../docs/examples/shared/OptionGardener.vue'

const gardenerId = ref<number | null>(1)
</script>
