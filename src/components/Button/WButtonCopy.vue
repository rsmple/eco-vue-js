<template>
  <div
    class="text-description square-5 w-hover-circle relative inline-block cursor-pointer select-none"
    @click="doCopy()"
  >
    <component
      :is="iconCopy"
      class="-mt-px"
      :class="{
        'text-primary-default dark:text-primary-dark': copied
      }"
    />

    <WTooltip
      class="pointer-events-none"
      text="Copy"
      no-touch
    />
  </div>
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
