<template>
  <WListCardField
    :model-value="item.role"
    :skeleton="skeleton"
    allow-open
    class="text-description card:text-xs card:mt-2"
  />
</template>

<script lang="ts" setup>
import type {Gardener} from '../../../shared/Gardener'

import type {FieldProps, ListField} from 'eco-vue-js/dist/components/List/types'

import WListCardField from 'eco-vue-js/dist/components/List/WListCardField.vue'

defineProps<FieldProps<Gardener>>()

defineEmits<{
  (e: 'update:item', value: Gardener): void
  (e: 'delete:item'): void
}>()
</script>

<script lang="ts">
export const meta = {
  label: 'role',
  width: '7rem',
  title: 'Role',
  textFormat: item => item.role,
  allowResize: true,
} as const satisfies ListField<Gardener>
</script>
