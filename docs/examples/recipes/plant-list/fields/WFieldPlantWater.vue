<template>
  <WListCardField
    :model-value="`${ item.water } ml`"
    :skeleton="skeleton"
    class="tabular-nums"
  />
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
  cssClass: 'basis-[7rem]',
  title: 'Water',
  field: 'water',
  // The number alone in CSV export, without the unit.
  textFormat: item => item.water.toString(),
} as const satisfies ListField<Plant>
</script>
