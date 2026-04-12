<template>
  <slot
    v-bind="{initDrag}"
    :container="{
      draggable,
      style: {order: order + 1},
      class: disabled ? 'opacity-50' : undefined,
      onDragend: !disabled ? endDrag : undefined,
      onDragenter: !draggable ? () => $emit('drag:enter', order) : undefined,
      onDragstart: !disabled ? startDrag : undefined,
      onDragover,
    }"
  />

  <div
    v-if="isDragging"
    class="bg-default dark:bg-default-dark pointer-events-none absolute z-[1] size-full [grid-column:1/2]"
    :style="{gridRow: `${order + 1}/${order + 2}`}"
  />
</template>

<script lang="ts" setup>
import {ref} from 'vue'

defineProps<{
  disabled?: boolean
  order: number
}>()

const emit = defineEmits<{
  (e: 'drag:start'): void
  (e: 'drag:enter', order: number): void
  (e: 'drag:end'): void
}>()

const draggable = ref(false)
const isDragging = ref(false)

const initDrag = () => {
  draggable.value = true
}

const startDrag = () => {
  isDragging.value = true

  emit('drag:start')
}

const endDrag = () => {
  draggable.value = false
  isDragging.value = false

  emit('drag:end')
}

const onDragover = (event: DragEvent) => {
  event.stopPropagation()
  event.preventDefault()
}
</script>