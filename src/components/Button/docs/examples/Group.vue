<template>
  <WButtonGroup
    v-model="period"
    :list="periods"
    title="Period"
  />

  <p class="mt-2 text-sm text-gray-500">
    Selected: {{ period }}
  </p>
</template>

<script lang="ts" setup>
import {ref} from 'vue'

import WButtonGroup from 'eco-vue-js/dist/components/Button/WButtonGroup.vue'

const periods = ['day', 'week', 'month'] as const

const period = ref<typeof periods[number]>('week')
</script>
