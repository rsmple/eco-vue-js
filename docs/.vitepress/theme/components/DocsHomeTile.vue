<template>
  <div class="bg-default dark:bg-gray-850 dark:w-chart-heatmap-bg-gray-850 border-gray-200 dark:border-gray-800 grid content-start gap-4 rounded-2xl p-5">
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

<style scoped>
.docs-home-tile {
  border: 1px solid var(--color-gray-200);
  background: var(--color-default);
}

.dark .docs-home-tile {
  border-color: var(--color-gray-800);
  background: var(--color-gray-850);
}
</style>
