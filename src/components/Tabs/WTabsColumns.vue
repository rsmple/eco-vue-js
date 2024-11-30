<template>
  <WTabs
    v-if="isMobile"
    :names="names"
    :custom-slots="$slots.default?.()"
  />

  <div
    v-else
    class="grid grid-cols-[repeat(var(--w-columns-length),calc(50%-((var(--w-columns-length)-1)*var(--modal-wrapper-padding,2rem)/2)))] gap-[var(--modal-wrapper-padding,2rem)]"
    :style="{'--w-columns-length': $slots.default?.().length}"
  >
    <template
      v-for="(slot, index) in $slots.default?.()"
      :key="index"
    >
      <component
        :is="slot"
        :title="names[index]"
      />
    </template>
  </div>
</template>

<script lang="ts" setup>
import WTabs from '@/components/Tabs/WTabs.vue'

import {getIsMobile} from '@/utils/mobile'

defineProps<{
  names: string[]
}>()

const isMobile = getIsMobile()
</script>