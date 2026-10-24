<template>
  <WListCardField
    :skeleton="skeleton"
    allow-open
  >
    <span class="flex items-center gap-2">
      <span
        class="surface-fill flex size-6 shrink-0 items-center justify-center rounded-full text-[0.625rem] font-semibold"
        :class="item.tone"
      >
        {{ initials(item.name) }}
      </span>

      <span class="truncate">{{ item.name }}</span>
    </span>
  </WListCardField>
</template>

<script lang="ts" setup>
import type {Gardener} from '../../../shared/Gardener'

import type {FieldProps, ListField} from 'eco-vue-js/dist/components/List/types'

import WListCardField from 'eco-vue-js/dist/components/List/WListCardField.vue'

import {initials} from '../../../shared/Gardener'

defineProps<FieldProps<Gardener>>()

defineEmits<{
  (e: 'update:item', value: Gardener): void
  (e: 'delete:item'): void
}>()
</script>

<script lang="ts">
export const meta = {
  label: 'gardener',
  width: '11rem',
  title: 'Caretaker',
  textFormat: item => item.name,
} as const satisfies ListField<Gardener>
</script>
