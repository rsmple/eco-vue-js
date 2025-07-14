<template>
  <div
    ref="container"
    :class="{
      'size-full cursor-progress': skeleton,
    }"
  >
    <WSkeleton
      v-if="skeleton"
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
        :format="value => dateFormat(new Date(value))"
        :domain="xExtent"
        :transform="`translate(0, ${svgHeight - bottom})`"
      />

      <ChartAxis
        v-if="!yHidden"
        orientation="y"
        :scale="scaleY"
        :domain="yDomainComputed"
        :format="yFormat"
        :transform="`translate(${left}, 0)`"
      />

      <slot
        v-if="!skeleton"
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

import DOMListenerContainer from '@/utils/DOMListenerContainer'
import {dateFormat} from '@/utils/dateTime'

import ChartAxis from './components/ChartAxis.vue'

const props = withDefaults(
  defineProps<{
    xDomain: [number, number]
    yDomainGetter?: (extent: [number, number]) => [number, number]
    height?: number
    xHidden?: boolean
    yHidden?: boolean
    yFormat?: (value: number) => string
    top?: number
    bottom?: number
    left?: number
    right?: number
    skeleton?: boolean
  }>(),
  {
    yDomainGetter: undefined,
    height: 0,
    top: 10,
    bottom: 20,
    left: 40,
    right: 32,
    yFormat: undefined,
  },
)

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
    Math.floor((min > 0 ? 0 : min) / yRoundFactor) * yRoundFactor,
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

const listenerContainer = new DOMListenerContainer([window], ['resize'], requestUpdateWidth)

onMounted(() => {
  updateSize()
})

onBeforeUnmount(() => {
  listenerContainer.destroy()
})

defineExpose({
  updateSize,
})

defineSlots<{
  default: (props: ChartContext) => VNode[]
}>()
</script>