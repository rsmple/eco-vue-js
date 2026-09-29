<template>
  <svg
    fill="none"
    preserveAspectRatio="xMidYMid meet"
    class="pointer-events-none absolute inset-0 z-10 -m-(--w-border-svg-padding,0px) size-[calc(100%+var(--w-border-svg-padding,0px)*2)]"
    style="--border-svg-padding: calc(var(--w-border-svg-padding, 0px) + var(--w-border-svg-stroke-width, 2px) / 2)"
  >
    <rect
      :stroke="stroke"
      :stroke-dasharray="strokeDasharray"
      :stroke-linecap="strokeLinecap"
      :stroke-dashoffset="strokeDashoffset"
      :class="rectClass"
      class="
        size-[calc(100%-var(--border-svg-padding)*2)]
        [rx:var(--w-border-svg-rounded)]
        [stroke-width:var(--w-border-svg-stroke-width,2px)]
        [x:var(--border-svg-padding)]
        [y:var(--border-svg-padding)]
      "
    >
      <slot />
    </rect>
  </svg>
</template>

<script lang="ts" setup>
import type {SVGAttributes} from 'vue'

defineProps<{
  /** Color of the border, e.g. `currentColor`. */
  stroke?: string
  /** Dash pattern of the border, e.g. `4px 8px`. */
  strokeDasharray?: string
  /** Offset of the dash pattern, e.g. to animate it. */
  strokeDashoffset?: string
  /** Shape of the dashes' ends. */
  strokeLinecap?: SVGAttributes['stroke-linecap']
  /** Class of the border's `rect`. */
  rectClass?: string
}>()

defineSlots<{
  /** SVG animation elements for the border, such as an `animate` of `stroke-dashoffset`. */
  default?: () => void
}>()
</script>
