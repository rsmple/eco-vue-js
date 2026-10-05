<template>
  <div class="flex flex-wrap gap-6">
    <WImageViewer
      :model-value="monstera"
      title="Photo"
    />

    <WImageViewer
      :model-value="monstera"
      title="Loading"
      skeleton
    />
  </div>
</template>

<script lang="ts" setup>
import WImageViewer from 'eco-vue-js/dist/components/ImageViewer/WImageViewer.vue'

import monstera from './images/monstera.svg?url&no-inline'
</script>
