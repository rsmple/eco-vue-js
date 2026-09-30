<template>
  <WListCardField
    :skeleton="skeleton"
    class="tabular-nums"
  >
    <template #inner>
      <span class="flex items-center gap-1">
        <IconStar class="text-warning dark:text-warning-dark square-4 fill-current" />
        {{ item.rating.toFixed(1) }}
      </span>
    </template>
  </WListCardField>
</template>

<script lang="ts" setup>
import type {Book} from '../models/Book'

import type {FieldProps, ListField} from 'eco-vue-js/dist/components/List/types'

import WListCardField from 'eco-vue-js/dist/components/List/WListCardField.vue'

import IconStar from 'eco-vue-js/dist/assets/icons/IconStar'

defineProps<FieldProps<Book>>()

defineEmits<{
  (e: 'update:item', value: Book): void
  (e: 'delete:item'): void
}>()
</script>

<script lang="ts">
export const meta = {
  label: 'rating',
  cssClass: 'basis-[5rem]',
  title: 'Rating',
  field: 'rating',
  textFormat: item => item.rating.toFixed(1),
} as const satisfies ListField<Book>
</script>
