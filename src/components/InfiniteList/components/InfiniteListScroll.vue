<template>
  <slot />
</template>

<script lang="ts" setup>
import {onMounted, onUnmounted} from 'vue'

const emit = defineEmits<{
  (e: 'scroll:up'): void
  (e: 'scroll:down'): void
}>()

const TRIGGER_FACTOR = 200

const listener = (event: Event): void => {
  if (event.target !== document) return

  if (!document.scrollingElement) return

  if (document.scrollingElement.scrollTop < TRIGGER_FACTOR) {
    emit('scroll:up')
    return
  }

  if (document.scrollingElement.scrollTop > (document.scrollingElement.scrollHeight - document.scrollingElement.clientHeight) - TRIGGER_FACTOR) {
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
