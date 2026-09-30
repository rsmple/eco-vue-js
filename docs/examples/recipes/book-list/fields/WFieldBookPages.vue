<template>
  <WListCardField
    :model-value="`${ item.pages } pages`"
    :skeleton="skeleton"
    class="tabular-nums"
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
  label: 'pages',
  cssClass: 'basis-[7rem]',
  title: 'Length',
  field: 'pages',
  // The number alone in CSV export, without the unit.
  textFormat: item => item.pages.toString(),
} as const satisfies ListField<Book>
</script>
