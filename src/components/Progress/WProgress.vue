<template>
  <div class="h-1 w-full bg-gray-200 dark:bg-gray-700">
    <div
      class="bg-primary-default dark:bg-primary-dark h-full transition-[width]"
      :style="{
        width: modelValue + '%',
      }"
    />
  </div>
</template>

<script setup lang="ts">
defineProps<{
  modelValue: number
}>()
</script>