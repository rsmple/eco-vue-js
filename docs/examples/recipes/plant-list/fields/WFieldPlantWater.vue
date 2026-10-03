<template>
  <WListCardField
    :skeleton="skeleton"
    allow-open
    class="tabular-nums card:text-xs"
  >
    <template #inner>
      <span class="list:hidden">{{ meta.title }}: </span>
      {{ `${ item.water } ml` }}
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
  label: 'water',
  cssClass: 'basis-[6rem]',
  title: 'Water',
  field: 'water',
  // The number alone in CSV export, without the unit.
  textFormat: item => item.water.toString(),
} as const satisfies ListField<Plant>
</script>
