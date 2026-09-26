<template>
  <ClientOnly>
    <div class="vp-raw">
      <WTooltipContainer />
      <WNotify />
      <WModal />
    </div>
  </ClientOnly>
</template>

<script lang="ts" setup>
import WModal from '@/components/Modal/WModal.vue'
import WNotify from '@/components/Notify/WNotify.vue'
import WTooltipContainer from '@/components/Tooltip/WTooltipContainer.vue'
</script>
