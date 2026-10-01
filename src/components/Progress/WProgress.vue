<template>
  <div class="h-1 w-full bg-surface-inset">
    <div
      class="tone-primary bg-tone-fill h-full transition-[width]"
      :style="{
        width: modelValue + '%',
      }"
    />
  </div>
</template>

<script setup lang="ts">
defineProps<{
  /** Filled part, from 0 to 100. */
  modelValue: number
}>()
</script>