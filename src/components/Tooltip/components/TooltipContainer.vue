<template>
  <div
    class="pointer-events-none flex items-center"
    :class="{
      'flex-col': !isLeft && !isRight,
      'justify-end': isLeft,
    }"
  >
    <svg
      :viewBox="isLeft || isRight ? '0 0 8 16' : '0 0 16 8'"
      class="pointer-events-auto z-10"
      :class="{
        'width-4 order-2 -mt-px mb-1': isTop,
        'width-2 order-2 -ml-px mr-1': isLeft,
        'width-2 -mr-px ml-1': isRight,
        'width-4 -mb-px mt-1': !isTop && !isLeft && !isRight,
      }"
      @mouseover="$emit('over')"
      @mouseleave="$emit('leave')"
    >
      <g
        :transform="`rotate(${ isTop ? 0 : isLeft ? -90 : isRight ? 90 : 180 } ${isLeft || isRight ? '4 0' : '0 0'})`"
        transform-origin="center center"
      >
        <rect
          width="16"
          height="8"
          fill="none"
        />
        <path
          d="M7.03676 5.8704C5.7908 2.94938 4.87965 0.813274 0 0H16.0042C11.1205 0.813374 10.2091 2.9499 8.96281 5.87147C8.91924 5.97361 8.87526 6.07671 8.83068 6.18074C8.50615 6.93819 7.49384 6.93819 7.16933 6.18073C7.1246 6.07634 7.08048 5.97289 7.03676 5.8704Z"
          fill="currentColor"
          class="text-black-default dark:text-gray-800"
        />
        <path
          d="M0 0.5C5.05085 1.34181 5.84985 3.6009 7.16933 6.68073C7.49384 7.43819 8.50615 7.43819 8.83068 6.68074C10.1503 3.6009 10.9498 1.34181 16.0042 0.5"
          stroke="currentColor"
          stroke-width="1"
          fill="none"
          class="text-gray-400 dark:text-gray-600"
        />
      </g>
    </svg>

    <div
      ref="container"
      class="
        bg-black-default text-default pointer-events-auto
        max-w-[calc(100vw-1.5rem)] translate-x-[var(--t-translate-x)]
        translate-y-[var(--t-translate-y)] rounded-lg border
        border-solid border-gray-400 px-3 py-2 text-center
        text-xs font-medium shadow-md dark:border-gray-600 dark:bg-gray-800
      "
      :style="{
        '--t-translate-x': transformX + 'px',
        '--t-translate-y': transformY + 'px',
      }"
      @mouseover="$emit('over')"
      @mouseleave="$emit('leave')"
    >
      <slot />
    </div>
  </div>
</template>

<script lang="ts" setup>
import type {TooltipMeta} from '@/utils/Tooltip'

import {nextTick, onMounted, ref, toRef, useTemplateRef, watch} from 'vue'

import {isClientSide} from '@/utils/utils'

const MARGIN = 12

const props = defineProps<{
  tooltipMeta: TooltipMeta
  isTop?: boolean
  left?: string
  right?: string
  top?: string
  bottom?: string
  isLeft?: boolean
  isRight?: boolean
}>()

defineEmits<{
  (e: 'over'): void
  (e: 'leave'): void
}>()

const containerRef = useTemplateRef('container')
const transformX = ref<number>(0)
const transformY = ref<number>(0)

const getTransformX = () => {
  if (!isClientSide || !containerRef.value) return 0
  if (props.isLeft || props.isRight) return 0

  const l = props.left ? Number.parseFloat(props.left.slice(0, -2)) : null

  if (typeof l === 'number') {
    const containerLeft = l - (containerRef.value.offsetWidth / 2) - MARGIN

    if (containerLeft < 0) return containerLeft * -1

    const containerRight = window.innerWidth - l - (containerRef.value.offsetWidth / 2) - MARGIN

    if (containerRight < 0) return containerRight

    return 0
  }

  const r = props.right ? Number.parseFloat(props.right.slice(0, -2)) : null
  
  if (typeof r === 'number') {
    const containerLeft = window.innerWidth - r - (containerRef.value.offsetWidth / 2) - MARGIN

    if (containerLeft < 0) return containerLeft * -1

    const containerRight = r - (containerRef.value.offsetWidth / 2) - MARGIN

    if (containerRight < 0) return containerRight

    return 0
  }

  return 0
}

const getTransformY = () => {
  if (!isClientSide || !containerRef.value) return 0
  if (!props.isLeft && !props.isRight) return 0

  const t = props.top ? Number.parseFloat(props.top.slice(0, -2)) : null

  if (typeof t === 'number') {
    const containerTop = t - (containerRef.value.offsetHeight / 2) - MARGIN

    if (containerTop < 0) return containerTop * -1

    const containerBottom = window.innerHeight - t - (containerRef.value.offsetHeight / 2) - MARGIN

    if (containerBottom < 0) return containerBottom

    return 0
  }

  const b = props.bottom ? Number.parseFloat(props.bottom.slice(0, -2)) : null
  
  if (typeof b === 'number') {
    const containerTop = window.innerHeight - b - (containerRef.value.offsetHeight / 2) - MARGIN

    if (containerTop < 0) return containerTop * -1

    const containerBottom = b - (containerRef.value.offsetHeight / 2) - MARGIN

    if (containerBottom < 0) return containerBottom

    return 0
  }

  return 0
}

const setTransform = async () => {
  await nextTick()

  transformX.value = getTransformX()
  transformY.value = getTransformY()
}

watch(toRef(props, 'tooltipMeta'), setTransform)

onMounted(setTransform)
</script>