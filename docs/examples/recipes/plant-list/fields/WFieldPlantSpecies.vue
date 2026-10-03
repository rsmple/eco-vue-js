<template>
  <WListCardField
    :model-value="item.species"
    :skeleton="skeleton"
    allow-open
    class="italic"
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
  label: 'species',
  cssClass: 'basis-[10rem]',
  title: 'Species',
  field: 'species',
  allowResize: true,
} as const satisfies ListField<Plant>
</script>
