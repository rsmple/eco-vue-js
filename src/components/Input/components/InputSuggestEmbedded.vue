<template>
  <OverlayRegionPart region="header">
    <slot
      name="toggle"
      v-bind="{unclickable: undefined, isTop: false}"
    />
  </OverlayRegionPart>

  <!-- The options reach the edges of the frame, as in a menu, also when the frame pads a form around them. -->
  <div class="w-frame-bleed">
    <slot name="content" />
  </div>
</template>

<script setup lang="ts">
import OverlayRegionPart from '@/components/Modal/components/OverlayRegionPart.vue'
</script>
