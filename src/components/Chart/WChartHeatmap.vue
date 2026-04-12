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
            v-for="(week, wi) in weekGrid"
            :key="wi"
            class="flex flex-col"
          >
            <div class="text-2xs text-description flex h-4 w-0 items-end whitespace-nowrap">
              {{ week.monthLabel }}
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

<script lang="ts" setup generic="Data extends Record<string, number>">
import {computed, nextTick, onMounted, useTemplateRef, watch} from 'vue'

import WSkeleton from '@/components/Skeleton/WSkeleton.vue'

import {useComponentStatesSkeleton} from '@/utils/useComponentStates'

import HeatmapCell from './components/HeatmapCell.vue'
import {dateToKey, weekGrid} from './models/WeekGrid'

const OPACITIES = [0.2, 0.4, 0.6, 0.8, 1] as const

const DAY_LABELS = ['M', '', 'W', '', 'F', '', ''] as const

type DataEntry = {
  opacity: number
  d: Data
  dataIndex: number
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

const dataMap = computed(() => {
  const map = new Map<string, DataEntry>()

  props.data.forEach((d, i) => {
    const date = new Date(d[props.xKey])
    date.setHours(0, 0, 0, 0)
    map.set(dateToKey(date), {opacity: getOpacity(d[props.yKey]), d, dataIndex: i})
  })

  return map
})

defineSlots<{
  tooltip?: (props: {d: Data, index: number}) => unknown
}>()
</script>
