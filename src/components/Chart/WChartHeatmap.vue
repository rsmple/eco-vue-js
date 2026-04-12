<template>
  <WSkeleton
    v-if="isSkeleton"
    class="w-skeleton-w-full w-skeleton-h-full w-skeleton-rounded-2xl"
  />

  <div v-else>
    <div class="grid grid-cols-[1fr,auto] gap-2">
      <div class="text-accent sm-not:text-2xs text-xs font-semibold">
        {{ title }}
      </div>

      <div class="flex justify-end">
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
      <div class="from-default text-2xs text-description dark:from-default-dark via-default dark:via-default-dark absolute inset-y-0 left-0 z-[1] flex w-5 flex-col bg-gradient-to-r to-transparent pt-4">
        <div
          v-for="(label, i) in DAY_LABELS"
          :key="i"
          class="my-[--w-chart-heatmap-gap,0.125rem] flex h-[--w-chart-heatmap-size,1rem] items-center"
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
            v-for="(week, wi) in weeks"
            :key="wi"
            class="flex flex-col"
          >
            <div class="text-2xs text-description flex h-4 w-0 items-end whitespace-nowrap">
              {{ week.monthLabel }}
            </div>

            <template
              v-for="(cell, di) in week.days"
              :key="di"
            >
              <HeatmapCell :opacity="cell?.opacity ?? null">
                <slot
                  v-if="cell?.d"
                  name="tooltip"
                  :d="cell.d"
                  :index="cell.dataIndex"
                />
              </HeatmapCell>
            </template>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup generic="Data extends Record<string, number>">
import {computed, nextTick, onMounted, useTemplateRef, watch} from 'vue'

import WSkeleton from '@/components/Skeleton/WSkeleton.vue'

import {useComponentStatesSkeleton} from '@/utils/useComponentStates'

import HeatmapCell from './components/HeatmapCell.vue'

const OPACITIES = [0.1, 0.25, 0.5, 0.75, 1] as const

const DAY_LABELS = ['M', '', 'W', '', 'F', '', 'S'] as const

type GridCell = {
  opacity: number
  d: Data | undefined
  dataIndex: number
}

type WeekData = {
  days: Array<GridCell | null>
  monthLabel: string | undefined
}

const props = withDefaults(
  defineProps<{
    data: Data[]
    xKey: keyof Data
    yKey: keyof Data
    title?: string
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

const monthFormatter = new Intl.DateTimeFormat('en', {month: 'short'})

const dateToKey = (date: Date): string => {
  return `${ date.getFullYear() }-${ String(date.getMonth() + 1).padStart(2, '0') }-${ String(date.getDate()).padStart(2, '0') }`
}

const maxValue = computed(() => {
  let max = 0
  for (const item of props.data) {
    const value = item[props.yKey]
    if (typeof value === 'number' && value > max) max = value
  }

  return max || 1
})

const niceCeil = (raw: number): number => {
  if (raw <= 1) return 1
  const magnitude = Math.pow(10, Math.floor(Math.log10(raw)))
  const residual = raw / magnitude
  if (residual <= 1) return magnitude
  if (residual <= 2) return 2 * magnitude
  if (residual <= 5) return 5 * magnitude
  return 10 * magnitude
}

const thresholds = computed(() => {
  const step = niceCeil(maxValue.value / OPACITIES.length)

  return OPACITIES.map((_, i) => i * step)
})

const getOpacity = (value: number): typeof OPACITIES[number] => {
  for (let i = OPACITIES.length - 1; i > 0; i--) {
    if (value >= thresholds.value[i]!) return OPACITIES[i]!
  }

  return OPACITIES[0]!
}

const weeks = computed<WeekData[]>(() => {
  const dateMap = new Map<string, {d: Data, dataIndex: number}>()
  props.data.forEach((d, i) => {
    const date = new Date(d[props.xKey])
    date.setHours(0, 0, 0, 0)
    dateMap.set(dateToKey(date), {d, dataIndex: i})
  })

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const startDate = new Date(today)
  startDate.setFullYear(startDate.getFullYear() - 1)
  startDate.setDate(startDate.getDate() + 1)

  const gridStart = new Date(startDate)
  const startDay = (gridStart.getDay() + 6) % 7
  gridStart.setDate(gridStart.getDate() - startDay)

  const gridEnd = new Date(today)
  const endDay = (gridEnd.getDay() + 6) % 7
  if (endDay < 6) gridEnd.setDate(gridEnd.getDate() + (6 - endDay))

  const result: WeekData[] = []
  const current = new Date(gridStart)
  let lastMonth = -1

  while (current <= gridEnd) {
    const days: Array<GridCell | null> = []
    let firstVisibleDate: Date | undefined

    for (let i = 0; i < 7; i++) {
      if (current < startDate || current > today) {
        days.push(null)
      } else {
        if (!firstVisibleDate) firstVisibleDate = new Date(current)

        const key = dateToKey(current)
        const entry = dateMap.get(key)

        days.push(entry
          ? {opacity: getOpacity(entry.d[props.yKey]), d: entry.d, dataIndex: entry.dataIndex}
          : {opacity: OPACITIES[0], d: undefined, dataIndex: -1},
        )
      }

      current.setDate(current.getDate() + 1)
    }

    let monthLabel: string | undefined

    if (firstVisibleDate) {
      const month = firstVisibleDate.getMonth()
      if (month !== lastMonth) {
        monthLabel = monthFormatter.format(firstVisibleDate)
        lastMonth = month
      }
    }

    result.push({days, monthLabel})
  }

  return result
})

defineSlots<{
  tooltip?: (props: {d: Data, index: number}) => unknown
}>()
</script>
