<template>
  <div ref="element">
    <slot />
  </div>
</template>

<script lang="ts" setup>
import {onBeforeUnmount, onMounted, useTemplateRef} from 'vue'

import {hasParent, isClientSide} from '@/utils/utils'

const props = defineProps<{
  noFilter?: boolean
}>()

const emit = defineEmits<{
  (e: 'click'): void
}>()

const elementRef = useTemplateRef('element')

const clickListener = (event: MouseEvent) => {
  if (!props.noFilter) {
    if (!elementRef.value || !(event.target instanceof Element) || hasParent(elementRef.value, event.target)) return
  }

  emit('click')
}

onMounted(() => {
  if (!isClientSide) return

  setTimeout(() => {
    document.addEventListener('click', clickListener)
    document.addEventListener('contextmenu', clickListener)
  })
})

onBeforeUnmount(() => {
  if (!isClientSide) return

  document.removeEventListener('click', clickListener)
  document.removeEventListener('contextmenu', clickListener)
})
</script>