<template>
  <div
    ref="container"
    :class="{
      'size-full cursor-progress': isSkeleton,
    }"
  >
    <WSkeleton
      v-if="isSkeleton"
      class="w-skeleton-w-full w-skeleton-h-full w-skeleton-rounded-2xl"
    />

    <svg
      v-else-if="svgWidth !== 0 && svgHeight !== 0"
      :height="svgHeight"
      :width="svgWidth"
      class="min-w-0"
    >
      <ChartAxis
        v-if="!xHidden"
        orientation="x"
        :scale="scaleX"
        :format="value => isSameDate(new Date(value), new Date) ? todayFormat() : dateFormatShort(new Date(value))"
        :domain="xExtent"
        :transform="`translate(0, ${svgHeight - bottom})`"
        :y-right="yRight === true"
      />

      <ChartAxis
        v-if="!yHidden"
        orientation="y"
        :scale="scaleY"
        :domain="yDomainComputed"
        :format="yFormat"
        :transform="`translate(${yRight ? svgWidth - right : left}, 0)`"
        :y-right="yRight === true"
      />

      <slot
        v-if="!isSkeleton"
        :scale-x="scaleX"
        :scale-y="scaleY"
        :svg-width="svgWidth"
        :svg-height="svgHeight"
        :top="top"
        :bottom="bottom"
        :left="left"
        :right="right"
        :x-extent="xExtent"
        :on-update-domain="handleDomainUpdate"
      />
    </svg>
  </div>
</template>

<script lang="ts" setup>
import type {ChartContext} from './types'

import {type VNode, computed, onBeforeUnmount, onMounted, ref, useTemplateRef, watch} from 'vue'

import WSkeleton from '@/components/Skeleton/WSkeleton.vue'

import {dateFormatShort, isSameDate, todayFormat} from '@/utils/dateTime'
import {useComponentStatesSkeleton} from '@/utils/useComponentStates'

import ChartAxis from './components/ChartAxis.vue'

const props = withDefaults(
  defineProps<{
    /** Time range of the x axis, as `[from, to]` timestamps in ms. The axis labels are dates, and "Today", in the locale set with `setLocale`. */
    xDomain: [number, number]
    /** Range of the y axis from the range of all the lines' values. By default it is rounded out to tens or hundreds and starts at 0 or below. */
    yDomainGetter?: (extent: [number, number]) => [number, number]
    /** Height of the chart in px. By default it fills the height of its parent. */
    height?: number
    /** Hides the x axis. */
    xHidden?: boolean
    /** Hides the y axis. */
    yHidden?: boolean
    /** Puts the y axis on the right. */
    yRight?: boolean
    /** Labels of the y axis. */
    yFormat?: (value: number) => string
    /** Space above the plot in px, for the axis labels. */
    top?: number
    /** Space under the plot in px. */
    bottom?: number
    /** Space left of the plot in px. */
    left?: number
    /** Space right of the plot in px. */
    right?: number
    /** Shows a placeholder instead of the chart. When unset, inherits the skeleton state provided by a parent. */
    skeleton?: boolean
  }>(),
  {
    yDomainGetter: undefined,
    height: 0,
    top: 16,
    bottom: 16,
    left: 3,
    right: 3,
    yFormat: undefined,
    skeleton: undefined,
  },
)

const {isSkeleton} = useComponentStatesSkeleton(props)

const svgWidth = ref(0)
const svgHeight = ref(props.height)
const containerRef = useTemplateRef('container')

const xExtent = computed(() => props.xDomain)

const lineDomains = ref<Map<string, [number, number]>>(new Map())

const yExtent = computed<[number, number]>(() => {
  if (lineDomains.value.size === 0) return [0, 100]
  
  const allYValues: number[] = []
  lineDomains.value.forEach(domain => {
    allYValues.push(...domain)
  })
  
  return allYValues.length > 0 
    ? [Math.min(...allYValues), Math.max(...allYValues)]
    : [0, 100]
})

const yDomainComputed = computed<[number, number]>(() => {
  if (props.yDomainGetter) return props.yDomainGetter(yExtent.value)

  const [min, max] = yExtent.value
  const yRoundFactor = min > -100 && min < 100 && max < 100 ? 10 : 100

  return [
    Math.floor(min / yRoundFactor) * yRoundFactor,
    Math.max(Math.ceil(max / yRoundFactor) * yRoundFactor, yRoundFactor),
  ]
})

const handleDomainUpdate = (lineId: string, yExtent: [number, number]) => {
  lineDomains.value.set(lineId, yExtent)
}

const scaleX = (value: number) => props.left + ((value - xExtent.value[0]) / (xExtent.value[1] - xExtent.value[0])) * (svgWidth.value - props.right - props.left)
const scaleY = (value: number) => (svgHeight.value - props.bottom) - ((value - yDomainComputed.value[0]) / (yDomainComputed.value[1] - yDomainComputed.value[0])) * (svgHeight.value - props.bottom - props.top)

const updateSize = () => {
  if (!containerRef.value) return
  svgWidth.value = Math.floor(containerRef.value.offsetWidth)
  svgHeight.value = props.height || Math.floor(containerRef.value.parentElement?.offsetHeight ?? containerRef.value.offsetHeight)
}

const animationFrameId = ref<number | undefined>()
const requestUpdateWidth = () => {
  if (animationFrameId.value) cancelAnimationFrame(animationFrameId.value)
  animationFrameId.value = requestAnimationFrame(updateSize)
}

watch(() => props.height, newHeight => {
  if (newHeight) svgHeight.value = newHeight
})

let observer: ResizeObserver | null = null

onMounted(() => {
  if (!containerRef.value) return

  observer = new ResizeObserver(requestUpdateWidth)
  observer.observe(containerRef.value)
})

onBeforeUnmount(() => {
  observer?.disconnect()
  observer = null

  if (animationFrameId.value) cancelAnimationFrame(animationFrameId.value)
})

defineExpose({
  updateSize,
})

defineSlots<{
  /** SVG content of the chart, such as WChartLine lines — bind the scope to each one. Gets the scales and sizes for drawing your own marks. */
  default: (props: ChartContext) => VNode[]
}>()
</script>