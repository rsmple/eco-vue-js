<template>
  <WListCardField
    :skeleton="skeleton"
    class="tabular-nums"
  >
    <template #inner>
      <span class="flex items-center gap-1">
        <IconDrop class="tone-info text-tone-fill square-4" />
        {{ item.humidity }}%
      </span>
    </template>
  </WListCardField>
</template>

<script lang="ts" setup>
import type {Plant} from '../models/Plant'

import type {FieldProps, ListField} from 'eco-vue-js/dist/components/List/types'

import WListCardField from 'eco-vue-js/dist/components/List/WListCardField.vue'

import IconDrop from 'eco-vue-js/dist/assets/icons/IconDrop'

defineProps<FieldProps<Plant>>()

defineEmits<{
  (e: 'update:item', value: Plant): void
  (e: 'delete:item'): void
}>()
</script>

<script lang="ts">
export const meta = {
  label: 'humidity',
  cssClass: 'basis-[5rem]',
  title: 'Humidity',
  field: 'humidity',
  textFormat: item => `${ item.humidity }%`,
} as const satisfies ListField<Plant>
</script>
