<template>
  <WListCardField
    :model-value="item.title"
    :skeleton="skeleton"
    allow-open
    class="font-semibold"
  />
</template>

<script lang="ts" setup>
import type {Book} from '../models/Book'

import type {FieldProps, ListField} from 'eco-vue-js/dist/components/List/types'

import WListCardField from 'eco-vue-js/dist/components/List/WListCardField.vue'

defineProps<FieldProps<Book>>()

defineEmits<{
  (e: 'update:item', value: Book): void
  (e: 'delete:item'): void
}>()
</script>

<script lang="ts">
export const meta = {
  label: 'title',
  cssClass: 'flex-1 basis-[12rem]',
  title: 'Title',
  field: 'title',
  allowResize: true,
} as const satisfies ListField<Book>
</script>
