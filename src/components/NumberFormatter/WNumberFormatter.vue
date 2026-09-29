<template>
  <component :is="tag ?? WEmptyComponent">
    {{ compact ? formattedCompact : formatted }}

    <WTooltip
      v-if="compact && formattedCompact !== formatted"
      :text="formatted"
      :no-touch="noTouch"
    />
  </component>
</template>  

<script setup lang="ts">
import {computed} from 'vue'

import WEmptyComponent from '@/components/EmptyComponent/WEmptyComponent.vue'
import WTooltip from '@/components/Tooltip/WTooltip.vue'

import {numberCompactFormatter, numberFormatter, percentCompactFormatter, percentFormatter} from '@/utils/utils'

const props = defineProps<{
  /** Number to show. With `percent`, a fraction: 0.25 is 25%. */
  modelValue: number
  /** Formats the number as a percentage. */
  percent?: boolean
  /** Formats the number in compact notation, 1.2K for 1234, with the full number in a tooltip. */
  compact?: boolean
  /** Element to wrap the number in. Without it the number is plain text, and the tooltip attaches to the parent element. */
  tag?: string
  /** Skips the tooltip on touch devices. */
  noTouch?: boolean
}>()

const formattedCompact = computed(() => (props.percent ? percentCompactFormatter : numberCompactFormatter).format(props.modelValue))
const formatted = computed(() => (props.percent ? percentFormatter : numberFormatter).format(props.modelValue))
</script>