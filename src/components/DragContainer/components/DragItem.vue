<template>
  <slot
    v-bind="{initDrag}"
    :container="{
      draggable,
      style: {order: order + 1},
      class: isDragging ? 'opacity-[0.001]' : disabled ? 'opacity-50' : undefined,
      onDragend: !disabled ? endDrag : undefined,
      onDragenter: !draggable ? () => $emit('drag:enter', order) : undefined,
      onDragstart: !disabled ? startDrag : undefined,
      onDragover,
    }"
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