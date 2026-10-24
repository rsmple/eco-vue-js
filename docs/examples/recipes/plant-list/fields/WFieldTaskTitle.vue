<template>
  <WListCardField
    :model-value="item.title"
    :skeleton="skeleton"
    allow-open
  />
</template>

<script lang="ts" setup>
import type {TaskItem} from '../models/Plant'

import type {FieldProps, ListField} from 'eco-vue-js/dist/components/List/types'

import WListCardField from 'eco-vue-js/dist/components/List/WListCardField.vue'

defineProps<FieldProps<TaskItem>>()

defineEmits<{
  (e: 'update:item', value: TaskItem): void
  (e: 'delete:item'): void
}>()
</script>

<script lang="ts">
export const meta = {
  label: 'task',
  width: '7rem',
  title: 'Task',
  textFormat: item => item.title,
} as const satisfies ListField<TaskItem>
</script>
