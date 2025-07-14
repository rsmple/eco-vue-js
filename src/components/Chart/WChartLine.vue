<template>
  <g v-if="dataFiltered.length">
    <defs>
      <linearGradient
        v-if="$slots.gradient"
        :id="gradientId"
        gradientTransform="rotate(90)"
      >
        <slot
          name="gradient"
          v-bind="{
            scaleY,
            scaleYPercent,
            topPercent: top / svgHeight,
            bottomPercent: 1 - bottom / svgHeight,
          }"
        />
      </linearGradient>

      <linearGradient
        v-if="hasArea && !yKeyMin && !yKeyMax"
        :id="gradientAreaId"
        gradientTransform="rotate(90)"
      >
        <stop
          offset="0%"
          stop-color="#222222"
        />
        <stop
          offset="70%"
          stop-color="#111111"
        />
        <stop
          offset="100%"
          stop-color="#000000"
        />
      </linearGradient>

      <mask :id="maskId">
        <template v-if="yKeyMin && yKeyMax">
          <path
            v-if="minMaxAreaPath"
            :d="minMaxAreaPath"
            fill="white"
            fill-opacity="0.2"
            class="transition-[d]"
          />
        </template>

        <path
          v-else-if="hasArea && areaPath"
          :d="areaPath"
          :fill="`url(#${gradientAreaId})`"
          class="transition-[d]"
        />

        <path
          v-if="linePath"
          :d="linePath"
          fill="none"
          :stroke-width="strokeWidth ?? 2"
          :stroke-dasharray="strokeDashArray"
          stroke="white"
          stroke-linejoin="round"
          stroke-linecap="round"
          class="transition-[d]"
        />

        <g v-if="$slots.tooltip && hoveredData && tooltipRef?.isOpen">
          <circle
            :cx="hoveredData.x"
            :cy="hoveredData.y"
            :r="pointRadius ?? 3"
            fill="white"
          />
        </g>
      </mask>
    </defs>

    <g v-if="$slots.tooltip && tooltipData.length !== 0">
      <rect
        ref="overlay"
        width="100%"
        height="100%"
        fill="transparent"
        class="cursor-crosshair"
        @mousemove="handleMouseMove"
        @mouseleave="closeTooltip"
        @mouseenter="handleMouseEnter"
      />

      <g :transform="`translate(${hoveredData?.x ?? 0} 0)`">
        <line
          v-if="hoveredData && tooltipRef?.isOpen"
          :x="hoveredData.x"
          :y1="top"
          :y2="svgHeight - bottom"
          stroke="currentColor"
          stroke-width="1"
          class="text-description pointer-events-none"
        />

        <foreignObject :y="svgHeight - bottom">
          <WTooltip
            ref="tooltip"
            no-trigger
          >
            <slot
              v-if="hoveredData"
              name="tooltip"
              :d="hoveredData.d"
              :x="hoveredData.x"
              :y="hoveredData.y"
              :index="hoveredIndex"
            />
          </WTooltip>
        </foreignObject>
      </g>
    </g>

    <rect
      width="100%"
      height="100%"
      :fill="$slots.gradient ? `url(#${gradientId})` : 'currentColor'"
      :mask="`url(#${maskId})`"
      class="pointer-events-none transition-[color]"
    />
  </g>

  <foreignObject
    v-else
    y="0"
    :x="left"
    width="100%"
    height="100%"
  >
    <div class="text-description text-2xs flex size-full cursor-not-allowed items-center opacity-40">
      <slot name="empty">
        <div>
          {{ emptyStub ?? 'No data' }}
        </div>
      </slot>
    </div>
  </foreignObject>
</template>

<script lang="ts" setup generic="Data extends Record<string, number>">
import type {ChartContext} from './types'

import {computed, nextTick, onUnmounted, ref, useId, useTemplateRef, watch} from 'vue'

import WTooltip from '@/components/Tooltip/WTooltip.vue'

type DataPrepared = {x: number, y: number, yMin: number, yMax: number, d: Data}

const props = defineProps<{
  data: Data[]
  xKey: keyof Data
  yKey: keyof Data
  yKeyMin?: keyof Data
  yKeyMax?: keyof Data
  strokeStyle?: 'solid' | 'dashed' | 'dotted'
  strokeWidth?: number
  hasArea?: boolean
  showPoints?: boolean
  pointRadius?: number
  emptyStub?: string
} & ChartContext>()

const gradientId = useId()
const gradientAreaId = useId()
const maskId = useId()
const lineId = useId()
const overlayRef = useTemplateRef('overlay')
const tooltipRef = useTemplateRef('tooltip')
const hoveredIndex = ref<number | null>(null)

const strokeDashArray = computed(() => {
  const width = props.svgWidth - props.left - props.right
  switch (props.strokeStyle) {
    case 'dashed':
      return width / (width > 500 ? 33 : 13)
    case 'dotted':
      return '2,2'
    default:
      return undefined
  }
})

const dataFiltered = computed<Data[]>(() => props.data
  .filter(data => typeof data[props.yKey] === 'number' &&
    typeof data[props.xKey] === 'number' &&
    data[props.xKey] >= props.xExtent[0] &&
    data[props.xKey] <= props.xExtent[1],
  ),
)

const ROUND_FACTOR = 100
const round = (value: number) => Math.round(value * ROUND_FACTOR) / ROUND_FACTOR

const preparedData = computed<DataPrepared[]>(() => {
  const result = dataFiltered.value.map(d => {
    const item = {
      x: round(Math.min(Math.max(props.scaleX(d[props.xKey]), props.left), props.svgWidth - props.right)),
      y: round(props.scaleY(d[props.yKey])),
      yMin: round(props.scaleY(d[props.yKeyMin!])),
      yMax: round(props.scaleY(d[props.yKeyMax!])),
      d,
    }

    item.yMin = props.yKeyMin && typeof d[props.yKeyMin] === 'number' ? round(props.scaleY(d[props.yKeyMin!])) : item.y
    item.yMax = props.yKeyMax && typeof d[props.yKeyMax] === 'number' ? round(props.scaleY(d[props.yKeyMax!])) : item.y

    return item
  })

  const lastIndex = result.length - 1
  if (result[lastIndex] && result[lastIndex].x !== props.left) result.push({...result[lastIndex], x: props.left})
  if (result[0] && result[0].x !== props.right) result.unshift({...result[0], x: props.svgWidth - props.right})

  return result
})

const tooltipData = computed<DataPrepared[]>(() => {
  return preparedData.value
    .slice(
      preparedData.value[0]?.d === preparedData.value[1]?.d ? 1 : 0,
      preparedData.value[preparedData.value.length - 1]?.d === preparedData.value[preparedData.value.length - 2]?.d ? -1 : undefined,
    )
    .reverse()
})

const hoveredData = computed(() => {
  if (hoveredIndex.value === null || !tooltipData.value[hoveredIndex.value]) return null
  return tooltipData.value[hoveredIndex.value]
})

const findNearestDataPoint = (mouseX: number): number | null => {
  const data = tooltipData.value
  if (data.length === 0) return null
  if (data.length === 1) return 0
  
  let left = 0
  let right = data.length - 1
  let closest = 0
  let minDistance = Math.abs(data[0].x - mouseX)
  
  while (left <= right) {
    const mid = Math.floor((left + right) / 2)
    const distance = Math.abs(data[mid].x - mouseX)
    
    if (distance < minDistance) {
      minDistance = distance
      closest = mid
    }
    
    if (data[mid].x < mouseX) {
      left = mid + 1
    } else {
      right = mid - 1
    }
  }

  return closest
}

const handleMouseMove = (event: MouseEvent) => {
  if (!overlayRef.value) return
  
  const rect = overlayRef.value.getBoundingClientRect()
  const mouseX = event.clientX - rect.left
  
  const nearestIndex = findNearestDataPoint(mouseX)
  
  if (nearestIndex !== null) {
    hoveredIndex.value = nearestIndex
  } else {
    hoveredIndex.value = null
  }
}

const handleMouseEnter = () => {
  if (!tooltipRef.value?.isOpen) hoveredIndex.value = null
}

const closeTooltip = () => {
  if (tooltipRef.value) tooltipRef.value?.close() 
  else hoveredIndex.value = null
}

const linePath = computed(() => {
  if (preparedData.value.length === 0) return ''
  
  const commands = preparedData.value.map((d, i) => {
    const command = i === 0 ? 'M' : 'L'
    return `${ command } ${ d.x } ${ d.y }`
  })
  
  return commands.join(' ')
})

const areaPath = computed(() => {
  if (!props.hasArea || preparedData.value.length === 0) return ''
  
  const y0 = props.svgHeight - props.bottom
  
  // Start at first point at bottom
  let path = `M ${ preparedData.value[0].x } ${ y0 }`
  
  // Draw line to first point
  path += ` L ${ preparedData.value[0].x } ${ preparedData.value[0].y }`
  
  // Draw line through all points
  for (let i = 1; i < preparedData.value.length; i++) {
    path += ` L ${ preparedData.value[i].x } ${ preparedData.value[i].y }`
  }
  
  // Draw line to last point at bottom
  path += ` L ${ preparedData.value[preparedData.value.length - 1].x } ${ y0 }`
  
  // Close path
  path += ' Z'
  
  return path
})

const minMaxAreaPath = computed(() => {
  if (!props.yKeyMin || !props.yKeyMax || preparedData.value.length === 0) return ''
  
  const data = preparedData.value
  
  // Start from left side, draw top line (yMax values)
  let path = `M ${ data[0].x } ${ data[0].yMax }`
  
  // Draw through all yMax points
  for (let i = 1; i < data.length; i++) {
    path += ` L ${ data[i].x } ${ data[i].yMax }`
  }
  
  // Now draw bottom line (yMin values) in reverse order
  for (let i = data.length - 1; i >= 0; i--) {
    path += ` L ${ data[i].x } ${ data[i].yMin }`
  }
  
  // Close the polygon
  path += ' Z'
  
  return path
})

const yExtent = computed<[number, number]>(() => {
  if (props.data.length === 0) return [0, 100]

  let maxValue = 0

  dataFiltered.value.forEach(item => {
    if (typeof item[props.yKey] === 'number' && item[props.yKey] > maxValue) maxValue = item[props.yKey]
    if (props.yKeyMin && typeof item[props.yKeyMin] === 'number' && item[props.yKeyMin] > maxValue) maxValue = item[props.yKeyMin]
    if (props.yKeyMax && typeof item[props.yKeyMax] === 'number' && item[props.yKeyMax] > maxValue) maxValue = item[props.yKeyMax]
  })

  return [0, maxValue || 100]
})

const emitDomainUpdate = () => {
  props.onUpdateDomain?.(lineId, yExtent.value)
}

const scaleYPercent = (value: number): number => props.scaleY(value) / props.svgHeight

watch(() => yExtent.value[0], emitDomainUpdate, {immediate: true})
watch(() => yExtent.value[1], emitDomainUpdate, {immediate: true})

watch(hoveredIndex, value => {
  if (value !== null) nextTick(() => tooltipRef.value?.open())
})

watch(() => tooltipRef.value?.isOpen ?? false, value => {
  if (value) return

  hoveredIndex.value = null
})

onUnmounted(() => {
  props.onUpdateDomain?.(lineId, [0, 0]) // Sigmal removal
})
</script>