<template>
  <slot v-if="!header" />
</template>

<script lang="ts" setup>
import {type VNode, inject, markRaw, onBeforeUnmount, useSlots} from 'vue'

import {wOverlayHeader} from '../models/overlayRegistry'

// Renders the slot in the pinned header of the dropdown layer it is in — above the content, which scrolls under it — such as the field of an embedded select.
// Outside a dropdown layer, the slot renders in place.
defineSlots<{
  default?: () => VNode[]
}>()

const slots = useSlots()

const header = inject(wOverlayHeader, null)

if (header) {
  // The frame renders the slot, which keeps this component's context.
  const render = markRaw(() => slots.default?.())

  header.add(render)

  onBeforeUnmount(() => header.remove(render))
}
</script>
