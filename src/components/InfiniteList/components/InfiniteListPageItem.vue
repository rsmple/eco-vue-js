<template>
  <slot />
</template>

<script lang="ts" setup>
import {Fragment, getCurrentInstance} from 'vue'

const instance = getCurrentInstance()

/** The elements the slot rendered, in order: the item and whatever is rendered with it, such as a group heading. */
const getElements = (): Element[] => {
  const tree = instance?.subTree

  if (!tree) return []
  if (tree.type !== Fragment) return tree.el instanceof Element ? [tree.el] : []

  const elements: Element[] = []
  const end = tree.anchor as Node | null
  let node = tree.el as Node | null

  while (node) {
    if (node instanceof Element) elements.push(node)
    if (node === end) break
    node = node.nextSibling
  }

  return elements
}

defineExpose({
  getElements,
})

defineSlots<{
  default?: () => void
}>()
</script>
