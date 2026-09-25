<template>
  <WListCardField :skeleton="skeleton">
    <WChip
      :text="item.available ? 'Available' : 'Borrowed'"
      :semantic-type="item.available ? SemanticType.POSITIVE : SemanticType.WARNING"
      :skeleton="skeleton"
    />
  </WListCardField>
</template>

<script lang="ts" setup>
import type {Book} from '../models/Book'

import type {FieldProps, ListField} from 'eco-vue-js/dist/components/List/types'
import {SemanticType} from 'eco-vue-js/dist/utils/SemanticType'

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
  label: 'available',
  cssClass: 'basis-[8rem]',
  title: 'Status',
  field: 'available',
  textFormat: item => item.available ? 'Available' : 'Borrowed',
} as const satisfies ListField<Book>
</script>
