<template>
  <g
    class="text-description font-medium"
    font-size="8"
    :transform="transform"
  >
    <g
      v-for="item in domain"
      :key="item"
      :transform="`translate(${ orientation === 'x' ? `${scale(item)}, 0` : `0, ${scale(item)}`})`"
    >
      <line
        v-bind="orientation === 'x' ? {y2: 6} : {x2: -6}"
        stroke="currentcolor"
      />

      <text
        v-bind="
          orientation === 'x'
            ? {y: 8, dy: '0.72em', 'text-anchor': 'middle'}
            : {x: -9, dy: '0.32em', 'text-anchor': 'end'}
        "
        fill="currentcolor"
      >
        {{ format?.(item) ?? numberCompactFormatter.format(item) }}
      </text>
    </g>
  </g>
</template>

<script lang="ts" setup>
import {numberCompactFormatter} from '@/utils/utils'

defineProps<{
  orientation: 'x' | 'y'
  scale: (value: number) => number
  domain: [number, number]
  format: ((value: number) => string) | undefined
  transform: string
}>()
</script>