<template>
  <div class="relative grid grid-cols-1">
    <DragItem
      v-for="(item, index) in list"
      :key="index"

      :disabled="disabled || !draggable"
      :order="order.indexOf(index)"
      @drag:start="dragStart(index)"
      @drag:enter="dragEnter"
      @drag:end="drop"
    >
      <template #default="defaultScope">
        <slot
          v-bind="defaultScope"
          :item="item"
          :index="order.indexOf(index)"
          :last="order.indexOf(index) === order.length - 1"
          :ordered-list="orderedList"
          :dragging="dragging"
        />
      </template>
    </DragItem>
  </div>
</template>

<script lang="ts" setup generic="Data">
import {type HTMLAttributes, computed, ref, watch} from 'vue'

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

const getInitialOrder = (list: Data[]): number[] => list.map((_, index) => index)

const order = ref<number[]>(getInitialOrder(props.list))

const orderedList = computed<Data[]>(() => order.value.map(index => props.list[index]))

let dragIndex: number | null = null

const dragStart = (index: number): void => {
  startDrag()

  dragIndex = index
}

const dragEnter = (position: number): void => {
  if (dragIndex === null) return

  const from = order.value.indexOf(dragIndex)

  if (from === -1) return

  order.value.splice(from, 1)
  order.value.splice(position, 0, dragIndex)
}

const dragEnd = () => {
  stopDrag()

  dragIndex = null
}

const drop = () => {
  emit('update:list', orderedList.value)

  dragEnd()
}

watch([() => props.list, () => props.list.length], ([newList]) => {
  order.value = getInitialOrder(newList)
})
</script>