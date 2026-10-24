<template>
  <div
    ref="element"
    class="relative"
  >
    <slot />

    <button
      class="absolute -right-2 top-0 flex h-full w-6 cursor-col-resize items-center opacity-50 hover:opacity-100"
      aria-label="Resize column"
      @mousedown.stop.prevent="startDrag"
      @click.stop.prevent
    >
      <IconDrag />
    </button>
  </div>
</template>

<script lang="ts" setup generic="Field">
import {nextTick, onBeforeUnmount, useTemplateRef, watch} from 'vue'

import IconDrag from '@/assets/icons/IconDrag.svg?component'

import {DOMListenerContainer} from '@/utils/DOMListenerContainer'

import {measureWidthOnce} from '../models/measureWidth'

const MIN_WIDTH = 64
const MAX_WIDTH = 2000

const props = defineProps<{
  hasWidth: boolean
}>()

const emit = defineEmits<{
  (e: 'update:width', value: number): void
  (e: 'save:width'): void
}>()

const listenerContainer = new DOMListenerContainer()

const elementRef = useTemplateRef('element')

let started: number | null = null
let widthSaved: number | null = null

const startDrag = (clickEvent: MouseEvent) => {
  if (!elementRef.value) return

  started = clickEvent.clientX
  widthSaved = elementRef.value.offsetWidth

  listenerContainer.addEventListener(document, 'mousemove', event => {
    if (started === null || widthSaved === null || !(event instanceof MouseEvent)) {
      endDrag()
      return
    }

    emit('update:width', Math.min(Math.max(widthSaved + event.clientX - started, MIN_WIDTH), MAX_WIDTH))
  })

  listenerContainer.addEventListener(document, 'mouseup', event => {
    event.stopPropagation()
    event.preventDefault()
    endDrag()
  })
}

const endDrag = () => {
  listenerContainer.destroy()

  started = null
  widthSaved = null

  emit('save:width')
}

let stopMeasuring: (() => void) | null = null

watch(() => props.hasWidth, async value => {
  await nextTick()

  if (value) {
    stopMeasuring?.()
    stopMeasuring = null
    return
  }
  if (!elementRef.value || stopMeasuring) return

  stopMeasuring = measureWidthOnce(elementRef.value, width => {
    stopMeasuring = null
    emit('update:width', width)
  })
}, {immediate: true, flush: 'post'})

onBeforeUnmount(() => {
  listenerContainer.destroy()
  stopMeasuring?.()
  stopMeasuring = null
})
</script>
