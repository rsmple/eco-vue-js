<template>
  <div class="vp-raw grid gap-6">
    <div class="sm:w-page-bleed grid grid-cols-2 gap-3 lg:grid-cols-4">
      <WCard
        v-for="stat in STATS"
        :key="stat.title"
        :title="stat.title"
      >
        <span class="text-accent text-2xl font-semibold tabular-nums">{{ stat.value }}</span>

        <span
          class="bg-tone-soft text-tone w-fit rounded-md px-1.5 text-xs font-medium"
          :class="stat.tone"
        >{{ stat.change }}</span>
      </WCard>
    </div>

    <PlantList scroll-page />
  </div>
</template>

<script lang="ts" setup>
import {onMounted, onUnmounted} from 'vue'

import WCard from 'eco-vue-js/dist/components/Surface/WCard.vue'

import PlantList from '../plant-list/PlantList.vue'

const STATS = [
  {title: 'Plants', value: '128', change: '+4 this week', tone: 'tone-positive'},
  {title: 'Due for water', value: '17', change: '3 overdue', tone: 'tone-warning'},
  {title: 'Dry', value: '2', change: '−1 since Monday', tone: 'tone-negative'},
  {title: 'Caretakers', value: '6', change: 'no change', tone: 'tone-info'},
]

onMounted(() => {
  // The window scrolls sideways under a wide list, as an app page does: the docs shell clips that elsewhere.
  document.documentElement.classList.add('docs-scroll-x')
})

onUnmounted(() => {
  document.documentElement.classList.remove('docs-scroll-x')
})
</script>
