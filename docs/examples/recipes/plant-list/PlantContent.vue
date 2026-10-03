<template>
  <div class="grid gap-4 py-2 md:grid-cols-3">
    <!-- Care: what the plant needs, each fact in its own tone. -->
    <section class="grid content-start gap-3 p-4 rounded-2xl bg-surface-subtle">
      <WSkeleton
        v-if="skeleton || !item"
        class="w-skeleton-h-20"
      />

      <template v-else>
        <p class="text-description text-sm">
          {{ item.description }}
        </p>

        <div class="grid grid-cols-2 gap-2">
          <div
            v-for="fact in getFacts(item)"
            :key="fact.title"
            class="flex items-center gap-2"
            :class="fact.tone"
          >
            <span class="surface-soft text-tone flex size-8 shrink-0 items-center justify-center rounded-full">
              <component
                :is="fact.icon"
                class="square-4"
              />
            </span>

            <span class="grid min-w-0">
              <span class="text-description truncate text-xs">{{ fact.title }}</span>
              <span class="truncate text-sm font-semibold tabular-nums">{{ fact.value }}</span>
            </span>
          </div>
        </div>
      </template>
    </section>

    <!-- Growth: the six-month height as a chart, with a tooltip per month. -->
    <section class="grid content-start gap-1 p-4 rounded-2xl bg-surface-subtle">
      <h4 class="flex items-baseline justify-between text-sm font-semibold">
        Growth
        <span
          v-if="item && !skeleton"
          class="tone-data-green text-tone text-xs tabular-nums"
        >+{{ item.height - item.growth[0]!.height }} cm in 6 months</span>
      </h4>

      <WChartLinear
        :x-domain="xDomain"
        :height="176"
        :skeleton="skeleton || !item"
        y-hidden
      >
        <template #default="scope">
          <WChartLine
            v-if="item"
            v-bind="scope"
            :data="item.growth.toReversed()"
            x-key="date"
            y-key="height"
            has-area
            calc-min
            class="tone-data-green text-tone"
          >
            <template #tooltip="{d, prev}">
              <div class="grid text-sm text-start">
                <span class="text-description">{{ dateFormatShort(new Date(d.date)) }}</span>
                <span>
                  <span class="font-semibold">{{ d.height }} cm</span> <span
                    v-if="prev"
                    class="text-description"
                  >+{{ d.height - prev.height }} cm that month</span>
                </span>
              </div>
            </template>
          </WChartLine>
        </template>
      </WChartLinear>
    </section>

    <!-- Schedule: a four-week watering calendar and the next tasks. -->
    <section class="grid content-start gap-4 p-4 rounded-2xl bg-surface-subtle">
      <div class="grid gap-2">
        <h4 class="flex items-baseline justify-between gap-4 text-sm font-semibold">
          Watering
          <span
            v-if="item && !skeleton"
            class="text-description text-xs font-normal"
          >{{ item.waterings.length }} times in 4 weeks</span>
        </h4>

        <WSkeleton
          v-if="skeleton || !item"
          class="w-skeleton-h-16"
        />

        <!-- One square a day, oldest first, filled on the days it was watered. -->
        <div
          v-else
          class="tone-data-blue grid grid-cols-7 gap-1"
        >
          <span
            v-for="day in days"
            :key="+day"
            class="h-3.5 rounded-sm"
            :class="item.waterings.some(watering => isSameDate(watering, day)) ? 'bg-tone-fill' : 'bg-tone-soft'"
            :title="dateFormat(day)"
          />
        </div>
      </div>

      <div class="grid gap-1.5">
        <h4 class="text-sm font-semibold">
          Next up
        </h4>

        <WSkeleton
          v-if="skeleton || !item"
          class="w-skeleton-h-16"
        />

        <ul
          v-else
          class="grid gap-1"
        >
          <li
            v-for="task in item.tasks"
            :key="task.title"
            class="flex items-center justify-between gap-2 text-sm"
          >
            {{ task.title }}

            <WChip
              :text="getDueText(task.due)"
              :semantic-type="task.due < today ? SemanticType.NEGATIVE : task.due <= soon ? SemanticType.WARNING : SemanticType.SECONDARY"
            />
          </li>
        </ul>
      </div>
    </section>
  </div>
</template>

<script lang="ts" setup>
import type {QueryParamsPlants} from './api/Plant'
import type {Plant} from './models/Plant'

import {markRaw} from 'vue'

import type {FieldProps} from 'eco-vue-js/dist/components/List/types'
import {SemanticType} from 'eco-vue-js/dist/utils/SemanticType'
import {addDay, addMonth, dateFormat, dateFormatShort, getStartOfDay, isSameDate} from 'eco-vue-js/dist/utils/dateTime'

import WChartLine from 'eco-vue-js/dist/components/Chart/WChartLine.vue'
import WChartLinear from 'eco-vue-js/dist/components/Chart/WChartLinear.vue'
import WChip from 'eco-vue-js/dist/components/Chip/WChip.vue'
import WSkeleton from 'eco-vue-js/dist/components/Skeleton/WSkeleton.vue'

import IconDrop from 'eco-vue-js/dist/assets/icons/IconDrop'
import IconThermometer from 'eco-vue-js/dist/assets/icons/IconThermometer'
import IconWind from 'eco-vue-js/dist/assets/icons/IconWind'

import {lightDisplay} from './models/PlantDisplay'

defineProps<Omit<FieldProps<Plant | undefined, QueryParamsPlants>, 'config'>>()

const today = getStartOfDay()
const soon = addDay(today, 3)
const xDomain: [number, number] = [+addMonth(today, -5), +today]

// The last four weeks, oldest first.
const days = Array.from({length: 28}, (_, index) => addDay(today, index - 27))

const getFacts = (item: Plant) => [
  {title: 'Light', value: lightDisplay[item.light].name, tone: lightDisplay[item.light].tone, icon: lightDisplay[item.light].icon},
  {title: 'Water', value: `${ item.water } ml`, tone: 'tone-data-blue', icon: markRaw(IconDrop)},
  {title: 'Humidity', value: `${ item.humidity }%`, tone: 'tone-data-cyan', icon: markRaw(IconWind)},
  {title: 'Temperature', value: `${ item.temperature[0] }–${ item.temperature[1] } °C`, tone: 'tone-data-red', icon: markRaw(IconThermometer)},
]

const getDueText = (due: Date) => {
  const left = Math.round((+due - +today) / 86_400_000)

  if (left < 0) return `${ -left } d overdue`
  if (left === 0) return 'Today'
  return `In ${ left } d`
}
</script>
