<template>
  <div class="grid gap-2">
    <div class="flex gap-4 text-sm">
      <span class="text-primary dark:text-primary-dark">— Open findings</span>
      <span class="text-positive dark:text-positive-dark">- - Fixed</span>
    </div>

    <WChartLinear
      :x-domain="[from, today]"
      :height="200"
      :y-format="value => numberCompactFormatter.format(value)"
      y-right
    >
      <template #default="scope">
        <WChartLine
          v-bind="scope"
          :data="open"
          x-key="date"
          y-key="value"
          y-key-min="min"
          y-key-max="max"
          class="text-primary dark:text-primary-dark"
        >
          <template #tooltip="{d, prev}">
            <div class="grid text-sm">
              <span class="text-description">{{ dateFormat(new Date(d.date)) }}</span>
              <span class="font-semibold">{{ d.value }} open</span>
              <span
                v-if="prev"
                class="text-description"
              >{{ d.value - prev.value >= 0 ? '+' : '' }}{{ d.value - prev.value }} since the day before</span>
            </div>
          </template>
        </WChartLine>

        <WChartLine
          v-bind="scope"
          :data="fixed"
          x-key="date"
          y-key="value"
          stroke-style="dashed-small"
          has-area
          class="text-positive dark:text-positive-dark"
        />
      </template>
    </WChartLinear>
  </div>
</template>

<script lang="ts" setup>
import {addDay, dateFormat, getStartOfDay} from 'eco-vue-js/dist/utils/dateTime'
import {numberCompactFormatter} from 'eco-vue-js/dist/utils/utils'

import WChartLine from 'eco-vue-js/dist/components/Chart/WChartLine.vue'
import WChartLinear from 'eco-vue-js/dist/components/Chart/WChartLinear.vue'

const today = +getStartOfDay()
const from = +addDay(getStartOfDay(), -29)

// Points go newest first, one a day for the last 30 days.
const open = Array.from({length: 30}, (_, index) => {
  const value = Math.round(120 + 30 * Math.sin(index / 4) - index)
  return {date: +addDay(getStartOfDay(), -index), value, min: value - 12, max: value + 12}
})

const fixed = Array.from({length: 30}, (_, index) => ({date: +addDay(getStartOfDay(), -index), value: Math.max(0, 60 - 2 * index + (index % 5) * 3)}))
</script>
