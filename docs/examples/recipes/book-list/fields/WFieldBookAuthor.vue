<template>
  <WListCardField
    :model-value="item.author"
    :skeleton="skeleton"
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
  label: 'author',
  cssClass: 'basis-[12rem]',
  title: 'Author',
  field: 'author',
  allowResize: true,
} as const satisfies ListField<Book>
</script>
