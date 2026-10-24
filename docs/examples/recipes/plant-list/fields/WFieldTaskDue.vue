<template>
  <WListCardField
    :skeleton="skeleton"
    allow-open
    :class="{'tone-negative text-tone': item.due < today}"
  >
    {{ dateFormat(item.due, {year: 'auto'}) }}
  </WListCardField>
</template>

<script lang="ts" setup>
import type {TaskItem} from '../models/Plant'

import type {FieldProps, ListField} from 'eco-vue-js/dist/components/List/types'
import {dateFormat, getStartOfDay} from 'eco-vue-js/dist/utils/dateTime'

import WListCardField from 'eco-vue-js/dist/components/List/WListCardField.vue'

defineProps<FieldProps<TaskItem>>()

defineEmits<{
  (e: 'update:item', value: TaskItem): void
  (e: 'delete:item'): void
}>()

// Overdue tasks are shown in red.
const today = getStartOfDay()
</script>

<script lang="ts">
export const meta = {
  label: 'due',
  width: '7.5rem',
  title: 'Due',
  textFormat: item => dateFormat(item.due),
} as const satisfies ListField<TaskItem>
</script>
