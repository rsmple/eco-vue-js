<template>
  <div class="flex justify-center items-center flex-col drop-shadow-md dark:drop-shadow-none pointer-events-none">
    <div
      class="w-1 z-10 pointer-events-auto border-[transparent] border-solid border-[0.5rem]"
      :class="{
        'text-black-default dark:text-gray-800': !tooltipMeta.light,
        'text-default dark:text-gray-800': tooltipMeta.light,
        'border-t-current order-2': isTop,
        'border-b-current': !isTop,
      }"
      @mouseover="$emit('over')"
      @mouseleave="$emit('leave')"
    />

    <div
      ref="container"
      class="py-3 px-4 rounded-xl text-xs font-medium text-center pointer-events-auto translate-x-[var(--t-translate-x)] max-w-[calc(100vw-1.5rem)]"
      :class="{
        'bg-black-default dark:bg-gray-800 text-default': !tooltipMeta.light,
        'bg-default dark:bg-gray-800 text-accent': tooltipMeta.light,
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
import {nextTick, onMounted, ref, toRef, watch} from 'vue'
import type {TooltipMeta} from '@/utils/Tooltip'
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

const container = ref<HTMLDivElement | undefined>()
const transformX = ref<number>(0)

const getTransformX = () => {
  if (!isClientSide || !container.value) return 0

  const l = props.left ? Number.parseFloat(props.left.slice(0, -2)) : null

  if (typeof l === 'number') {
    const containerLeft = l - (container.value.offsetWidth / 2) - MARGIN

    if (containerLeft < 0) return containerLeft * -1

    const containerRight = window.innerWidth - l - (container.value.offsetWidth / 2) - MARGIN

    if (containerRight < 0) return containerRight

    return 0
  }

  const r = props.right ? Number.parseFloat(props.right.slice(0, -2)) : null
  
  if (typeof r === 'number') {
    const containerLeft = window.innerWidth - r - (container.value.offsetWidth / 2) - MARGIN

    if (containerLeft < 0) return containerLeft * -1

    const containerRight = r - (container.value.offsetWidth / 2) - MARGIN

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