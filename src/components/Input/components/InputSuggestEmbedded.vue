<template>
  <OverlayHeader>
    <slot
      name="toggle"
      v-bind="{unclickable: undefined, isTop: false}"
    />
  </OverlayHeader>

  <slot name="content" />
</template>

<script setup lang="ts">
import OverlayHeader from '@/components/Modal/components/OverlayHeader.vue'
</script>
