<template>
  <div class="pointer-events-none flex flex-col items-center justify-center drop-shadow-md dark:drop-shadow-none">
    <div
      class="pointer-events-auto z-10 w-1 border-[0.5rem] border-solid border-transparent"
      :class="{
        'text-black-default dark:text-gray-800': !tooltipMeta.light,
        'text-default dark:text-gray-800': tooltipMeta.light,
        'order-2 border-t-current': isTop,
        'border-b-current': !isTop,
      }"
      @mouseover="$emit('over')"
      @mouseleave="$emit('leave')"
    />

    <div
      ref="container"
      class="pointer-events-auto max-w-[calc(100vw-1.5rem)] translate-x-[var(--t-translate-x)] rounded-xl px-4 py-3 text-center text-xs font-medium"
      :class="{
        'bg-black-default text-default dark:bg-gray-800': !tooltipMeta.light,
        'bg-default text-accent dark:bg-gray-800': tooltipMeta.light,
      }"
      :style="{
        '--t-translate-x': transformX + 'px',
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
}>()

defineEmits<{
  (e: 'over'): void
  (e: 'leave'): void
}>()

const containerRef = useTemplateRef('container')
const transformX = ref<number>(0)

const getTransformX = () => {
  if (!isClientSide || !containerRef.value) return 0

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

const setTransformX = async () => {
  await nextTick()

  transformX.value = getTransformX()
}

watch(toRef(props, 'tooltipMeta'), () => {
  setTransformX()
})

onMounted(() => {
  setTransformX()
})
</script>