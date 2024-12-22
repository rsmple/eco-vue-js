<template>
  <div ref="container">
    <slot />
  </div>
</template>

<script lang="ts" setup>
import {computed, onMounted, onUnmounted, useTemplateRef, watch} from 'vue'

import {getIsScrollDown, getIsScrollUp} from '../models/utils'

const props = defineProps<{
  scrollingElement: Element | null
}>()

const emit = defineEmits<{
  (e: 'scroll:up'): void
  (e: 'scroll:down'): void
}>()

const containerRef = useTemplateRef('container')

const element = computed(() => props.scrollingElement ?? document) 

const listener = (event: Event): void => {
  if (event.target !== element.value || !containerRef.value) return

  if (getIsScrollUp(props.scrollingElement ?? document.scrollingElement, containerRef.value.offsetTop)) {
    emit('scroll:up')
    return
  }

  if (getIsScrollDown(props.scrollingElement ?? document.scrollingElement)) {
    emit('scroll:down')
  }
}

const checkIsScrollUp = () => {
  if (getIsScrollDown(props.scrollingElement ?? document.scrollingElement)) {
    emit('scroll:down')
  }
}

const checkIsScrollDown = () => {
  if (getIsScrollDown(props.scrollingElement ?? document.scrollingElement)) {
    emit('scroll:down')
  }
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
