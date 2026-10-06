<template>
  <OverlayPartRender
    v-for="part in shown"
    :key="getKey(part)"
    :part="part"
  />
</template>

<script lang="ts" setup>
import type {OverlayPart} from '../models/overlayRegistry'

import {computed} from 'vue'

import OverlayPartRender from './OverlayPartRender.vue'

// Renders the parts handed to one area of a frame, in the order they came. A fallback part shows only while there is no other.
const props = defineProps<{
  parts: readonly OverlayPart[]
}>()

const shown = computed(() => props.parts.some(part => !part.fallback) ? props.parts.filter(part => !part.fallback) : props.parts)

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
