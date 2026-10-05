<template>
  <div class="flex flex-wrap items-center gap-4 [&_svg]:square-5">
    <span class="flex items-center gap-2"><WStatusIcon /> Not set</span>
    <span class="flex items-center gap-2"><WStatusIcon has-value /> Done</span>
    <span class="flex items-center gap-2"><WStatusIcon has-error /> Failed</span>
  </div>
</template>

<script lang="ts" setup>
import WStatusIcon from 'eco-vue-js/dist/components/Status/WStatusIcon.vue'
</script>
