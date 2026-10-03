<template>
  <WListCardField
    :skeleton="skeleton"
    allow-open
  >
    <span
      class="flex items-center gap-1 py-1"
      :class="healthTone(item.health)"
    >
      <IconHealthcare class="square-4 text-tone list:hidden" />
      <!-- A meter that fills and changes tone with the score. -->
      <span class="bg-tone-soft h-1.5 w-12 shrink-0 overflow-hidden rounded-full">
        <span
          class="bg-tone-fill block h-full rounded-full"
          :style="{width: `${ item.health }%`}"
        />
      </span>

      <span class="text-tone text-xs font-semibold tabular-nums">{{ item.health }}</span>
    </span>
  </WListCardField>
</template>

<script lang="ts" setup>
import type {Plant} from '../models/Plant'

import type {FieldProps, ListField} from 'eco-vue-js/dist/components/List/types'

import WListCardField from 'eco-vue-js/dist/components/List/WListCardField.vue'

import IconHealthcare from 'eco-vue-js/dist/assets/icons/IconHealthcare'

import {healthTone} from '../models/PlantDisplay'

defineProps<FieldProps<Plant>>()

defineEmits<{
  (e: 'update:item', value: Plant): void
  (e: 'delete:item'): void
}>()
</script>

<script lang="ts">
export const meta = {
  label: 'health',
  cssClass: 'basis-[6.5rem]',
  title: 'Health',
  field: 'health',
} as const satisfies ListField<Plant>
</script>
