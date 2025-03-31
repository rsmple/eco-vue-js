<template>
  <div
    class="relative h-2 w-full select-none overflow-clip rounded-lg"
    :class="{
      'button-gradient-primary': modelValue > 0,
      'bg-gray-200 dark:bg-gray-800': modelValue <= 0,
      'w-progress-striped before:animate-move-horizontal cursor-progress': modelValue > 0 && modelValue < 100,
      'before:absolute before:inset-0': modelValue >= 100 || modelValue <= 0,
      'before:animate-ticker before:via-default/50 before:bg-gradient-to-r before:from-transparent before:to-transparent': modelValue <= 0,
      'before:bg-default/50 before:animate-pulse': modelValue >= 100,
    }"
  >
    <div
      v-if="modelValue < 100 && modelValue > 0"
      class="absolute right-0 h-full bg-gray-200 transition-[width] dark:bg-gray-800"
      :style="{
        width: (100 - modelValue) + '%',
      }"
    />
  </div>
</template>

<script setup lang="ts">
defineProps<{
  modelValue: number
}>()
</script>