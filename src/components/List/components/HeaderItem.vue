<template>
  <div
    ref="element"
  >
    <slot />
  </div>
</template>

<script lang="ts" setup generic="Field">
import {onBeforeUnmount, onMounted, useTemplateRef} from 'vue'

import {measureWidthOnce} from '../models/measureWidth'

const emit = defineEmits<{
  (e: 'update:width', value: number): void
}>()

const elementRef = useTemplateRef('element')

let stopMeasuring: (() => void) | null = null

onMounted(() => {
  if (!elementRef.value) return

  stopMeasuring = measureWidthOnce(elementRef.value, width => emit('update:width', width))
})

onBeforeUnmount(() => {
  stopMeasuring?.()
  stopMeasuring = null
})
</script>
