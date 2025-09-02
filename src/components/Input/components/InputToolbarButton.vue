<template>
  <button
    class="text-accent w-ripple w-ripple-hover group/toolbar first-not:-ml-px relative pb-1 pt-2"
    @click="$emit('click', $event)"
  >
    <div class="border-r border-solid border-gray-300 px-2 group-last/toolbar:border-r-0 dark:border-gray-600">
      <component
        :is="action.icon"
        class="square-[1.25em] -mt-[0.25em] inline"
      /> {{ action.title ?? '' }}
    </div>

    <WTooltip
      v-if="action.tooltip"
      :text="action.tooltip"
      top
    />
  </button>
</template>

<script setup lang="ts">
import type {ToolbarAction} from '@/components/Input/types'

import WTooltip from '@/components/Tooltip/WTooltip.vue'

defineProps<{
  action: ToolbarAction
}>()

defineEmits<{
  (e: 'click', value: MouseEvent): void
}>()
</script>