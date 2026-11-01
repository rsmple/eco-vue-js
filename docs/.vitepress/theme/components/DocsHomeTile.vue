<template>
  <div class="surface-card w-chart-heatmap-bg-surface grid content-start gap-4 [--w-card-padding:var(--inner-margin)]">
    <div class="flex items-center justify-between gap-2">
      <span class="font-semibold">{{ title }}</span>

      <a
        :href="withBase(link)"
        class="text-description hover:text-accent text-sm font-medium"
      >
        Docs →
      </a>
    </div>

    <slot />
  </div>
</template>

<script lang="ts" setup>
import {withBase} from 'vitepress'

defineProps<{
  title: string
  link: string
}>()
</script>
