<template>
  <OverlayPartRender
    v-for="part in parts"
    :key="getKey(part)"
    :part="part"
  />
</template>

<script lang="ts" setup>
import type {OverlayPart} from '../models/overlayRegistry'

import OverlayPartRender from './OverlayPartRender.vue'

// Renders the parts handed to one area of a frame, in the order they came.
defineProps<{
  parts: readonly OverlayPart[]
}>()

const keys = new WeakMap<OverlayPart, number>()
let nextKey = 0

const getKey = (part: OverlayPart): number => {
  let key = keys.get(part)

  if (key === undefined) {
    key = nextKey++
    keys.set(part, key)
  }

  return key
}
</script>
