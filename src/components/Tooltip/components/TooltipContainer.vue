<template>
  <div
    class="pointer-events-none flex items-center drop-shadow-md dark:drop-shadow-none"
    :class="{
      'flex-col': !isLeft && !isRight,
      'justify-end': isLeft,
    }"
  >
    <svg
      :viewBox="isLeft || isRight ? '0 0 8 16' : '0 0 16 8'"
      class="pointer-events-auto z-10"
      :class="{
        'text-black-default dark:text-gray-800': !tooltipMeta.light,
        'text-default dark:text-gray-800': tooltipMeta.light,
        'width-4 order-2': isTop,
        'width-2 order-2': isLeft,
        'width-2': isRight,
        'width-4': !isTop && !isLeft && !isRight,
      }"
      @mouseover="$emit('over')"
      @mouseleave="$emit('leave')"
    >
      <g :transform="`rotate(${ isTop ? 180 : isLeft ? 90 : isRight ? -90 : 0 } ${isLeft || isRight ? '4 4' : '8 4'})`">
        <rect
          height="8"
          width="16"
          fill="none"
        />
        <path
          d="M7.16933 1.81927C5.84985 4.8991 5.05085 7.15819 0 8H16.0042C10.9498 7.15819 10.1503 4.8991 8.83068 1.81926C8.50615 1.06181 7.49384 1.06181 7.16933 1.81927Z"
          fill="currentColor"
        />
      </g>
    </svg>

    <div
      ref="container"
      class="pointer-events-auto max-w-[calc(100vw-1.5rem)] translate-x-[var(--t-translate-x)] translate-y-[var(--t-translate-y)] rounded-lg px-3 py-2 text-center text-xs font-medium"
      :class="{
        'bg-black-default text-default dark:bg-gray-800': !tooltipMeta.light,
        'bg-default text-accent dark:bg-gray-800': tooltipMeta.light,
      }"
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