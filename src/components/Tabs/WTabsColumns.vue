<template>
  <WTabs v-if="isMobile">
    <slot />
  </WTabs>

  <div
    v-else
    class="grid grid-cols-[repeat(var(--w-columns-length),calc(50%-((var(--w-columns-length)-1)*var(--w-modal-wrapper-padding,2rem)/2)))] gap-[var(--w-modal-wrapper-padding,2rem)]"
    :style="{'--w-columns-length': $slots.default?.().length}"
  >
    <template
      v-for="(slot, index) in $slots.default?.()"
      :key="index"
    >
      <component :is="slot" />
    </template>
  </div>
</template>

<script lang="ts" setup>
import WTabs from '@/components/Tabs/WTabs.vue'

import {useIsMobile} from '@/utils/mobile'

const {isMobile} = useIsMobile()

defineSlots<{
  default: () => []
}>()
</script>