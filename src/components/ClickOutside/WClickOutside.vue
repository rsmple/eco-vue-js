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

import {getIsClientSide} from '@/utils/utils'

const props = defineProps<{
  /** Emits `click` on clicks inside the element too. */
  noFilter?: boolean
}>()

const emit = defineEmits<{
  /** A click or right-click outside the element. Clicks in the same tick as mounting, such as the one that opened it, and presses that start inside, such as a drag let go outside, are ignored. */
  (e: 'click', event: Event): void
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

const isInside = (event: Event): boolean => !!elementRef.value && event.composedPath().includes(elementRef.value)

// A press inside that is let go outside, such as dragging a slider or selecting text, ends in a click on what holds both, which lies outside.
let isPressedInside = false

const pointerdownListener = (event: PointerEvent) => {
  isPressedInside = isInside(event)
}

const emitOutside = (event: Event) => {
  const wasPressedInside = isPressedInside

  if (event.type !== 'pointerup') isPressedInside = false

  if (!props.noFilter) {
    // The path is taken as the click starts, so it still holds an element that the click took off the page.
    if (!elementRef.value || wasPressedInside || isInside(event)) return
  }

  emit('click', event)
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
    document.addEventListener('pointerdown', pointerdownListener, true)
    document.addEventListener('click', clickListener)
    document.addEventListener('contextmenu', clickListener)
    document.addEventListener('pointerup', pointerListener)
  })
})

onBeforeUnmount(() => {
  if (!getIsClientSide()) return

  document.removeEventListener('pointerdown', pointerdownListener, true)
  document.removeEventListener('click', clickListener)
  document.removeEventListener('contextmenu', clickListener)
  document.removeEventListener('pointerup', pointerListener)
})
</script>