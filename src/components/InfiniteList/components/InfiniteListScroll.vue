<template>
  <slot />
</template>

<script lang="ts" setup>
import {onMounted, onUnmounted} from 'vue'
import {getIsScrollDown, getIsScrollUp} from '../models/utils'

const emit = defineEmits<{
  (e: 'scroll:up'): void
  (e: 'scroll:down'): void
}>()

const listener = (event: Event): void => {
  if (event.target !== document) return

  if (!document.scrollingElement) return

  if (getIsScrollUp()) {
    emit('scroll:up')
    return
  }

  if (getIsScrollDown()) {
    emit('scroll:down')
  }
}

onMounted(() => {
  document.addEventListener('scroll', listener)

  emit('scroll:up')
})

onUnmounted(() => {
  document.removeEventListener('scroll', listener)
})

</script>
