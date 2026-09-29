<template>
  <div class="[counter-reset:section]">
    <slot />
  </div>
</template>

<script setup lang="ts">
defineSlots<{
  /** WPage pages and WPageTitle headings, numbered from 1. */
  default?: () => void
}>()
</script>