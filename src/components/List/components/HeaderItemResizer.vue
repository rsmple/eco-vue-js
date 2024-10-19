<template>
  <div
    ref="element"
    class="relative"
  >
    <slot />

    <button
      class="absolute top-0 right-1 h-full w-6 flex items-center opacity-50 hover:opacity-100 cursor-col-resize"
      @mousedown.stop.prevent="startDrag"
      @mouseup.stop.prevent="endDrag"
      @click.stop.prevent
    >
      <IconDrag />
    </button>
  </div>
</template>

<script lang="ts" setup generic="Field">
import {onBeforeUnmount, onMounted, useTemplateRef} from 'vue'
import IconDrag from '@/assets/icons/sax/IconDrag.svg?component'
import DOMListenerContainer from '@/utils/DOMListenerContainer'

const emit = defineEmits<{
  (e: 'update:width', value: number): void
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

    emit('update:width', widthSaved + event.clientX - started)
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
}

onMounted(() => {
  setTimeout(() => {
    if (!elementRef.value) return

    emit('update:width', elementRef.value.offsetWidth)
  }, 1000)
})

onBeforeUnmount(() => {
  listenerContainer.destroy()
})

</script>
