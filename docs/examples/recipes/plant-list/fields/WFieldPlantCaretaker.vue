<template>
  <WListCardField
    :skeleton="skeleton"
    allow-open
  >
    <span class="flex items-center gap-2">
      <span
        class="surface-fill flex size-6 shrink-0 items-center justify-center rounded-full text-[0.625rem] font-semibold"
        :class="item.caretaker.tone"
      >
        {{ initials(item.caretaker.name) }}
      </span>

      <span class="truncate">{{ item.caretaker.name }}</span>
    </span>
  </WListCardField>
</template>

<script lang="ts" setup>
import type {Plant} from '../models/Plant'

import type {FieldProps, ListField} from 'eco-vue-js/dist/components/List/types'

import WListCardField from 'eco-vue-js/dist/components/List/WListCardField.vue'

import {initials} from '../../../shared/Gardener'

defineProps<FieldProps<Plant>>()

defineEmits<{
  (e: 'update:item', value: Plant): void
  (e: 'delete:item'): void
}>()
</script>

<script lang="ts">
export const meta = {
  label: 'caretaker',
  cssClass: 'basis-[9rem]',
  title: 'Caretaker',
  textFormat: item => item.caretaker.name,
} as const satisfies ListField<Plant>
</script>
