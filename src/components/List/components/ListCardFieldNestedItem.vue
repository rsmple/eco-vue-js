<template>
  <template
    v-for="(_item, slotIndex) in slotList"
    :key="_item.key"
  >
    <slot
      v-bind="{
        inner: items[slotIndex]!,
        index: slotIndex,
        last: slotIndex === items.length - 1,
        first: slotIndex === 0,
      }"
    />
  </template>
</template>

<script setup lang="ts" generic="Data extends {id: number | string}">
import {type Ref, ref, watch} from 'vue'

interface ItemSlot {
  key: number
  id: number | string | null
}

const props = defineProps<{
  items: Data[]
}>()

let slotKeyCounter = 0
const slotList = ref<ItemSlot[]>([]) as Ref<ItemSlot[]>

const reconcileSlots = () => {
  const items = props.items

  console.log('reconcileSlots')

  if (items.length === 0) {
    slotList.value = []
    return
  }

  const newIds = new Set<number | string>()
  for (const item of items) newIds.add(item.id)

  const keepById = new Map<number | string, ItemSlot>()
  const freed: ItemSlot[] = []

  for (const slot of slotList.value) {
    if (slot.id !== null && newIds.has(slot.id)) {
      keepById.set(slot.id, slot)
    } else {
      freed.push({key: slot.key, id: null})
    }
  }

  const newSlots: ItemSlot[] = []
  let freeIdx = 0
  for (const item of items) {
    const id = item.id
    const kept = keepById.get(id)
    if (kept) {
      newSlots.push({key: kept.key, id})
    } else if (freeIdx < freed.length) {
      newSlots.push({key: freed[freeIdx++]!.key, id})
    } else {
      newSlots.push({key: ++slotKeyCounter, id})
    }
  }

  slotList.value = newSlots
}

watch(() => props.items, reconcileSlots, {immediate: true})

defineSlots<{
  default: (props: {inner: Data, index: number, last: boolean, first: boolean}) => void
}>()
</script>
