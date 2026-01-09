<template>
  <WBorderSvg
    stroke="currentColor"
    stroke-linecap="round"
    stroke-dasharray="4px 8px"
  >
    <animate
      v-if="isActive"
      attributeName="stroke-dashoffset"
      from="0px"
      to="-12px"
      dur="0.5s"
      repeatCount="indefinite"
    />
  </WBorderSvg>
</template>

<script lang="ts" setup>
import WBorderSvg from '@/components/BorderSvg/WBorderSvg.vue'

defineProps<{
  isActive?: boolean
}>()
</script>