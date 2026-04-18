<template>
  <div
    ref="element"
  >
    <slot />
  </div>
</template>

<script lang="ts" setup generic="Field">
import {onBeforeUnmount, onMounted, useTemplateRef} from 'vue'

const emit = defineEmits<{
  (e: 'update:width', value: number): void
}>()

const elementRef = useTemplateRef('element')

let observer: ResizeObserver | null = null

onMounted(() => {
  if (!elementRef.value) return

  observer = new ResizeObserver(entries => {
    const entry = entries[0]
    if (!entry) return

    const width = entry.borderBoxSize?.[0]?.inlineSize ?? entry.contentRect.width
    emit('update:width', width)
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
