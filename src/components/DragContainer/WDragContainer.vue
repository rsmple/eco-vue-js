<template>
  <div>
    <DragItem
      v-for="(item, index) in list"
      :key="index"

      :disabled="disabled || !draggable"
      :order="value.indexOf(item as typeof value[number])"
      @drag:start="dragStart(item as Data)"
      @drag:enter="dragEnter"
      @drag:end="drop"
    >
      <template #default="defaultScope">
        <slot
          v-bind="defaultScope"
          :item="item"
          :dragging="dragging"
        />
      </template>
    </DragItem>
  </div>
</template>

<script lang="ts" setup generic="Data">
import {ref, watch} from 'vue'

import DragItem from './components/DragItem.vue'
import {useDragContainer} from './use/useDragContainer'

const props = defineProps<{
  list: Data[]
  disabled?: boolean
}>()

const emit = defineEmits<{
  (e: 'update:list', value: Data[]): void
}>()

const {draggable, dragging, startDrag, stopDrag} = useDragContainer()

const value = ref(props.list.slice())

let dragItem: Data | null = null

const dragStart = (item: Data): void => {
  startDrag()

  dragItem = item
}

const dragEnter = (order: number): void => {
  if (dragItem === null) return

  const index = value.value.indexOf(dragItem as typeof value.value[number])

  if (index === -1) return

  value.value.splice(index, 1)
  value.value.splice(order, 0, dragItem as typeof value.value[number])
}

const dragEnd = () => {
  stopDrag()

  dragItem = null
}

const drop = () => {
  emit('update:list', value.value as Data[])

  dragEnd()
}

watch(() => props.list, newList => {
  value.value = newList.slice()
})
</script>