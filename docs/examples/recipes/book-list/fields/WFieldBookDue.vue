<template>
  <WListCardField
    :model-value="item.dueAt ? dateFormatShort(item.dueAt) : '—'"
    :skeleton="skeleton"
    :class="{
      'text-description': !item.dueAt,
      'tone-negative text-tone': item.dueAt && item.dueAt < today,
    }"
  />
</template>

<script lang="ts" setup>
import type {Book} from '../models/Book'

import type {FieldProps, ListField} from 'eco-vue-js/dist/components/List/types'
import {dateFormat, dateFormatShort, getStartOfDay} from 'eco-vue-js/dist/utils/dateTime'

import WListCardField from 'eco-vue-js/dist/components/List/WListCardField.vue'

defineProps<FieldProps<Book>>()

defineEmits<{
  (e: 'update:item', value: Book): void
  (e: 'delete:item'): void
}>()

// Overdue books are shown in red.
const today = getStartOfDay()
</script>

<script lang="ts">
export const meta = {
  label: 'due',
  cssClass: 'basis-[6rem]',
  title: 'Due',
  field: 'dueAt',
  textFormat: item => item.dueAt ? dateFormat(item.dueAt) : undefined,
} as const satisfies ListField<Book>
</script>
