<template>
  <WListCardField :skeleton="skeleton">
    <WChip
      :text="item.genre"
      :skeleton="skeleton"
    />
  </WListCardField>
</template>

<script lang="ts" setup>
import type {Book} from '../models/Book'

import type {FieldProps, ListField} from 'eco-vue-js/dist/components/List/types'

import WChip from 'eco-vue-js/dist/components/Chip/WChip.vue'
import WListCardField from 'eco-vue-js/dist/components/List/WListCardField.vue'

defineProps<FieldProps<Book>>()

defineEmits<{
  (e: 'update:item', value: Book): void
  (e: 'delete:item'): void
}>()
</script>

<script lang="ts">
export const meta = {
  label: 'genre',
  cssClass: 'basis-[8rem]',
  title: 'Genre',
  field: 'genre',
  // Used by CSV export and "copy as Markdown", which cannot render the chip.
  textFormat: item => item.genre,
} as const satisfies ListField<Book>
</script>
