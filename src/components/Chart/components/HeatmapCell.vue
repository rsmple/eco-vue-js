<template>
  <div
    class="group/cell relative rounded-sm p-[--w-chart-heatmap-gap,0.125rem]"
    :class="opacity !== null ? 'cursor-crosshair' : undefined"
  >
    <div
      class="size-[--w-chart-heatmap-size,1rem] rounded-sm"
      :class="opacity !== null ? 'bg-current' : undefined"
      :style="opacity !== null ? {opacity} : undefined"
    />

    <template v-if="$slots.default && opacity !== null">
      <div class="absolute inset-[--w-chart-heatmap-gap,0.125rem] rounded-sm border-current group-hover/cell:border" />

      <WTooltip :delay="500">
        <slot />
      </WTooltip>
    </template>
  </div>
</template>

<script setup lang="ts">
import WTooltip from '@/components/Tooltip/WTooltip.vue'

defineProps<{
  opacity: number | null
}>()
</script>