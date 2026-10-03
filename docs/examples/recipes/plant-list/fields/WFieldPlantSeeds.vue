<template>
  <WListCardField :skeleton="skeleton">
    <template #inner>
      <!-- Compact, 1.2K for 1234, with the full number in a tooltip. -->
      <WNumberFormatter
        :model-value="item.seeds"
        compact
        tag="span"
        class="tabular-nums"
      />
    </template>
  </WListCardField>
</template>

<script lang="ts" setup>
import type {Plant} from '../models/Plant'

import type {FieldProps, ListField} from 'eco-vue-js/dist/components/List/types'

import WListCardField from 'eco-vue-js/dist/components/List/WListCardField.vue'
import WNumberFormatter from 'eco-vue-js/dist/components/NumberFormatter/WNumberFormatter.vue'

defineProps<FieldProps<Plant>>()

defineEmits<{
  (e: 'update:item', value: Plant): void
  (e: 'delete:item'): void
}>()
</script>

<script lang="ts">
export const meta = {
  label: 'seeds',
  cssClass: 'basis-[6rem]',
  title: 'Seeds',
  field: 'seeds',
} as const satisfies ListField<Plant>
</script>
