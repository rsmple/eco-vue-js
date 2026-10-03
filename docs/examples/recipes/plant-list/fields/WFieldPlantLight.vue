<template>
  <WListCardField
    :skeleton="skeleton"
    allow-open
  >
    <span
      class="flex items-center gap-1.5"
      :class="lightDisplay[item.light].tone"
    >
      <component
        :is="lightDisplay[item.light].icon"
        class="text-tone square-4.5 shrink-0"
      />
      <span class="truncate">{{ lightDisplay[item.light].label }}</span>
    </span>
  </WListCardField>
</template>

<script lang="ts" setup>
import type {Plant} from '../models/Plant'

import type {FieldProps, ListField} from 'eco-vue-js/dist/components/List/types'

import WListCardField from 'eco-vue-js/dist/components/List/WListCardField.vue'

import {lightDisplay} from '../models/PlantDisplay'

defineProps<FieldProps<Plant>>()

defineEmits<{
  (e: 'update:item', value: Plant): void
  (e: 'delete:item'): void
}>()
</script>

<script lang="ts">
export const meta = {
  label: 'light',
  cssClass: 'basis-[7rem]',
  title: 'Light',
  field: 'light',
  textFormat: item => lightDisplay[item.light].label,
} as const satisfies ListField<Plant>
</script>
