<template>
  <WSkeleton
    v-if="isSkeleton"
    class="w-skeleton-w-full w-skeleton-h-full w-skeleton-rounded-2xl"
  />

  <div v-else>
    <div class="grid h-(--w-chart-heatmap-size,1rem) grid-cols-[1fr_auto] items-center gap-2">
      <div class="text-accent sm-not:text-2xs text-xs font-semibold">
        {{ title }}
      </div>

      <div
        v-if="data.length"
        class="flex justify-end"
      >
        <HeatmapCell
          v-for="(opacity, i) in OPACITIES"
          :key="opacity"
          :opacity="opacity"
        >
          {{ thresholds[i] }}{{ i === OPACITIES.length - 1 ? '+' : '' }}
        </HeatmapCell>
      </div>
    </div>

    <div class="relative isolate grid justify-end">
      <div
        class="
          from-(--w-chart-heatmap-bg,var(--w-surface))
          via-(--w-chart-heatmap-bg,var(--w-surface))
          text-2xs text-description absolute inset-y-0 left-0 z-1 flex w-5 flex-col bg-linear-to-r to-transparent pt-4
        "
      >
        <div
          v-for="(label, i) in dayLabels"
          :key="i"
          class="my-(--w-chart-heatmap-gap,0.125rem) flex h-(--w-chart-heatmap-size,1rem) items-center"
        >
          {{ label }}
        </div>
      </div>

      <div
        ref="scrollContainer"
        class="flex overflow-x-auto overscroll-x-contain"
      >
        <div class="flex pl-4">
          <div
            v-for="(week, wi) in weekGrid"
            :key="wi"
            class="flex flex-col"
          >
            <div class="text-2xs text-description flex h-4 w-0 items-end whitespace-nowrap">
              {{ week.month ? monthShortFormatter.format(week.month) : '' }}
            </div>

            <template
              v-for="(key, di) in week.days"
              :key="di"
            >
              <HeatmapCell
                :opacity="key !== null ? (dataMap.get(key)?.opacity ?? null) : null"
                :empty="key === null"
              >
                <slot
                  v-if="key !== null && dataMap.has(key)"
                  name="tooltip"
                  :d="dataMap.get(key)!.d"
                  :index="dataMap.get(key)!.dataIndex"
                />
              </HeatmapCell>
            </template>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup generic="Data extends Record<string, unknown>">
import {computed, nextTick, onMounted, useTemplateRef, watch} from 'vue'

import WSkeleton from '@/components/Skeleton/WSkeleton.vue'

import {addDay, getStartOfWeek, monthShortFormatter, weekdayNarrowFormatter} from '@/utils/dateTime'
import {useComponentStatesSkeleton} from '@/utils/useComponentStates'

import HeatmapCell from './components/HeatmapCell.vue'
import {dateToKey, weekGrid} from './models/WeekGrid'

const OPACITIES = [0.2, 0.4, 0.6, 0.8, 1] as const

// Monday, Wednesday and Friday, in the locale set with `setLocale`.
const dayLabels = computed(() => {
  const monday = getStartOfWeek()

  return Array.from({length: 7}, (_, index) => index % 2 || index > 4 ? '' : weekdayNarrowFormatter.format(addDay(monday, index)))
})

type DataEntry = {
  opacity: number
  d: Data
  dataIndex: number
}

const props = withDefaults(
  defineProps<{
    /** Values by day, over the last year. */
    data: Data[]
    /** Key of the timestamp of a day, in ms. */
    xKey: keyof PickByType<Required<Data>, number>
    /** Key of the day's value, which sets its shade. */
    yKey: keyof PickByType<Required<Data>, number>
    /** Heading above the grid, next to the legend. */
    title?: string
    /** Shows a placeholder instead of the chart. When unset, inherits the skeleton state provided by a parent. */
    skeleton?: boolean
  }>(),
  {
    title: undefined,
    skeleton: undefined,
  },
)

const {isSkeleton} = useComponentStatesSkeleton(props)

const scrollContainerRef = useTemplateRef('scrollContainer')

onMounted(() => {
  if (scrollContainerRef.value) scrollContainerRef.value.scrollLeft = scrollContainerRef.value.scrollWidth
})

watch(isSkeleton, async value => {
  if (value) return
  await nextTick()
  if (scrollContainerRef.value) scrollContainerRef.value.scrollLeft = scrollContainerRef.value.scrollWidth
})

const maxValue = computed(() => {
  let max = 0
  for (const item of props.data) {
    const value = item[props.yKey]
    if (typeof value === 'number' && value > max) max = value
  }

  return max || 1
})

const niceFloor = (raw: number): number => {
  if (raw < 1) return 1
  const magnitude = Math.pow(10, Math.floor(Math.log10(raw)))
  const residual = raw / magnitude
  if (residual < 2) return magnitude
  if (residual < 5) return 2 * magnitude
  return 5 * magnitude
}

const thresholds = computed(() => {
  const step = niceFloor(maxValue.value / (OPACITIES.length - 1))

  return OPACITIES.map((_, i) => i * step)
})

const getOpacity = (value: number): typeof OPACITIES[number] => {
  for (let i = OPACITIES.length - 1; i > 0; i--) {
    if (value >= thresholds.value[i]!) return OPACITIES[i]!
  }

  return OPACITIES[0]!
}

const dataMap = computed(() => {
  const map = new Map<string, DataEntry>()

  props.data.forEach((d, i) => {
    const x = d[props.xKey]
    const y = d[props.yKey]
    if (typeof x !== 'number' || typeof y !== 'number') return

    const date = new Date(x)
    date.setHours(0, 0, 0, 0)
    map.set(dateToKey(date), {opacity: getOpacity(y), d, dataIndex: i})
  })

  return map
})

defineSlots<{
  /** Tooltip of a day with data, with the day's data and its index in `data`. */
  tooltip?: (props: {d: Data, index: number}) => unknown
}>()
</script>
