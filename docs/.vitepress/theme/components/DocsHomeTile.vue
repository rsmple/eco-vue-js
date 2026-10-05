<template>
  <div class="bg-surface-subtle w-chart-heatmap-bg-surface-subtle border-line-raised grid content-start gap-4 rounded-2xl p-(--inner-margin)">
    <div class="flex items-center justify-between gap-2">
      <span class="font-semibold">{{ title }}</span>

      <a
        :href="withBase(link)"
        class="text-description hover:text-accent text-sm font-medium transition-colors"
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
