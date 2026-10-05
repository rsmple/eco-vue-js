<template>
  <ClientOnly>
    <div class="vp-raw">
      <WTooltipContainer />
      <WNotify :position="notifyPosition" />
      <WModal />
    </div>
  </ClientOnly>
</template>

<script lang="ts" setup>
import WModal from '@/components/Modal/WModal.vue'
import WNotify from '@/components/Notify/WNotify.vue'
import WTooltipContainer from '@/components/Tooltip/WTooltipContainer.vue'

import {notifyPosition} from '../notifyPosition'
</script>
