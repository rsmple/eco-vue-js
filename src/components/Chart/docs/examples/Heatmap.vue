<template>
  <WChartHeatmap
    :data="scans"
    x-key="date"
    y-key="count"
    title="Scans in the last year"
    class="tone-primary text-tone-fill"
  >
    <template #tooltip="{d}">
      {{ d.count }} scans on {{ dateFormat(new Date(d.date)) }}
    </template>
  </WChartHeatmap>
</template>

<script lang="ts" setup>
import {addDay, dateFormat, getStartOfDay} from 'eco-vue-js/dist/utils/dateTime'

import WChartHeatmap from 'eco-vue-js/dist/components/Chart/WChartHeatmap.vue'

// A made-up count for every weekday of the last year, more on some weeks than others.
const scans = Array.from({length: 365}, (_, index) => {
  const date = addDay(getStartOfDay(), -index)
  const weekday = date.getDay() !== 0 && date.getDay() !== 6

  return {date: +date, count: weekday ? (index * 7) % 23 + (Math.floor(index / 30) % 3) * 5 : 0}
}).filter(item => item.count > 0)
</script>
