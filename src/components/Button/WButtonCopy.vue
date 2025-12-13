<template>
  <button
    class="text-description w-hover-circle relative inline-block cursor-pointer select-none"
    @click="doCopy()"
  >
    <component
      :is="iconCopy"
      class="square-[1.25em] mt-[-0.125em]"
      :class="{
        'text-primary dark:text-primary-dark': copied
      }"
    />

    <WTooltip
      class="pointer-events-none"
      text="Copy"
      no-touch
    />
  </button>
</template>

<script lang="ts" setup>
import {toRef} from 'vue'

import WTooltip from '@/components/Tooltip/WTooltip.vue'

import {useCopy} from '@/utils/useCopy'

const props = defineProps<{
  value: string
}>()

const {doCopy, iconCopy, copied} = useCopy(toRef(props, 'value'))
</script>
