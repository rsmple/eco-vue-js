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
  /** Emits `click` on clicks inside the element too. */
  noFilter?: boolean
}>()

const emit = defineEmits<{
  /** A click or right-click outside the element. Clicks in the same tick as mounting, such as the one that opened it, are ignored. */
  (e: 'click'): void
  /** The pointer entered the element. */
  (e: 'mouseenter', value: MouseEvent): void
  /** The pointer left the element. */
  (e: 'mouseleave', value: MouseEvent): void
  /** A mouse button was pressed on the element. */
  (e: 'mousedown', value: MouseEvent): void
}>()

defineSlots<{
  /** Content that clicks count as inside of, such as a dropdown's content. */
  default?: () => void
}>()

const elementRef = useTemplateRef('element')

const isOnDisabled = (event: Event): boolean => event.target instanceof Element && event.target.closest(':disabled') !== null

const emitOutside = (event: Event) => {
  if (!props.noFilter) {
    if (!elementRef.value || !(event.target instanceof Element) || hasParent(elementRef.value, event.target)) return
  }

  emit('click')
}

const clickListener = (event: MouseEvent) => {
  if (!isOnDisabled(event)) emitOutside(event)
}

// A disabled control, such as a disabled button, gets no click at all — only pointer events — though it may lie outside.
const pointerListener = (event: PointerEvent) => {
  if (isOnDisabled(event)) emitOutside(event)
}

onMounted(() => {
  if (!getIsClientSide()) return

  setTimeout(() => {
    document.addEventListener('click', clickListener)
    document.addEventListener('contextmenu', clickListener)
    document.addEventListener('pointerup', pointerListener)
  })
})

onBeforeUnmount(() => {
  if (!getIsClientSide()) return

  document.removeEventListener('click', clickListener)
  document.removeEventListener('contextmenu', clickListener)
  document.removeEventListener('pointerup', pointerListener)
})
</script>