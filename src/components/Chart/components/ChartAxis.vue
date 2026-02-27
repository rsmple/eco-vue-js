<template>
  <g
    class="text-description font-medium"
    font-size="8"
    :transform="transform"
  >
    <template
      v-for="(item, index) in domain"
      :key="item"
    >
      <g
        v-if="item"
        :transform="`translate(${ orientation === 'x' ? `${scale(item)}, 0` : `0, ${scale(item)}`})`"
      >
        <text
          v-bind="
            orientation === 'x'
              ? {y: 8, dy: '0.72em', 'text-anchor': domain.length === 2 ? index === 0 ? 'start' : 'end' : 'middle'}
              : {y: index === 0 ? 8 : -8, dy: '0.32em', 'text-anchor': yRight ? 'end' : 'start'}
          "
          fill="currentcolor"
        >
          {{ format?.(item) ?? numberCompactFormatter.format(item) }}
        </text>
      </g>
    </template>
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
  yRight: boolean
}>()
</script>