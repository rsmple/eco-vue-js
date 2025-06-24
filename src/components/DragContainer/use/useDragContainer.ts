import {computed, ref} from 'vue'

import {genId} from '@/main'

const dragIdCurrent = ref<number | null>(null)

export const useDragContainer = () => {
  const dragId = genId()

  const dragging = computed(() => dragId === dragIdCurrent.value)

  const draggable = computed(() => dragIdCurrent.value === null || dragging.value)

  const startDrag = () => {
    dragIdCurrent.value = dragId
  }

  const stopDrag = () => {
    dragIdCurrent.value = null
  }

  return {
    dragging,
    draggable,
    startDrag,
    stopDrag,
  }
}
