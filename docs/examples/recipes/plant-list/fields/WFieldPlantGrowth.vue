<template>
  <WListCardField
    :skeleton="skeleton"
    allow-open
  >
    <span class="tone-data-green flex items-center gap-2">
      <!-- A sparkline of the last six months, scaled to the plant's own range. -->
      <svg
        viewBox="0 0 50 16"
        class="text-tone h-4 w-12 shrink-0 overflow-visible"
        fill="none"
      >
        <polyline
          :points="points"
          stroke="currentColor"
          stroke-width="1.5"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
        <circle
          v-bind="last"
          r="2"
          fill="currentColor"
        />
      </svg>

      <span class="text-tone text-xs font-semibold tabular-nums">+{{ gain }} cm</span>
    </span>
  </WListCardField>
</template>

<script lang="ts" setup>
import type {Plant} from '../models/Plant'

import {computed} from 'vue'

import type {FieldProps, ListField} from 'eco-vue-js/dist/components/List/types'

import WListCardField from 'eco-vue-js/dist/components/List/WListCardField.vue'

const props = defineProps<FieldProps<Plant>>()

defineEmits<{
  (e: 'update:item', value: Plant): void
  (e: 'delete:item'): void
}>()

const coordinates = computed(() => {
  const heights = props.item.growth.map(point => point.height)
  const min = Math.min(...heights)
  const range = Math.max(...heights) - min || 1

  return heights.map((height, index) => ({cx: index * 10, cy: 15 - (height - min) / range * 14}))
})

const points = computed(() => coordinates.value.map(({cx, cy}) => `${ cx },${ cy }`).join(' '))
const last = computed(() => coordinates.value[coordinates.value.length - 1])
const gain = computed(() => getGain(props.item))
</script>

<script lang="ts">
const getGain = (item: Plant) => item.height - item.growth[0]!.height

export const meta = {
  label: 'growth',
  cssClass: 'basis-[8rem]',
  title: 'Growth',
  textFormat: item => `+${ getGain(item) } cm`,
} as const satisfies ListField<Plant>
</script>
