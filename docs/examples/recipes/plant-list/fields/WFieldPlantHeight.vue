<template>
  <WListCardField
    :skeleton="skeleton"
    allow-open
    class="tabular-nums card:text-xs"
  >
    <template #inner>
      <span class="list:hidden">{{ meta.title }}: </span>
      {{ item.height < 100 ? `${ item.height } cm` : `${ item.height / 100 } m` }}
    </template>
  </WListCardField>
</template>

<script lang="ts" setup>
import type {Plant} from '../models/Plant'

import type {FieldProps, ListField} from 'eco-vue-js/dist/components/List/types'

import WListCardField from 'eco-vue-js/dist/components/List/WListCardField.vue'

defineProps<FieldProps<Plant>>()

defineEmits<{
  (e: 'update:item', value: Plant): void
  (e: 'delete:item'): void
}>()
</script>

<script lang="ts">
export const meta = {
  label: 'height',
  cssClass: 'basis-[5rem]',
  title: 'Height',
  field: 'height',
} as const satisfies ListField<Plant>
</script>
