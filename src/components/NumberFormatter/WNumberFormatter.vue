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
  modelValue: number
  percent?: boolean
  compact?: boolean
  tag?: string
  noTouch?: boolean
}>()

const formattedCompact = computed(() => (props.percent ? percentCompactFormatter : numberCompactFormatter).format(props.modelValue))
const formatted = computed(() => (props.percent ? percentFormatter : numberFormatter).format(props.modelValue))
</script>