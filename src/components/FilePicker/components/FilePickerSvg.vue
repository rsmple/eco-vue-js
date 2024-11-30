<template>
  <svg
    :class="{
      'opacity-50': !isActive,
      'opacity-100': isActive,
      'text-negative dark:text-negative-dark': hasError,
      'text-primary-default dark:text-primary-dark': !hasError,
    }"
    :width="svgWidth"
    :height="svgHeight"
  >
    <rect
      ref="svgRect"
      :x="strokeWidth / 2"
      :y="strokeWidth / 2"
      :width="rectWidth"
      :height="rectHeight"
      :rx="borderRaduis"
      :ry="borderRaduis"
      :stroke-width="strokeWidth"
      :stroke-dasharray="segmentLength + ' ' + segmentLength"
      :stroke-dashoffset="dashoffset"
      stroke-linecap="round"
      stroke="currentColor"
      fill="none"
      :class="{
        'animate-border-rotate': isActive,
      }"
      :style="{
        '--border-rotate-offset-from': dashoffset,
        '--border-rotate-offset-to': dashoffset - pathLength,
      }"
    />
  </svg>
</template>

<script lang="ts" setup>
import {computed, onBeforeMount, ref, toRef, watch} from 'vue'

const props = defineProps<{
  svgWidth: number
  svgHeight: number
  isActive?: boolean
  hasError?: boolean
}>()

const lengthList = Array(8).fill(undefined).map((_, index) => (7 + index * 2) * 4)

const borderRaduis = ref(12)
const strokeWidth = ref(4)
const svgRect = ref<SVGRectElement | undefined>()
const fraction = ref(48)
const fractionShift = ref(0)

const rectWidth = computed(() => props.svgWidth - strokeWidth.value)
const rectHeight = computed(() => props.svgHeight - strokeWidth.value)
const roundedHalf = computed(() => 12 * Math.PI / 2)
const pathLength = computed(() => svgRect.value?.getTotalLength() ?? 480)
const segmentLength = computed(() => pathLength.value / fraction.value)
const dashoffset = computed(() => (segmentLength.value + roundedHalf.value) / 2)

const calcFaction = () => {
  const factor = rectWidth.value / rectHeight.value
  let result = 2
  let index = 0

  for (let i = 0; i < lengthList.length; i++) {
    const value = (lengthList[i] * factor) % 1

    if (result > value) {
      result = value
      index = i
    }
  }

  fraction.value = lengthList[index] ?? 48
  fractionShift.value = result
}

watch(toRef(props, 'svgWidth'), calcFaction)

onBeforeMount(() => {
  calcFaction()
})
</script>