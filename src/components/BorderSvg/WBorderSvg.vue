<template>
  <svg
    fill="none"
    preserveAspectRatio="xMidYMid meet"
    class="pointer-events-none absolute inset-0 z-10 -m-[--w-border-svg-padding,0px] size-[calc(100%+var(--w-border-svg-padding,0px)*2)]"
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
        [stroke-width:--w-border-svg-stroke-width,2px]
        [x:--border-svg-padding]
        [y:--border-svg-padding]
      "
    >
      <slot />
    </rect>
  </svg>
</template>

<script lang="ts" setup>
import type {SVGAttributes} from 'vue'

defineProps<{
  stroke?: string
  strokeDasharray?: string
  strokeDashoffset?: string
  strokeLinecap?: SVGAttributes['stroke-linecap']
  rectClass?: string
}>()
</script>
