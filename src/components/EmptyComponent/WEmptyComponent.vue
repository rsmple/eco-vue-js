<template>
  <slot />
</template>

<script setup lang="ts">
defineOptions({inheritAttrs: false})

defineSlots<{
  /** Content rendered without a wrapping element. It gets no slot props. */
  default?: (props: {[key: string]: never}) => void
}>()
</script>