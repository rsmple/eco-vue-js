<template>
  <WListCardField :skeleton="skeleton">
    <WChip
      :text="item.kind"
      :skeleton="skeleton"
    />
  </WListCardField>
</template>

<script lang="ts" setup>
import type {Plant} from '../models/Plant'

import type {FieldProps, ListField} from 'eco-vue-js/dist/components/List/types'

import WChip from 'eco-vue-js/dist/components/Chip/WChip.vue'
import WListCardField from 'eco-vue-js/dist/components/List/WListCardField.vue'

defineProps<FieldProps<Plant>>()

defineEmits<{
  (e: 'update:item', value: Plant): void
  (e: 'delete:item'): void
}>()
</script>

<script lang="ts">
export const meta = {
  label: 'kind',
  cssClass: 'basis-[8rem]',
  title: 'Kind',
  field: 'kind',
  // Used by CSV export and "copy as Markdown", which cannot render the chip.
  textFormat: item => item.kind,
} as const satisfies ListField<Plant>
</script>
