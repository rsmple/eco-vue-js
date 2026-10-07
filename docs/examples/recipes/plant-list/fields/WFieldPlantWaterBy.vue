<template>
  <WListCardField
    :skeleton="skeleton"
    allow-open
    :class="{
      'text-description': !item.waterBy,
      'tone-negative text-tone': item.waterBy && item.waterBy < today,
    }"
    class="card:text-xs"
  >
    <template #inner>
      <span class="list:hidden">{{ meta.title }}: </span>
      {{ item.waterBy ? dateFormat(item.waterBy, {year: 'auto'}) : '-' }}
    </template>
  </WListCardField>
</template>

<script lang="ts" setup>
import type {Plant} from '../models/Plant'

import type {FieldProps, ListField} from 'eco-vue-js/dist/components/List/types'
import {dateFormat, getStartOfDay} from 'eco-vue-js/dist/utils/dateTime'

import WListCardField from 'eco-vue-js/dist/components/List/WListCardField.vue'

defineProps<FieldProps<Plant>>()

defineEmits<{
  (e: 'update:item', value: Plant): void
  (e: 'delete:item'): void
}>()

// Overdue plants are shown in red.
const today = getStartOfDay()
</script>

<script lang="ts">
export const meta = {
  label: 'due',
  cssClass: 'basis-[8rem]',
  title: 'Water by',
  field: 'waterBy',
  textFormat: item => item.waterBy ? dateFormat(item.waterBy) : undefined,
} as const satisfies ListField<Plant>
</script>
