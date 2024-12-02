<template>
  <slot />
</template>

<script setup lang="ts">
defineProps<{
  title: string
  name: string
  icon?: SVGComponent
}>()

defineSlots<{
  default?: () => void
  title?: () => void
  suffix?: () => void
  right?: () => void
}>()
</script>