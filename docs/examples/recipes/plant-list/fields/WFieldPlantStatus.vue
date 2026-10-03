<template>
  <WListCardField
    :skeleton="skeleton"
    allow-open
  >
    <WChip
      :text="item.watered ? 'Watered' : 'Thirsty'"
      :semantic-type="item.watered ? SemanticType.POSITIVE : SemanticType.WARNING"
      :skeleton="skeleton"
    />
  </WListCardField>
</template>

<script lang="ts" setup>
import type {Plant} from '../models/Plant'

import type {FieldProps, ListField} from 'eco-vue-js/dist/components/List/types'
import {SemanticType} from 'eco-vue-js/dist/utils/SemanticType'

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
  label: 'watered',
  cssClass: 'basis-[7rem]',
  title: 'Status',
  field: 'watered',
  textFormat: item => item.watered ? 'Watered' : 'Thirsty',
} as const satisfies ListField<Plant>
</script>
