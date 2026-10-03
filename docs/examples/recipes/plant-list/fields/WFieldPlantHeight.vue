<template>
  <WListCardField
    :model-value="item.height < 100 ? `${ item.height } cm` : `${ item.height / 100 } m`"
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
  label: 'height',
  cssClass: 'basis-[6rem]',
  title: 'Height',
  field: 'height',
} as const satisfies ListField<Plant>
</script>
