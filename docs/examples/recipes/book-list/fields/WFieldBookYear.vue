<template>
  <WListCardField
    :model-value="item.year < 0 ? `${ -item.year } BC` : item.year"
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
  label: 'year',
  cssClass: 'basis-[7rem]',
  title: 'Year',
  field: 'year',
} as const satisfies ListField<Book>
</script>
