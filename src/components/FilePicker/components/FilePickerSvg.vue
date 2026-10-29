<template>
  <WBorderSvg
    stroke="currentColor"
    stroke-linecap="round"
    stroke-dasharray="4px 8px"
    :rect-class="animate ? 'animate-border-march' : undefined"
  />
</template>

<script lang="ts" setup>
import WBorderSvg from '@/components/BorderSvg/WBorderSvg.vue'

defineProps<{
  animate?: boolean
}>()
</script>
