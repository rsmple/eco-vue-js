<template>
  <div
    ref="element"
    @mouseenter="$emit('mouseenter', $event)"
    @mouseleave="$emit('mouseleave', $event)"
    @mousedown="$emit('mousedown', $event)"
  >
    <slot />
  </div>
</template>

<script lang="ts" setup>
import {onBeforeUnmount, onMounted, useTemplateRef} from 'vue'

import {getIsClientSide, hasParent} from '@/utils/utils'

const props = defineProps<{
  noFilter?: boolean
}>()

const emit = defineEmits<{
  (e: 'click'): void
  (e: 'mouseenter', value: MouseEvent): void
  (e: 'mouseleave', value: MouseEvent): void
  (e: 'mousedown', value: MouseEvent): void
}>()

const elementRef = useTemplateRef('element')

const clickListener = (event: MouseEvent) => {
  if (!props.noFilter) {
    if (!elementRef.value || !(event.target instanceof Element) || hasParent(elementRef.value, event.target)) return
  }

  emit('click')
}

onMounted(() => {
  if (!getIsClientSide()) return

  setTimeout(() => {
    document.addEventListener('click', clickListener)
    document.addEventListener('contextmenu', clickListener)
  })
})

onBeforeUnmount(() => {
  if (!getIsClientSide()) return

  document.removeEventListener('click', clickListener)
  document.removeEventListener('contextmenu', clickListener)
})
</script>