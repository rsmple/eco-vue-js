<template>
  <WListCardField :skeleton="skeleton">
    <template #inner>
      <!-- Compact, 1.2K for 1234, with the full number in a tooltip. -->
      <WNumberFormatter
        :model-value="item.loans"
        compact
        tag="span"
        class="tabular-nums"
      />
    </template>
  </WListCardField>
</template>

<script lang="ts" setup>
import type {Book} from '../models/Book'

import type {FieldProps, ListField} from 'eco-vue-js/dist/components/List/types'

import WListCardField from 'eco-vue-js/dist/components/List/WListCardField.vue'
import WNumberFormatter from 'eco-vue-js/dist/components/NumberFormatter/WNumberFormatter.vue'

defineProps<FieldProps<Book>>()

defineEmits<{
  (e: 'update:item', value: Book): void
  (e: 'delete:item'): void
}>()
</script>

<script lang="ts">
export const meta = {
  label: 'loans',
  cssClass: 'basis-[6rem]',
  title: 'Loans',
  field: 'loans',
} as const satisfies ListField<Book>
</script>
