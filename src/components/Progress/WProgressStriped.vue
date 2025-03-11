<template>
  <div
    class="relative h-2 w-full cursor-progress select-none overflow-clip rounded-lg"
    :class="{
      'button-gradient-primary': modelValue > 0,
      'bg-gray-200 dark:bg-gray-800': modelValue <= 0,
      'w-progress-striped before:animate-move-horizontal': modelValue > 0 && modelValue < 100,
      'before:animate-ticker before:absolute before:inset-0': modelValue >= 100 || modelValue <= 0,
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