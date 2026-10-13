<template>
  <span class="select-none relative inline-grid items-center justify-center min-w-[1.25em]">
    <template v-if="!noInline">&nbsp;</template>
    <button
      class="text-description inline-block p-2 -m-2 w-hover-circle-trigger cursor-pointer"
      :class="noInline ? undefined : 'absolute'"
      @click.stop="doCopy()"
    >
      <div class="w-hover-circle relative">
        <component
          :is="iconCopy"
          class="square-[1.25em]"
          :class="{
            'tone-primary text-tone': copied
          }"
        />
      </div>

      <WTooltip
        class="pointer-events-none"
        text="Copy"
        no-touch
      />
    </button>
  </span>
</template>

<script lang="ts" setup>
import {toRef} from 'vue'

import WTooltip from '@/components/Tooltip/WTooltip.vue'

import {useCopy} from '@/utils/useCopy'

const props = defineProps<{
  /** Text copied to the clipboard on click. */
  value: string
  /** Lays the button out as a regular block instead of sizing it to one line of the surrounding text. */
  noInline?: boolean
}>()

const {doCopy, iconCopy, copied} = useCopy(toRef(props, 'value'))
</script>
