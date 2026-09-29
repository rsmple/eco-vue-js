<template>
  <div class="relative grid grid-cols-1">
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
          :index="value.indexOf(item as typeof value[number])"
          :last="value.indexOf(item as typeof value[number]) === value.length - 1"
          :ordered-list="(value as Data[])"
          :dragging="dragging"
        />
      </template>
    </DragItem>
  </div>
</template>

<script lang="ts" setup generic="Data">
import {type HTMLAttributes, ref, watch} from 'vue'

import DragItem from './components/DragItem.vue'
import {useDragContainer} from './use/useDragContainer'

const props = defineProps<{
  /** Items in their saved order. */
  list: Data[]
  /** Stops dragging and dims the items. */
  disabled?: boolean
}>()

const emit = defineEmits<{
  /** The items in their new order, once an item is dropped. */
  (e: 'update:list', value: Data[]): void
}>()

defineSlots<{
  /** An item. Bind `container` to its root element, and call `initDrag` on mousedown of its drag handle — or of the whole item — to make it draggable. `index` and `last` follow the order while dragging, and `dragging` is true while an item of this list is dragged. */
  default?: (props: {
    item: Data
    index: number
    last: boolean
    orderedList: Data[]
    dragging: boolean
    initDrag: () => void
    container: HTMLAttributes
  }) => void
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