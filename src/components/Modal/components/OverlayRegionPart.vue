<template>
  <slot v-if="!isHanded" />
</template>

<script lang="ts" setup>
import {type VNode, getCurrentInstance, inject, markRaw, onBeforeUnmount, useSlots} from 'vue'

import {type OverlayPart, type OverlayRegion, getInstanceProvides, wOverlayRegions} from '../models/overlayRegistry'

// Renders the slot in an area of the frame it is in, such as the pinned header of a dropdown layer or the footer of a modal.
// Without a frame that has the area, the slot renders in place.
const props = defineProps<{
  region: OverlayRegion
}>()

defineSlots<{
  default?: () => VNode[]
}>()

const slots = useSlots()

const regions = inject(wOverlayRegions, null)

// The frame renders the slot with this component's injections, as if it rendered in place.
const part: OverlayPart = markRaw({
  render: markRaw(() => slots.default?.()),
  provides: getInstanceProvides(getCurrentInstance()),
})

const isHanded = regions?.add(props.region, part) ?? false

if (isHanded) onBeforeUnmount(() => regions?.remove(props.region, part))
</script>
