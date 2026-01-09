<template>
  <WBorderSvg
    stroke="currentColor"
    stroke-linecap="round"
    stroke-dasharray="4px 8px"
  >
    <animate
      v-if="animate"
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
  animate?: boolean
}>()
</script>