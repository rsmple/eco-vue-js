<template>
  <div ref="container">
    <slot />
  </div>
</template>

<script lang="ts" setup>
import {computed, inject, onMounted, onUnmounted, useTemplateRef, watch} from 'vue'

import {wScrollingElement} from '../models/injection'
import {getIsScrollDown, getIsScrollUp} from '../models/utils'

const emit = defineEmits<{
  (e: 'scroll:up'): void
  (e: 'scroll:down'): void
}>()

const containerRef = useTemplateRef('container')

const scrollingElement = inject(wScrollingElement, null)
const element = computed(() => scrollingElement?.value ?? document)

const checkIsScrollUp = () => {
  if (!containerRef.value) return

  if (getIsScrollUp(scrollingElement?.value ?? document.scrollingElement, containerRef.value.offsetTop)) {
    emit('scroll:up')
  }
}

const checkIsScrollDown = () => {
  if (!containerRef.value) return

  if (getIsScrollDown(scrollingElement?.value ?? document.scrollingElement)) {
    emit('scroll:down')
  }
}

const listener = (event: Event): void => {
  if (event.target !== element.value || !containerRef.value) return

  checkIsScrollUp()
  checkIsScrollDown()
}

watch(element, (newValue, oldValue) => {
  oldValue?.removeEventListener('scroll', listener)
  newValue?.addEventListener('scroll', listener)
}, {immediate: true})

onMounted(() => {
  emit('scroll:up')
})

onUnmounted(() => {
  element.value.removeEventListener('scroll', listener)
})

defineExpose({
  checkIsScrollUp,
  checkIsScrollDown,
})
</script>
