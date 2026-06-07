<template>
  <div
    ref="element"
    class="rounded-inherit sm-not:hidden w-shine pointer-events-none absolute inset-0 overflow-hidden print:hidden"
  >
    <div
      class="bg-primary-light/70 dark:bg-primary-light/50 pointer-events-none absolute h-full w-screen bg-clip-border"
      :style="{
        'mask': `url(#${id})`,
        '-webkit-mask': `url(#${id})`,
        'left': `-${left}px`
      }"
    />
  </div>
</template>

<script setup lang="ts">
import {onBeforeUnmount, onMounted, ref, useTemplateRef} from 'vue'

import {useShine} from './use/useShine'

const {id} = useShine()

const elementRef = useTemplateRef('element')
const left = ref(0)

let observer: ResizeObserver | null = null

onMounted(() => {
  if (!elementRef.value) return

  observer = new ResizeObserver(() => {
    if (!elementRef.value) return
    left.value = elementRef.value.getBoundingClientRect().left
    observer?.disconnect()
    observer = null
  })

  observer.observe(elementRef.value)
})

onBeforeUnmount(() => {
  observer?.disconnect()
  observer = null
})
</script>