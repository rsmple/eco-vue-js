<template>
  <WListCardField
    :model-value="item.name"
    :skeleton="skeleton"
    allow-open
    class="font-semibold"
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
  label: 'name',
  cssClass: 'flex-1 basis-[12rem]',
  title: 'Name',
  field: 'name',
  allowResize: true,
} as const satisfies ListField<Plant>
</script>
