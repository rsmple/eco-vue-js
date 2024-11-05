<template>
  <div
    ref="element"
    class="relative"
  >
    <slot />

    <button
      class="absolute top-0 right-1 h-full w-6 flex items-center opacity-50 hover:opacity-100 cursor-col-resize"
      @mousedown.stop.prevent="startDrag"
      @click.stop.prevent
    >
      <IconDrag />
    </button>
  </div>
</template>

<script lang="ts" setup generic="Field">
import {onBeforeUnmount, useTemplateRef, watch} from 'vue'
import IconDrag from '@/assets/icons/sax/IconDrag.svg?component'
import DOMListenerContainer from '@/utils/DOMListenerContainer'

const MIN_WIDTH = 64
const MAX_WIDTH = 2000

const props = defineProps<{
  hasStyles: boolean
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

watch(() => props.hasStyles, value => {
  if (!value) setTimeout(() => {
    if (!elementRef.value) return

    emit('update:width', elementRef.value.offsetWidth)
  }, 0)
}, {immediate: true})

onBeforeUnmount(() => {
  listenerContainer.destroy()
})

</script>
